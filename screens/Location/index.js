import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  Button,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../../api/api_instance";
import ProminentDisclosureModal from "../../components/ProminentDisclosureModal";
import { DISCLOSURE } from "../../constants/disclosureContent";
import { CONSENT_KEYS, grantConsent, hasConsent } from "../../utils/disclosureConsent";

// Distance calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const formatDistance = (km) => {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(2)} km`;
};

const LocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childLocation, setChildLocation] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [locationConsentGranted, setLocationConsentGranted] = useState(false);

  // Fetch user and device list
  const getuserData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await instance.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Send location request command
  const LocationRequest = async (trackId) => {
    if (!trackId) return;
    setRequestLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await instance.post(
        "/control/send-command",
        { trackId, command: "REQUEST_LOCATION" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("LocationRequest response:", JSON.stringify(res.data));
      Alert.alert("Command Sent", "Location request sent.");
    } catch (error) {
      console.log("LocationRequest error:", JSON.stringify(error?.response?.data || error.message));
      Alert.alert("Error", error?.response?.data?.message || error.message);
    } finally {
      setRequestLoading(false);
    }
  };

  // Fetch child location history
  const locatonlist = async (trackId) => {
    try {
      const res = await instance.get(`/locations/${trackId}/history?page=1&limit=10`);
      console.log("locatonlist response:", JSON.stringify(res.data));
      const locationlist = res?.data?.data?.locations;
      if (locationlist && locationlist.length > 0) {
        const latestLocation = locationlist[0];
        setChildLocation({
          latitude: Number(latestLocation.latitude),
          longitude: Number(latestLocation.longitude),
        });
      } else {
        setChildLocation(null);
      }
    } catch (error) {
      console.log("locatonlist error:", JSON.stringify(error?.response?.data || error.message));
      setChildLocation(null);
    }
  };

  // Load devices on mount
  useEffect(() => {
    getuserData();
  }, []);

  // Permission
  const requestLocationPermission = async () => {
    if (Platform.OS === "ios") {
      getCurrentLocation();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => setLocation(position.coords),
      (error) => setErrorMsg(error.message),
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    const initConsent = async () => {
      const accepted = await hasConsent(CONSENT_KEYS.LOCATION);
      setLocationConsentGranted(accepted);
      setShowDisclosure(!accepted);
      setConsentChecked(true);
      if (accepted) {
        requestLocationPermission();
      }
    };
    initConsent();
  }, []);

  const handleLocationConsentAgree = async () => {
    await grantConsent(CONSENT_KEYS.LOCATION);
    setLocationConsentGranted(true);
    setShowDisclosure(false);
    requestLocationPermission();
  };

  const handleLocationConsentDecline = () => {
    setShowDisclosure(false);
    setErrorMsg('Location permission was not granted. You can enable it later from this screen.');
  };

  // Device selection handler
  const handleSelectChild = (trackId) => {
    setSelectedChild(trackId);
    setChildLocation(null);
    LocationRequest(trackId); // send command
    locatonlist(trackId); // fetch location
  };

  // Live tracking interval
  useEffect(() => {
    if (!selectedChild) return;
    const interval = setInterval(() => {
      locatonlist(selectedChild);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedChild]);

  if (!consentChecked) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6a1b9a" />
      </View>
    );
  }

  if (!locationConsentGranted && !location && !errorMsg) {
    return (
      <View style={styles.loader}>
        <Text style={styles.consentHint}>Location disclosure is required to use this feature.</Text>
        <TouchableOpacity style={styles.consentBtn} onPress={() => setShowDisclosure(true)}>
          <Text style={styles.consentBtnText}>Review Disclosure</Text>
        </TouchableOpacity>
        <ProminentDisclosureModal
          visible={showDisclosure}
          {...DISCLOSURE.LOCATION}
          onAgree={handleLocationConsentAgree}
          onDecline={handleLocationConsentDecline}
        />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loader}>
        {errorMsg ? (
          <Text style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#6a1b9a" />
            <Text>Fetching current location...</Text>
          </>
        )}
      </View>
    );
  }

  const distanceText =
    childLocation &&
    formatDistance(
      getDistance(
        location.latitude,
        location.longitude,
        childLocation.latitude,
        childLocation.longitude
      )
    );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        region={{
          latitude: childLocation?.latitude || location.latitude,
          longitude: childLocation?.longitude || location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Parent */}
        <Marker coordinate={location} title="Parent Location" pinColor="red" />

        {/* Child */}
        {childLocation && (
          <>
            <Marker coordinate={childLocation} title="Child Location" pinColor="green" />

            {/* Distance Badge */}
            <Marker
              coordinate={childLocation}
              anchor={{ x: 0.5, y: -0.5 }}
              tracksViewChanges={true}
            >
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{distanceText}</Text>
              </View>
            </Marker>
          </>
        )}

        {/* Tracking Line */}
        {childLocation && <Polyline coordinates={[location, childLocation]} strokeWidth={4} strokeColor="blue" />}
      </MapView>

      {/* Device List */}
      <View style={styles.topPanel}>
        <Text style={styles.panelTitle}>Device Lists</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={user?.children}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.deviceItem,
                selectedChild === item.child?.trackId && styles.activeDevice,
              ]}
              onPress={() => handleSelectChild(item.child?.trackId)}
            >
              <Text
                style={[
                  styles.deviceSub,
                  selectedChild === item.child?.trackId && { color: "#fff" },
                ]}
              >
                {item.child?.deviceBrand}
              </Text>
            </TouchableOpacity>
          )}
        />
        {/* Request Location Button */}
        {selectedChild && (
          <View style={{ marginTop: 10 }}>
            <Button
              title={requestLoading ? "Sending..." : "Request Location"}
              onPress={() => LocationRequest(selectedChild)}
              disabled={requestLoading}
              color="#6a1b9a"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  consentHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  consentBtn: {
    backgroundColor: '#6b21a8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  consentBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  topPanel: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 5,
  },
  panelTitle: { fontWeight: "600", marginBottom: 8 },
  deviceItem: {
    backgroundColor: "#eee",
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  activeDevice: { backgroundColor: "#6a1b9a" },
  deviceSub: { fontSize: 12, color: "#333" },
  distanceBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  distanceText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});

export default LocationScreen;