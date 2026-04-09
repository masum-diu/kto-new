import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../../api/api_instance";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function UsageReport() {
  const navigation = useNavigation();
  const route = useRoute();
  const trackId = route.params?.trackId;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
console.log(activities)
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const res = await instance.get(`/children/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res)
        const raw = res?.data?.data?.activities || res?.data?.data || [];
        const unique = Object.values(
          raw.reduce((acc, item) => {
            if (!acc[item.app_name]) {
              acc[item.app_name] = item;
            } else {
              acc[item.app_name].duration_minutes += item.duration_minutes;
            }
            return acc;
          }, {})
        );
        setActivities(unique);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [trackId]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const totalMinutes = (activities || []).reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const maxMinutes = Math.max(...(activities || []).map(a => a.duration_minutes || 0), 1);

  const formatDuration = (mins) => {
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usage Report</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6d16a2" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={36} color="#6d16a2" />
            <Text style={styles.summaryLabel}>Total Screen Time</Text>
            <Text style={styles.summaryValue}>{formatDuration(totalMinutes)}</Text>
            {activities[0] && (
              <Text style={styles.summaryDate}>{today}</Text>
            )}
          </View>

          {/* Activity List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Activities</Text>
            {activities.length === 0 ? (
              <Text style={styles.emptyText}>No activity data available</Text>
            ) : (
              activities.map((item, index) => (
                <View key={item.id || index} style={styles.activityRow}>
                  <View style={styles.appIconWrapper}>
                    <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
                  </View>
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{item.app_name}</Text>
                    <Text style={styles.packageName}>{item.package_name}</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, {
                        width: `${Math.round((item.duration_minutes / maxMinutes) * 100)}%`
                      }]} />
                    </View>
                  </View>
                  <Text style={styles.appTime}>{formatDuration(item.duration_minutes)}</Text>
                </View>
              ))
            )}
          </View>
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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryLabel: { fontSize: 14, color: "#888", marginTop: 8 },
  summaryValue: { fontSize: 36, fontWeight: "700", color: "#6d16a2", marginTop: 4 },
  summaryDate: { fontSize: 13, color: "#aaa", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 16 },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center", paddingVertical: 20 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  appIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#6d16a2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appInfo: { flex: 1 },
  appName: { fontSize: 14, fontWeight: "600", color: "#333" },
  packageName: { fontSize: 11, color: "#aaa", marginBottom: 6 },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6d16a2",
    borderRadius: 3,
  },
  appTime: { fontSize: 13, fontWeight: "600", color: "#6d16a2", marginLeft: 10, minWidth: 40, textAlign: "right" },
});
