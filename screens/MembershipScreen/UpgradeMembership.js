import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../api/api_instance';

const PLAN_DETAILS = {
  BASIC: {
    subtitle: 'Essential parental controls',
    features: [
      'Live location tracking',
      'Basic app usage report',
      '1 child device connection',
      'Weekly summary notification',
    ],
  },
  PRO: {
    subtitle: 'Stronger daily monitoring',
    features: [
      'Everything in Basic',
      'Real-time activity alerts',
      'App blocking and screen time controls',
      'Up to 3 child device connections',
    ],
  },
  PREMIUM: {
    subtitle: 'Complete family protection suite',
    features: [
      'Everything in Pro',
      'Live screen monitoring access',
      'Priority support',
      'Up to 10 child device connections',
    ],
  },
};

export default function UpgradeMembership() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentPlan = route?.params?.currentPlan || 'BASIC';
  const provider = route?.params?.provider || '';
  const [selectedPlan, setSelectedPlan] = useState('BASIC');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError('');
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      let response;
      try {
        // First preference: admin-configured plans endpoint.
        response = await instance.get('/subscriptions/admin/plans', { headers });
      } catch (adminError) {
        // Fallback for non-admin users if backend exposes public plans route.
        response = await instance.get('/subscriptions/plans', { headers });
      }

      const payload = response?.data?.data;
      const rawPlans = Array.isArray(payload?.plans)
        ? payload.plans
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

      const activePlans = rawPlans.filter(
        (plan) => plan?.isActive && plan?.tier !== 'FREE_TRIAL'
      );
      setPlans(activePlans);
      if (!activePlans.length) {
        setPlansError('No active membership plans available right now.');
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Could not load plans. Please try again.';
      setPlansError(message);
      setPlans([]);
      console.log('Plan fetch error:', error?.response?.data || error?.message);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const availableTiers = useMemo(() => {
    const tiers = [...new Set(plans.map((plan) => plan?.tier).filter(Boolean))];
    return tiers;
  }, [plans]);

  useEffect(() => {
    if (!availableTiers.length) return;
    if (availableTiers.includes('BASIC')) {
      setSelectedPlan('BASIC');
      return;
    }
    setSelectedPlan(availableTiers[0]);
  }, [availableTiers]);

  const availablePeriodsForSelectedPlan = useMemo(() => {
    return [...new Set(
      plans
        .filter((plan) => plan?.tier === selectedPlan)
        .map((plan) => plan?.period)
        .filter(Boolean)
    )];
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (!availablePeriodsForSelectedPlan.length) return;
    if (availablePeriodsForSelectedPlan.includes('MONTHLY')) {
      setBillingCycle('MONTHLY');
      return;
    }
    setBillingCycle(availablePeriodsForSelectedPlan[0]);
  }, [availablePeriodsForSelectedPlan]);

  const selectedPlanData = plans.find(
    (plan) => plan?.tier === selectedPlan && plan?.period === billingCycle
  );
  const selectedPrice = selectedPlanData?.amount ?? 0;
  const selectedCurrency = selectedPlanData?.currency || 'USD';

  const handleUpgrade = () => {
    if (provider === 'mock') {
      Alert.alert(
        'Upgrade Membership',
        `Selected: ${selectedPlan}\nBilling: ${billingCycle}\nPrice: ${selectedCurrency} ${selectedPrice}\nCurrent: ${currentPlan}\nMock provider enabled, so payment/upgrade is not active yet.`
      );
      return;
    }

    Alert.alert(
      'Upgrade Membership',
      `Selected: ${selectedPlan}\nBilling: ${billingCycle}\nPrice: ${selectedCurrency} ${selectedPrice}\nCurrent: ${currentPlan}\nReady to connect with upgrade API.`
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Image
            source={require("../../assets/angle-small-left.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Plan</Text>
        <View style={styles.headerGap} />
      </View>

      <LinearGradient
        colors={['#f3e8ff', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.title}>Upgrade Membership</Text>
        <Text style={styles.subtitle}>Choose the best plan for your family</Text>
        <View style={styles.currentPlanPill}>
          <Text style={styles.currentPlanText}>Current: {currentPlan}</Text>
        </View>
      </LinearGradient>

      <View style={styles.optionRow}>
        {availableTiers.map((plan) => {
          const active = selectedPlan === plan;
          return (
            <TouchableOpacity
              key={plan}
              style={[styles.optionButton, active && styles.optionButtonActive]}
              onPress={() => setSelectedPlan(plan)}
              activeOpacity={0.85}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{plan}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {!plansLoading && plansError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{plansError}</Text>
          <TouchableOpacity onPress={fetchPlans} style={styles.retrySmallButton} activeOpacity={0.85}>
            <Text style={styles.retrySmallText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.billingSwitchWrap}>
        {availablePeriodsForSelectedPlan.map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.billingOption, billingCycle === period && styles.billingOptionActive]}
            onPress={() => setBillingCycle(period)}
            activeOpacity={0.85}
          >
            <Text style={[styles.billingLabel, billingCycle === period && styles.billingLabelActive]}>
              {period === 'MONTHLY' ? 'Monthly' : period === 'YEARLY' ? 'Yearly' : period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.priceSummaryCard}>
        <Text style={styles.priceSummaryLabel}>Selected Price</Text>
        <Text style={styles.priceSummaryValue}>{selectedCurrency} {selectedPrice}</Text>
        <Text style={styles.priceSummaryPeriod}>
          per {billingCycle === 'MONTHLY' ? 'month' : 'year'}
        </Text>
      </View>

      <View style={styles.featureCard}>
        {plansLoading ? (
          <ActivityIndicator size="small" color="#6B21A8" />
        ) : null}
        <Text style={styles.featureTitle}>{selectedPlan} Features</Text>
        <Text style={styles.featureSubtitle}>
          {PLAN_DETAILS[selectedPlan]?.subtitle || 'Plan feature overview'}
        </Text>
        {(PLAN_DETAILS[selectedPlan]?.features || ['Feature list will be updated soon.']).map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.85}>
        <LinearGradient
          colors={['#A772F9', '#6B21A8']}
          style={styles.upgradeBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.upgradeText}>Upgrade to {selectedPlan}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fb',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#5b21b6',
    fontWeight: '700',
    marginTop: -1,
  },
  headerTitle: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },
  headerGap: {
    width: 36,
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ece9ff',
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#4c1d95',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  currentPlanPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentPlanText: {
    color: '#5b21b6',
    fontSize: 12,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  optionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#7c3aed',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  optionTextActive: {
    color: '#5b21b6',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorBoxText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  retrySmallButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retrySmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  billingSwitchWrap: {
    flexDirection: 'row',
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  billingOption: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  billingOptionActive: {
    backgroundColor: '#ffffff',
  },
  billingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  billingLabelActive: {
    color: '#5b21b6',
  },
  priceSummaryCard: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  priceSummaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceSummaryValue: {
    marginTop: 4,
    fontSize: 28,
    color: '#4c1d95',
    fontWeight: '800',
  },
  priceSummaryPeriod: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ece9ff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4c1d95',
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  bullet: {
    fontSize: 16,
    color: '#6b21a8',
    marginRight: 6,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  },
  upgradeBtn: {
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 3,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
