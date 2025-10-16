import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState('Gold');
  const [isYearly, setIsYearly] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* ===== Plan Tabs ===== */}
      <View style={styles.tabContainer}>
        {['Salver', 'Gold', 'Platinum'].map((plan) => (
          <TouchableOpacity
            key={plan}
            onPress={() => setSelectedPlan(plan)}
            style={[
              styles.tabButton,
              selectedPlan === plan && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedPlan === plan && styles.activeTabText,
              ]}
            >
              {plan}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== Plan Details Placeholder ===== */}
      <View style={styles.planBox}>
        <Text style={styles.placeholderText}>[Plan Details / Carousel]</Text>
      </View>

      {/* ===== Pagination Dots ===== */}
      <View style={styles.dotsContainer}>
        {[...Array(10)].map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === 0 ? styles.activeDot : styles.inactiveDot]}
          />
        ))}
      </View>

      {/* ===== Price Toggle ===== */}
      <View style={styles.priceSwitch}>
        <TouchableOpacity
          onPress={() => setIsYearly(false)}
          style={[
            styles.priceOptionLeft,
            !isYearly ? styles.activeMonth : styles.inactiveMonth,
          ]}
        >
          <Text style={[styles.priceText, !isYearly ? styles.whiteText : styles.purpleText]}>
            BDT 999.00
          </Text>
          <Text style={[styles.periodText, !isYearly ? styles.whiteText : styles.purpleText]}>
            Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsYearly(true)}
          style={[
            styles.priceOptionRight,
            isYearly ? styles.activeYear : styles.inactiveYear,
          ]}
        >
          <Text style={[styles.priceText, isYearly ? styles.whiteText : styles.purpleText]}>
            BDT 2100.00
          </Text>
          <Text style={[styles.periodText, isYearly ? styles.whiteText : styles.purpleText]}>
            Year
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== Start Free Trial Button ===== */}
      <LinearGradient
        colors={['#A772F9', '#6B21A8']}
        style={styles.gradientButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.buttonText}>Start free trial</Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderRadius: 50,
    padding: 5,
    marginBottom: 25,
    width: '90%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#6B21A8',
  },
  tabText: {
    fontWeight: '600',
    color: '#6B21A8',
  },
  activeTabText: {
    color: '#fff',
  },
  planBox: {
    height: 160,
    width: '90%',
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  placeholderText: {
    color: '#b0b0b0',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#7E22CE',
  },
  inactiveDot: {
    backgroundColor: '#d3d3d3',
  },
  priceSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 30,
  },
  priceOptionLeft: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  priceOptionRight: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  activeMonth: {
    backgroundColor: '#000',
  },
  inactiveMonth: {
    backgroundColor: '#E6D4FA',
  },
  activeYear: {
    backgroundColor: '#D3B3F8',
  },
  inactiveYear: {
    backgroundColor: '#E6D4FA',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  periodText: {
    fontSize: 12,
    textAlign: 'center',
  },
  purpleText: {
    color: '#6B21A8',
  },
  whiteText: {
    color: '#fff',
  },
  gradientButton: {
    width: '90%',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
