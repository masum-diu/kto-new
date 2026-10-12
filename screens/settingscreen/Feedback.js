import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SUPPORT_EMAIL } from "../../constants/support";
import { version } from "../../package.json";

const TYPES = ["Suggestion", "Bug", "Other"];

export default function Feedback() {
  const navigation = useNavigation();
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");

  const send = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert("Feedback", "Please write your feedback first.");
      return;
    }
    const subject = encodeURIComponent(`KTO feedback: ${type}`);
    const body = encodeURIComponent(`${text}\n\n---\nApp version: ${version}`);
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
      setMessage("");
    } catch (e) {
      Alert.alert("Feedback", `No email app found. Please write to ${SUPPORT_EMAIL}.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tell us what you think</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Write your feedback here..."
            placeholderTextColor="#aaa"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Send Feedback</Text>
          </TouchableOpacity>
          <Text style={styles.note}>This opens your email app with the message ready to send.</Text>
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
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },
  typeRow: { flexDirection: "row", marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#f0e6f7", marginRight: 8 },
  chipActive: { backgroundColor: "#6d16a2" },
  chipText: { fontSize: 13, color: "#6d16a2", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  input: { minHeight: 140, borderWidth: 1, borderColor: "#e5d5f0", borderRadius: 12, padding: 12, fontSize: 14, color: "#333" },
  sendBtn: { backgroundColor: "#6d16a2", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  sendText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  note: { fontSize: 12, color: "#999", textAlign: "center", marginTop: 10 },
});
