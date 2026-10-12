import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

// Only English is translated today; the others are listed so users can see what is planned.
const LANGUAGES = [
  { code: "en", name: "English", native: "English", available: true },
  { code: "bn", name: "Bengali", native: "বাংলা", available: false },
  { code: "hi", name: "Hindi", native: "हिन्दी", available: false },
  { code: "ar", name: "Arabic", native: "العربية", available: false },
];

export default function Language() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {LANGUAGES.map((l, i) => (
            <View key={l.code} style={[styles.row, i > 0 && styles.rowBorder, !l.available && styles.disabled]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{l.name}</Text>
                <Text style={styles.native}>{l.native}</Text>
              </View>
              {l.available ? (
                <Ionicons name="checkmark-circle" size={22} color="#6d16a2" />
              ) : (
                <Text style={styles.soon}>Coming soon</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0e6f7" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  rowBorder: { borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  disabled: { opacity: 0.5 },
  name: { fontSize: 15, fontWeight: "600", color: "#333" },
  native: { fontSize: 12, color: "#888", marginTop: 2 },
  soon: { fontSize: 12, color: "#6d16a2", fontWeight: "600" },
});
