import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { PRIVACY_POLICY_URL } from "../../constants/disclosureContent";
import { version } from "../../package.json";

const FEATURES = [
  { icon: "location-outline", title: "Live Location", text: "See where your child's device is on the map and review recent location history." },
  { icon: "bar-chart-outline", title: "Usage Reports", text: "Check which apps your child uses and for how long." },
  { icon: "ban-outline", title: "App Blocking & Screen Time", text: "Block apps and set a daily screen time limit for each device." },
  { icon: "globe-outline", title: "Safe Browsing", text: "Block websites and keywords on linked devices." },
  { icon: "videocam-outline", title: "Remote Safety Tools", text: "Live screen, camera and audio on devices you own or are authorized to monitor." },
  { icon: "notifications-outline", title: "Safety Alerts", text: "Get notified about activity and safety events from linked devices." },
];

export default function AboutUs() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={require("../../assets/logoicons.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>KTO</Text>
          <Text style={styles.tagline}>Keep your family safe, together.</Text>
          <Text style={styles.version}>Version {version}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who we are</Text>
          <Text style={styles.body}>
            KTO is a family safety app that helps parents and legal guardians look after the
            devices their children use. Link your child's device to your family circle and manage
            their screen time, apps, and safety from one place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What KTO does</Text>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy first</Text>
          <Text style={styles.body}>
            Data is sent securely to KTO servers and is accessible only to your parent or guardian
            account. KTO should only be used on devices owned by your family and with proper
            consent.
          </Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#6d16a2" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#6d16a2" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: { padding: 16, paddingBottom: 40 },
  heroCard: {
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
  logo: { width: 72, height: 72 },
  appName: { fontSize: 28, fontWeight: "700", color: "#6d16a2", marginTop: 8 },
  tagline: { fontSize: 14, color: "#666", marginTop: 4 },
  version: { fontSize: 12, color: "#aaa", marginTop: 8 },
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
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 10 },
  body: { fontSize: 14, color: "#555", lineHeight: 21 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#6d16a2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  featureText: { fontSize: 12, color: "#777", marginTop: 2, lineHeight: 17 },
  linkRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  linkText: { flex: 1, marginLeft: 8, fontSize: 14, fontWeight: "600", color: "#6d16a2" },
});
