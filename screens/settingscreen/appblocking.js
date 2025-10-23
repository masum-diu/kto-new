import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch } from "react-native";

const dailyData = [
  { id: '1', app: 'YouTube', time: '1h 45m', percentage: 60, color: '#FF0000' },
  { id: '2', app: 'TikTok', time: '1h 10m', percentage: 35, color: '#000000' },
  { id: '3', app: 'Browser', time: '35m', percentage: 20, color: '#4285F4' },
  { id: '4', app: 'Other', time: '20m', percentage: 15, color: '#cccccc' },
];

const weeklyData = [
  { id: '1', day: 'Sun', percentage: 50 },
  { id: '2', day: 'Mon', percentage: 75 },
  { id: '3', day: 'Tue', percentage: 60 },
  { id: '4', day: 'Wed', percentage: 80 },
  { id: '5', day: 'Thu', percentage: 40 },
  { id: '6', day: 'Fri', percentage: 90 },
  { id: '7', day: 'Sat', percentage: 85 },
];

const appBlockingData = [
  { id: '1', app: 'YouTube', isBlocked: true },
  { id: '2', app: 'TikTok', isBlocked: false },
  { id: '3', app: 'Instagram', isBlocked: true },
  { id: '4', app: 'Snapchat', isBlocked: false },
  { id: '5', app: 'Facebook', isBlocked: false },
];

export default function appblocking() {
  const navigation = useNavigation();
  const [blockedApps, setBlockedApps] = useState(appBlockingData);

  const toggleSwitch = (id) => {
    setBlockedApps(prevState =>
      prevState.map(app => (app.id === id ? { ...app, isBlocked: !app.isBlocked } : app))
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/angle-small-left.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Blocking</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>

        {/* App Blocking Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>App Blocking</Text>
          {blockedApps.map(item => (
            <View key={item.id} style={styles.blockingRow}>
              <Text style={styles.appName}>{item.app}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#9b59b6" }}
                thumbColor={item.isBlocked ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={() => toggleSwitch(item.id)}
                value={item.isBlocked}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0e6f7", // Lighter purple background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "medium",
    color: "#000",
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    width: 70,
    fontSize: 14,
    color: '#555',
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  appTime: {
    width: 60,
    textAlign: 'right',
    fontSize: 14,
    color: '#555',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginTop: 10,
  },
  barWrapper: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 20,
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#6d16a2',
    borderRadius: 5,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
  blockingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
