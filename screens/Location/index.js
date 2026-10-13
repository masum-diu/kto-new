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
  TextInput,
  ScrollView,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Circle, Polygon } from "react-native-maps";
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

  // Geofences: "live" tab shows tracking, "circle" / "polygon" tabs place and list that shape type.
  const [mode, setMode] = useState("live");
  const [geofences, setGeofences] = useState([]);
  const [gfName, setGfName] = useState("");
  const [gfNotes, setGfNotes] = useState("");
  const [gfCenter, setGfCenter] = useState(null);
  const [gfRadius, setGfRadius] = useState(200);
  const [gfPoints, setGfPoints] = useState([]);
  const [gfSaving, setGfSaving] = useState(false);
  const [gfError, setGfError] = useState(null);

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

  // Picks the most recent record by timestamp instead of trusting API ordering -
  // some history endpoints return oldest-first, which would otherwise pin the
  // map to the very first ever recorded (often far-away) location forever.
  const pickLatestLocation = (locationlist) => {
    if (!locationlist || locationlist.length === 0) return null;
    const getTs = (item) =>
      Number(
        item?.capturedAtMs ??
          item?.capturedAt ??
          item?.timestampMs ??
          item?.createdAtMs ??
          (item?.createdAt ? Date.parse(item.createdAt) : NaN) ??
          (item?.updatedAt ? Date.parse(item.updatedAt) : NaN)
      ) || 0;
    return locationlist.reduce((latest, item) => (getTs(item) > getTs(latest) ? item : latest), locationlist[0]);
  };

  // Fetch child location history
  const locatonlist = async (trackId) => {
    try {
      const res = await instance.get(`/locations/${trackId}/history?page=1&limit=10`);
      console.log("locatonlist response:", JSON.stringify(res.data));
      const locationlist = res?.data?.data?.locations;
      const latestLocation = pickLatestLocation(locationlist);
      if (latestLocation) {
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

  const geofenceError = (e) => {
    const body = e?.response?.data;
    const details = body?.errorMessages?.map?.((m) => m?.message).filter(Boolean).join("\n");
    return details || body?.message || e?.message || "Something went wrong";
  };

  // GET /geofences/{track_id}
  const loadGeofences = async (trackId) => {
    if (!trackId) return;
    try {
      const res = await instance.get(`/geofences/${trackId}`);
      const data = res?.data?.data;
      // The API returns { data: { zones: [...] } }.
      const list = Array.isArray(data) ? data : data?.zones ?? data?.geofences;
      setGeofences(Array.isArray(list) ? list : []);
      setGfError(null);
    } catch (error) {
      console.log("[geofences] load failed", error?.response?.status, error?.response?.data || error?.message);
      setGeofences([]);
      setGfError(`Could not load geofences: ${geofenceError(error)}`);
    }
  };

  const resetGeofenceDraft = () => {
    setGfName("");
    setGfNotes("");
    setGfCenter(null);
    setGfPoints([]);
    setGfRadius(200);
  };

  const changeMode = (next) => {
    setMode(next);
    resetGeofenceDraft();
  };

  const onMapPress = (e) => {
    if (mode === "live") return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (mode === "circle") setGfCenter({ latitude, longitude });
    else setGfPoints((prev) => [...prev, { latitude, longitude }]);
  };

  // POST /geofences
  const saveGeofence = async () => {
    if (!selectedChild) return Alert.alert("Geofence", "Select a device first.");
    if (!gfName.trim()) return Alert.alert("Geofence", "Please enter a name.");

    const payload = { trackId: selectedChild, name: gfName.trim(), type: mode };
    if (gfNotes.trim()) payload.notes = gfNotes.trim();
    if (mode === "circle") {
      if (!gfCenter) return Alert.alert("Geofence", "Tap the map to place the circle center.");
      payload.centerLat = gfCenter.latitude;
      payload.centerLng = gfCenter.longitude;
      payload.radiusMeters = gfRadius;
    } else {
      if (gfPoints.length < 3) return Alert.alert("Geofence", "Tap at least 3 points on the map.");
      payload.paths = gfPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }));
    }

    try {
      setGfSaving(true);
      await instance.post("/geofences", payload);
      resetGeofenceDraft();
      await loadGeofences(selectedChild);
    } catch (error) {
      console.log("[geofences] save failed", error?.response?.status, error?.response?.data || error?.message);
      Alert.alert("Could not save geofence", geofenceError(error));
    } finally {
      setGfSaving(false);
    }
  };

  const deleteGeofence = (item) => {
    Alert.alert("Delete geofence", `Delete "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await instance.delete(`/geofences/${item.id}`);
            setGeofences((prev) => prev.filter((g) => g.id !== item.id));
          } catch (error) {
            Alert.alert("Could not delete geofence", geofenceError(error));
          }
        },
      },
    ]);
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
    setErrorMsg(null);
    // Try GPS first (works on emulators with a mock fix); fall back to network location.
    Geolocation.getCurrentPosition(
      (position) => setLocation(position.coords),
      () => {
        Geolocation.getCurrentPosition(
          (position) => setLocation(position.coords),
          (error) => setErrorMsg(error.message),
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
    setGeofences([]);
    setGfError(null);
    LocationRequest(trackId); // send command
    locatonlist(trackId); // fetch location
    loadGeofences(trackId); // fetch circles / polygons
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

  const visibleGeofences = geofences.filter((g) => mode === "live" || g.type === mode);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        onPress={onMapPress}
        // Only follow the child in the live tab; in geofence tabs the map must stay where the user panned.
        region={
          mode === "live"
            ? {
                latitude: childLocation?.latitude || location.latitude,
                longitude: childLocation?.longitude || location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
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

        {/* Saved geofences (live tab shows both types) */}
        {visibleGeofences.map((g) =>
          g.type === "polygon" ? (
            <Polygon
              key={`gf-${g.id}`}
              coordinates={(g.paths || []).map((p) => ({ latitude: Number(p.lat), longitude: Number(p.lng) }))}
              strokeColor="#6d16a2"
              fillColor="rgba(109,22,162,0.2)"
              strokeWidth={2}
            />
          ) : (
            <Circle
              key={`gf-${g.id}`}
              center={{ latitude: Number(g.centerLat), longitude: Number(g.centerLng) }}
              radius={Number(g.radiusMeters)}
              strokeColor="#6d16a2"
              fillColor="rgba(109,22,162,0.2)"
              strokeWidth={2}
            />
          )
        )}

        {/* Shape being drawn */}
        {mode === "circle" && gfCenter && (
          <>
            <Marker coordinate={gfCenter} pinColor="orange" />
            <Circle center={gfCenter} radius={gfRadius} strokeColor="#e53935" fillColor="rgba(229,57,53,0.2)" strokeWidth={2} />
          </>
        )}
        {mode === "polygon" && gfPoints.map((p, i) => <Marker key={`pt-${i}`} coordinate={p} pinColor="orange" />)}
        {mode === "polygon" && gfPoints.length >= 3 && (
          <Polygon coordinates={gfPoints} strokeColor="#e53935" fillColor="rgba(229,57,53,0.2)" strokeWidth={2} />
        )}
      </MapView>

      {/* Device List */}
      <View style={styles.topPanel}>
        <Text style={styles.panelTitle}>Device Lists</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={user?.children}
          keyExtractor={(item, index) => String(item?.id ?? index)}
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
        {/* Tabs: live tracking / circle geofence / polygon geofence */}
        <View style={styles.tabRow}>
          {[
            { key: "live", label: "Live" },
            { key: "circle", label: "Circle" },
            { key: "polygon", label: "Polygon" },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, mode === t.key && styles.tabActive]}
              onPress={() => changeMode(t.key)}
            >
              <Text style={[styles.tabText, mode === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Request Location Button */}
        {mode === "live" && selectedChild && (
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

      {/* Geofence editor (circle / polygon tabs) */}
      {mode !== "live" && (
        <View style={styles.bottomPanel}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {!selectedChild ? (
              <Text style={styles.gfHint}>Select a device above to add or view geofences.</Text>
            ) : (
              <>
                {!!gfError && <Text style={styles.gfError}>{gfError}</Text>}
                <Text style={styles.gfHint}>
                  {mode === "circle"
                    ? gfCenter
                      ? `Center: ${gfCenter.latitude.toFixed(5)}, ${gfCenter.longitude.toFixed(5)}`
                      : "Tap the map to place the circle center."
                    : `${gfPoints.length} point(s) placed. Tap the map to add points (min 3).`}
                </Text>
                <TextInput
                  style={styles.gfInput}
                  placeholder="Name (e.g. Home)"
                  placeholderTextColor="#aaa"
                  value={gfName}
                  onChangeText={setGfName}
                />
                <TextInput
                  style={styles.gfInput}
                  placeholder="Notes (optional)"
                  placeholderTextColor="#aaa"
                  value={gfNotes}
                  onChangeText={setGfNotes}
                />
                {mode === "circle" ? (
                  <View style={styles.gfRow}>
                    {[100, 200, 500, 1000].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.tab, gfRadius === r && styles.tabActive, { flex: 0, paddingHorizontal: 12, marginRight: 6 }]}
                        onPress={() => setGfRadius(r)}
                      >
                        <Text style={[styles.tabText, gfRadius === r && styles.tabTextActive]}>
                          {r >= 1000 ? `${r / 1000} km` : `${r} m`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setGfPoints((p) => p.slice(0, -1))} disabled={!gfPoints.length}>
                    <Text style={styles.gfLink}>Undo last point</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.gfSaveBtn} onPress={saveGeofence} disabled={gfSaving}>
                  {gfSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.gfSaveText}>Save {mode === "circle" ? "Circle" : "Polygon"}</Text>
                  )}
                </TouchableOpacity>

                {visibleGeofences.length > 0 && <Text style={styles.gfListTitle}>Saved {mode} geofences</Text>}
                {visibleGeofences.map((g) => (
                  <View key={`row-${g.id}`} style={styles.gfItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gfItemName}>{g.name}</Text>
                      <Text style={styles.gfItemSub}>
                        {g.type === "polygon" ? `${g.paths?.length ?? 0} points` : `${g.radiusMeters} m radius`}
                        {g.notes ? ` · ${g.notes}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteGeofence(g)}>
                      <Text style={styles.gfDelete}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}
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
  tabRow: { flexDirection: "row", marginTop: 10, backgroundColor: "#f0e6f7", borderRadius: 10, padding: 3 },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center", backgroundColor: "transparent" },
  tabActive: { backgroundColor: "#6a1b9a" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#6a1b9a" },
  tabTextActive: { color: "#fff" },
  bottomPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 100,
    maxHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 5,
  },
  gfHint: { fontSize: 12, color: "#666", marginBottom: 8 },
  gfError: { fontSize: 12, color: "#b00020", fontWeight: "600", marginBottom: 8 },
  gfInput: { borderWidth: 1, borderColor: "#e5d5f0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: "#333", marginBottom: 8 },
  gfRow: { flexDirection: "row", marginBottom: 4 },
  gfLink: { fontSize: 13, fontWeight: "700", color: "#6a1b9a", marginBottom: 4 },
  gfSaveBtn: { backgroundColor: "#6a1b9a", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  gfSaveText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  gfListTitle: { fontSize: 13, fontWeight: "700", color: "#333", marginTop: 14, marginBottom: 4 },
  gfItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  gfItemName: { fontSize: 14, fontWeight: "600", color: "#333" },
  gfItemSub: { fontSize: 12, color: "#888", marginTop: 2 },
  gfDelete: { fontSize: 13, fontWeight: "700", color: "#e53935" },
});

export default LocationScreen;