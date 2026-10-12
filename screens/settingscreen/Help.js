import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SUPPORT_EMAIL, WEBSITE_URL } from "../../constants/support";

const FAQS = [
  {
    q: "How do I add my child's device?",
    a: "Open Settings > Add Device to get a circle code, then enter that code in the KTO app on your child's device.",
  },
  {
    q: "How do I block an app?",
    a: "On Home, select a child device and open Screen Time & App Control. Turn on the switch next to an app and tap Save All. You can also do it from the Usage Report or App Blocking screens under Connected Devices.",
  },
  {
    q: "How do I set a screen time limit?",
    a: "Select a child device on Home, open Screen Time & App Control, choose a daily limit and tap Save All.",
  },
  {
    q: "Why can't I see my child's location?",
    a: "Make sure the child's device is online, has location permission enabled for KTO, and is linked to your family circle.",
  },
  {
    q: "How do I manage my membership?",
    a: "Open the Membership tab to see your current plan, or to add or upgrade a plan.",
  },
];

export default function Help() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently asked questions</Text>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <View key={item.q} style={[styles.faq, i > 0 && styles.faqBorder]}>
                <TouchableOpacity style={styles.faqHead} onPress={() => setOpen(isOpen ? null : i)}>
                  <Text style={styles.question}>{item.q}</Text>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#6d16a2" />
                </TouchableOpacity>
                {isOpen && <Text style={styles.answer}>{item.a}</Text>}
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Still need help?</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
            <Ionicons name="mail-outline" size={20} color="#6d16a2" />
            <Text style={styles.linkText}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(WEBSITE_URL)}>
            <Ionicons name="globe-outline" size={20} color="#6d16a2" />
            <Text style={styles.linkText}>{WEBSITE_URL.replace("https://", "")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0e6f7" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000" },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 10 },
  faq: { paddingVertical: 10 },
  faqBorder: { borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  question: { flex: 1, fontSize: 14, fontWeight: "600", color: "#333", marginRight: 10 },
  answer: { fontSize: 13, color: "#666", lineHeight: 19, marginTop: 8 },
  linkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  linkText: { marginLeft: 10, fontSize: 14, fontWeight: "600", color: "#6d16a2" },
});
