import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../../api/api_instance";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function Appblocking() {
  const navigation = useNavigation();
  const route = useRoute();
  const trackId = route.params?.trackId;
  const [policy, setPolicy] = useState(null);
  const [blockedApps, setBlockedApps] = useState([]);
  console.log(blockedApps)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const res = await instance.get(`/children/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res?.data?.data;
        setPolicy(data);
        setBlockedApps(data?.
policy
?.blocked_apps || []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    if (trackId) fetchPolicy();
  }, [trackId]);

  const toggleApp = async (packageName) => {
    const isBlocked = blockedApps.includes(packageName);
    const updated = isBlocked
      ? blockedApps.filter(a => a !== packageName)
      : [...blockedApps, packageName];
    setBlockedApps(updated);
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('accessToken');
      await instance.patch(`/children/${trackId}`, {
        blocked_apps: updated,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      setBlockedApps(blockedApps);
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Blocking</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6d16a2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Blocked Apps</Text>
              {saving && <ActivityIndicator size="small" color="#6d16a2" />}
            </View>
            {blockedApps.length === 0 ? (
              <Text style={styles.emptyText}>No apps blocked</Text>
            ) : (
              blockedApps.map((pkg, index) => (
                <View key={index} style={styles.appRow}>
                  <View style={styles.appIconWrapper}>
                    <Ionicons name="ban-outline" size={18} color="#fff" />
                  </View>
                  <Text style={styles.packageName}>{pkg}</Text>
                  <Switch
                    value={true}
                    onValueChange={() => toggleApp(pkg)}
                    thumbColor="#fff"
                    trackColor={{ false: '#ccc', true: '#6d16a2' }}
                  />
                </View>
              ))
            )}
          </View>

          {/* Extra policy info */}
          {policy && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Screen Controls</Text>
              <View style={styles.infoRow}>
                <Ionicons name="camera-outline" size={20} color="#6d16a2" />
                <Text style={styles.infoText}>Camera Blocked</Text>
                <Text style={styles.infoValue}>{policy.is_camera_blocked ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#6d16a2" />
                <Text style={styles.infoText}>Screen Time Limit</Text>
                <Text style={styles.infoValue}>{policy.daily_limit_minutes ? `${policy.daily_limit_minutes}m` : 'Not set'}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0e6f7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center", paddingVertical: 20 },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  packageName: { flex: 1, fontSize: 13, color: "#555" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 14, color: "#555" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#6d16a2" },
});
