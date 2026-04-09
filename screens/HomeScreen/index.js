import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image, Modal, FlatList, ActivityIndicator, TextInput, Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";



const HomeScreen = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChildid, setSelectedChildid] = useState(null);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [appBlockModal, setAppBlockModal] = useState(false);
  const [blockedPackages, setBlockedPackages] = useState([]);
  
  const [screenTimeModal, setScreenTimeModal] = useState(false);
  const [appTimeLimitModal, setAppTimeLimitModal] = useState(false);
  const [screenTimeLimit, setScreenTimeLimit] = useState(null);
  const [appLimits, setAppLimits] = useState({});
  const [policyLoading, setPolicyLoading] = useState(false);
console.log(blockedPackages)
  const saveScreenTimeLimit = async () => {
    try {
      setPolicyLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      await instance.post(`/policies`, {
        trackId: selectedChild,
        dailyLimitMinutes: screenTimeLimit,
        blockedApps: blockedPackages,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setScreenTimeModal(false);
    } catch (e) { console.log(e); }
    finally { setPolicyLoading(false); }
  };

  // const saveBlockedApps = async () => {
  //   try {
  //     setPolicyLoading(true);
  //     const token = await AsyncStorage.getItem('accessToken');
  //     await instance.post(`/control/policy`, {
  //       trackId: selectedChild,
  //       blocked_apps: blockedPackages,
  //     }, { headers: { Authorization: `Bearer ${token}` } });
  //     setAppBlockModal(false);
  //   } catch (e) { console.log(e); }
  //   finally { setPolicyLoading(false); }
  // };

  // const saveAppLimits = async () => {
  //   try {
  //     setPolicyLoading(true);
  //     const token = await AsyncStorage.getItem('accessToken');
  //     await instance.post(`/policy`, {
  //       trackId: selectedChild,
  //       dailyLimitMinutes: appLimits,
  //     }, { headers: { Authorization: `Bearer ${token}` } });
  //     setAppTimeLimitModal(false);
  //   } catch (e) { console.log(e); }
  //   finally { setPolicyLoading(false); }
  // };

  // console.log(user)

  const fetchActivities = async (trackId) => {
    try {
      setReportLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const res = await instance.get(`/children/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res?.data?.data?.activities || res?.data?.data || [];
      const unique = Object.values(
        raw.reduce((acc, item) => {
          if (!acc[item.app_name]) acc[item.app_name] = { ...item };
          else acc[item.app_name].duration_minutes += item.duration_minutes;
          return acc;
        }, {})
      );
      setActivities(unique);
    } catch (e) {
      console.log(e);
    } finally {
      setReportLoading(false);
    }
  };

  const getuserData = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const user = await instance.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    setUser(user.data.data);
  }

  useFocusEffect(
    useCallback(() => {
      getuserData();
    }, [])
  );

  const requestScreenCapturePermission = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  console.log(selectedChild);

  try {
   
     if (!selectedChild) {
      alert("Please select a child device first.");
      return;
    }
    else{ navigation.navigate("ScreenMirroring",{selectedChild})}
     navigation.navigate("ScreenMirroring",{selectedChild})
  } catch (error) {
    console.error(
      "Error requesting screen capture permission:",
      error?.response?.data || error.message
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("settingscreen")}>
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.familyBtn} onPress={() => setVisible(true)}>
            <Text style={styles.familyText}>{user?.familyName}</Text>
          
          </TouchableOpacity>
          <Modal transparent visible={visible} animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
              <View style={styles.modalBox}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Select Device</Text>
                <FlatList
                  data={user?.children}
                  keyExtractor={(item) => item?.id?.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.deviceItem,
                        selectedChild === item.child?.trackId && styles.deviceItemActive
                      ]}
                      onPress={() => {
                        setSelectedChild(item.child?.trackId);
                        setSelectedChildid(item.child?.id);
                        fetchActivities(item.child?.id);
                        setVisible(false);
                      }}
                    >
                      <View style={[
                        styles.deviceItemIcon,
                        selectedChild === item.child?.trackId && styles.deviceItemIconActive
                      ]}>
                        <Ionicons name="phone-portrait-outline" size={20}
                          color={selectedChild === item.child?.trackId ? "#fff" : "#6a1b9a"} />
                      </View>
                      <View style={styles.deviceItemInfo}>
                        <Text style={styles.deviceItemBrand}>{item.child?.deviceBrand || 'Unknown'}</Text>
                        <Text style={styles.deviceItemId}>{item.child?.name}</Text>
                      </View>
                      {selectedChild === item.child?.trackId && (
                        <Ionicons name="checkmark-circle" size={22} color="#6a1b9a" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}>
            <Ionicons name="notifications-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
              <Image source={require("../../assets/logoicons.png")} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>
            <View>
              <Text style={styles.name}>{user?.name || 'Welcome'}</Text>
              <Text style={styles.familyLabel}>{user?.familyName} Family</Text>
              <View style={styles.onlineRow}>
                <Ionicons name="wifi" size={12} color="#4ade80" />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.addDeviceBtn} onPress={() => setVisible(true)}>
            <Ionicons name="add" size={22} color="#6a1b9a" />
          </TouchableOpacity>
        </View>

        {/* User Report */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Report</Text>
          {!selectedChild ? (
            <Text style={styles.smallText}>Select a device to view report</Text>
          ) : reportLoading ? (
            <ActivityIndicator size="small" color="#6a1b9a" style={{ marginVertical: 10 }} />
          ) : activities.length === 0 ? (
            <Text style={styles.smallText}>No activity data available</Text>
          ) : (
            activities.slice(0, 4).map((item, index) => {
              const maxMin = Math.max(...activities.map(a => a.duration_minutes), 1);
              const pct = Math.round((item.duration_minutes / maxMin) * 100);
              return (
                <View key={index} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.smallText}>{item.app_name}</Text>
                    <Text style={styles.smallText}>{item.duration_minutes >= 60 ? `${Math.floor(item.duration_minutes / 60)}h ${item.duration_minutes % 60}m` : `${item.duration_minutes}m`}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Device Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Activity</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconBox} onPress={() => {
              if (!selectedChild) { alert('Select a device first'); return; }
              setScreenTimeModal(true);
            }}>
              <Ionicons name="time-outline" size={28} color="#6a1b9a" />
              <Text style={styles.iconText}>Screen Time Limits</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.iconBox} onPress={() => {
              if (!selectedChild) { alert('Select a device first'); return; }
              navigation.navigate("Appblocking", { trackId: selectedChildid    })
            }}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#6a1b9a" />
              <Text style={styles.iconText}>App Rules</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Screen Time Limit Modal */}
        <Modal transparent visible={screenTimeModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setScreenTimeModal(false)} />
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Screen Time & App Control</Text>
              <Text style={styles.smallText}>Daily screen time limit</Text>
              <View style={styles.limitRow}>
                {[30, 60, 90, 120, 180, 240].map(min => (
                  <TouchableOpacity
                    key={min}
                    style={[styles.limitBtn, screenTimeLimit === min && styles.limitBtnActive]}
                    onPress={() => setScreenTimeLimit(min)}
                  >
                    <Text style={[styles.limitBtnText, screenTimeLimit === min && styles.limitBtnTextActive]}>
                      {min >= 60 ? `${min / 60}h` : `${min}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.customInput}
                placeholder="Custom minutes (e.g. 150)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={screenTimeLimit ? String(screenTimeLimit) : ''}
                onChangeText={v => setScreenTimeLimit(Number(v))}
              />
              <Text style={[styles.smallText, { marginBottom: 8 }]}>Block Apps</Text>
              <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                {activities.map((item, index) => (
                  <View key={index} style={styles.appLimitRow}>
                    <View style={styles.appIconWrapper2}>
                      <Ionicons name="phone-portrait-outline" size={18} color="#6a1b9a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appLimitName}>{item.app_name}</Text>
                      <Text style={{ fontSize: 11, color: '#aaa' }}>{item.package_name}</Text>
                    </View>
                    <Switch
                      value={blockedPackages.includes(item.package_name)}
                      onValueChange={(val) => {
                        if (val) setBlockedPackages(prev => [...prev, item.package_name]);
                        else setBlockedPackages(prev => prev.filter(p => p !== item.package_name));
                      }}
                      thumbColor="#fff"
                      trackColor={{ false: '#ccc', true: '#6a1b9a' }}
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.saveBtn} onPress={async () => {
                await saveScreenTimeLimit();
                // await saveBlockedApps();
              }}>
                {policyLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save All</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* App Block Modal */}
        <Modal transparent visible={appBlockModal} animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAppBlockModal(false)}>
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Block Apps</Text>
              <Text style={styles.smallText}>Toggle to block/unblock apps</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {activities.map((item, index) => (
                  <View key={index} style={styles.appLimitRow}>
                    <View style={styles.appIconWrapper2}>
                      <Ionicons name="phone-portrait-outline" size={18} color="#6a1b9a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appLimitName}>{item.app_name}</Text>
                      <Text style={{ fontSize: 11, color: '#aaa' }}>{item.package_name}</Text>
                    </View>
                    <Switch
                      value={blockedPackages.includes(item.package_name)}
                      onValueChange={(val) => {
                        if (val) setBlockedPackages(prev => [...prev, item.package_name]);
                        else setBlockedPackages(prev => prev.filter(p => p !== item.package_name));
                      }}
                      thumbColor="#fff"
                      trackColor={{ false: '#ccc', true: '#6a1b9a' }}
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.saveBtn} >
                {policyLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

       

        {/* Live Monitoring */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Live Monitoring</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => navigation.navigate("Location")}>
              <View style={styles.iconBox}>
                <Ionicons name="location-outline" size={28} color="#6a1b9a" />
                <Text style={styles.iconText}>Location tracking</Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => requestScreenCapturePermission()}>
              <View style={styles.iconBox}>
                <Ionicons name="camera-outline" size={28} color="#6a1b9a" />
                <Text style={styles.iconText}>Remote Camera</Text>
              </View>
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => navigation.navigate("OneWayAudio")}>
              <View style={styles.iconBox}>
                <Ionicons name="mic-outline" size={28} color="#6a1b9a" />
                <Text style={styles.iconText}>One-Way Audio</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6a1b9a", paddingTop: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 16 },
  headerIcon: { width: 44, height: 44 },
  headerSmallIcon: { width: 10, height: 6 },
  familyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  familyText: { color: "#6a1b9a", fontWeight: "500", marginRight: 6 },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profileInfo: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: { position: "relative", marginRight: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: "#fff" },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#6a1b9a",
  },
  name: { color: "#fff", fontSize: 17, fontWeight: "700" },
  familyLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  onlineRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  onlineDot: { width: 8, height: 8, backgroundColor: "green", borderRadius: 4, marginRight: 4 },
  onlineText: { color: "#4ade80", fontSize: 12, fontWeight: "500" },
  addDeviceBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: { backgroundColor: "#fff", marginHorizontal: 16, marginVertical: 8, borderRadius: 8, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  smallText: { fontSize: 13, color: "#666", marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "#ddd", borderRadius: 6, overflow: "hidden" },
  progressFill: { width: "40%", height: "100%", backgroundColor: "#0abab5" },
  iconRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  iconBox: { alignItems: "center", width: 90 },
  iconImg: { width: 28, height: 28 },
  iconText: { fontSize: 12, color: "#333", marginTop: 4, textAlign: "center" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", paddingVertical: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  navBtn: { alignItems: "center" },
  navBtnActive: { backgroundColor: "#6a1b9a", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center" },
  bottomIcon: { width: 22, height: 22 },
  navTextActive: { color: "#fff", marginLeft: 6, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
    textAlign: "center",
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f5f0ff",
  },
  deviceItemActive: {
    backgroundColor: "#ede0ff",
    borderWidth: 1.5,
    borderColor: "#6a1b9a",
  },
  deviceItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ede0ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deviceItemIconActive: {
    backgroundColor: "#6a1b9a",
  },
  deviceItemInfo: { flex: 1 },
  deviceItemBrand: { fontSize: 15, fontWeight: "600", color: "#222" },
  deviceItemId: { fontSize: 12, color: "#999", marginTop: 2 },
  limitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 16 },
  limitBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f0e6f7', borderWidth: 1, borderColor: '#ddd' },
  limitBtnActive: { backgroundColor: '#6a1b9a', borderColor: '#6a1b9a' },
  limitBtnText: { fontSize: 14, color: '#6a1b9a', fontWeight: '600' },
  limitBtnTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#6a1b9a', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  appLimitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  appLimitName: { flex: 1, fontSize: 13, color: '#333', fontWeight: '600' },
  limitMiniRow: { flexDirection: 'row', gap: 6 },
  limitMiniBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#f0e6f7', borderWidth: 1, borderColor: '#ddd' },
  customInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  appIconWrapper2: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0e6f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

});
