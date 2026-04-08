import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const notices = [
  { label: "App Notifications", icon: "notifications-outline" },
  { label: "Alerts Request", icon: "alert-circle-outline" },
  { label: "Browser History", icon: "globe-outline" },
  { label: "TikTok @ YouTube History", icon: "play-circle-outline" },
  { label: "Snapshot", icon: "camera-outline" },
  { label: "Usage Logs", icon: "bar-chart-outline" },
  { label: "Social App Keyword Detection", icon: "search-outline" },
];

export default function Notifications() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/angle-small-left.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {notices.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <View style={styles.iconWrapper}>
              <Ionicons name={item.icon} size={24} color="#fff" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.title}>{item.label}</Text>
              <Text style={styles.subtitle}>No data available</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0e6f7",
  },
  //  backButton: {
  //   position: "absolute",
  //   top: 30,
  //   left: 20,
  // },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: "#B066FF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8C52FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});
