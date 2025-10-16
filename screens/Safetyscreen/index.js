import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Safetyscreen() {
  const [enabled, setEnabled] = useState(false);

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      {/* ===== Header ===== */}
      <Text style={styles.title}>Family Safety Assist</Text>
      <Text style={styles.subTitle}>Digital Safety</Text>

      {/* ===== Data Breach Card ===== */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconWrapperRed}>
            <Ionicons name="desktop-outline" size={22} color="#fff" />
          </View>
          <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>Data breach alerts</Text>
          </View>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        </View>

        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>View all breach</Text>
          <Ionicons name="chevron-forward" size={16} color="#6B21A8" />
        </TouchableOpacity>
      </View>

      {/* ===== ID Theft Protection Card ===== */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconWrapperBlue}>
            <Ionicons name="finger-print-outline" size={22} color="#fff" />
          </View>
          <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>ID theft protection</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            thumbColor={enabled ? '#6B21A8' : '#f4f3f4'}
            trackColor={{ false: '#ccc', true: '#D3B3F8' }}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Get $ Dummy reimbursement and restoration support for stolen funds.{' '}
            <Text style={styles.linkInline}>Learn more</Text>
          </Text>
        </View>
      </View>
        {/* ===== Data Breach Card ===== */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconWrapperRed}>
            <Ionicons name="desktop-outline" size={22} color="#fff" />
          </View>
          <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>Crash detection</Text>
          </View>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconWrapperRed}>
            <Ionicons name="desktop-outline" size={22} color="#fff" />
          </View>
          <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>Emergency dispatch</Text>
          </View>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: "#FFFF", padding: 16, paddingTop: 30 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    // paddingVertical: 15,
    // paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  iconWrapperRed: {
    backgroundColor: '#F87171',
    borderRadius: 12,
    padding: 8,
  },
  iconWrapperBlue: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 8,
  },
  cardTextArea: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  checkCircle: {
    backgroundColor: '#22C55E',
    borderRadius: 20,
    padding: 5,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E9Fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#F5E9Fd',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  infoText: {
    color: '#333',
    fontSize: 13,
  },
  linkInline: {
    color: '#6B21A8',
    fontWeight: '500',
  },
});
