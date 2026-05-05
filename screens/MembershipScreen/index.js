import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import instance from '../../api/api_instance';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('accessToken');
      const response = await instance.get('/subscriptions/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subData = response?.data?.data || null;
      setSubscription(subData);
    } catch (e) {
      const message =
        e?.response?.data?.message || 'Could not load membership details.';
      setError(message);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription])
  );

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const tier = subscription?.tier || 'No Plan';
  const period = subscription?.period || 'N/A';
  const amount = subscription?.amount;
  const status = subscription?.status || 'INACTIVE';
  const startedAt = formatDate(subscription?.currentPeriodStart);
  const endsAt = formatDate(subscription?.currentPeriodEnd);
  const autoRenew = subscription?.cancelAtPeriodEnd === true ? 'Off' : 'On';
  const trialDays = subscription?.days || 14;
  const trialEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const totalTrialDays = Number(subscription?.days) > 0 ? Number(subscription.days) : 14;
  const trialDaysLeft = trialEndDate
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : totalTrialDays;
  const isTrialPlan = subscription?.status === 'TRIALING' && trialDaysLeft > 0;
  const isTrialExpired =
    subscription?.tier === 'FREE_TRIAL' && (subscription?.status !== 'TRIALING' || trialDaysLeft <= 0);
  const hasMembership = Boolean(subscription?.id) && !isTrialPlan && !isTrialExpired;
  const trialProgress = Math.min(
    1,
    Math.max(0, (totalTrialDays - trialDaysLeft) / totalTrialDays)
  );

  const handleManageMembership = () => {
    navigation.navigate('UpgradeMembership', {
      currentPlan: tier,
      provider: subscription?.provider || '',
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingBottom: tabBarHeight + 56 }]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      bounces
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['#2d1457', '#6B21A8', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroEyebrow}>Subscription</Text>
        <Text style={styles.heroTitle}>My Membership</Text>
        <Text style={styles.heroSubtitle}>
          Keep your family protection active with your current plan.
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#6B21A8" />
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchSubscription} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : hasMembership ? (
        <>
          <View style={styles.planBox}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{tier}</Text>
              <Text style={[styles.statusBadge, status === 'ACTIVE' ? styles.statusActive : styles.statusInactive]}>
                {status}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                {typeof amount === 'number' ? `$${amount}` : 'N/A'}
              </Text>
              <Text style={styles.periodPill}>{period}</Text>
            </View>
            <Text style={styles.captionText}>Current billing cycle</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start date</Text>
              <Text style={styles.infoValue}>{startedAt}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Renewal / End date</Text>
              <Text style={styles.infoValue}>{endsAt}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Auto-renew</Text>
              <Text style={styles.infoValue}>{autoRenew}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subscription ID</Text>
              <Text style={styles.infoValueSmall}>{subscription?.providerSubscriptionId || 'N/A'}</Text>
            </View>
          </View>

        </>
      ) : (
        <View style={styles.trialCard}>
          <Text style={styles.trialBadge}>
            {isTrialPlan
              ? 'Free Trial Active'
              : isTrialExpired
                ? 'Trial Ended'
                : 'No Active Membership'}
          </Text>
          <Text style={styles.trialTitle}>
            {isTrialPlan
              ? `${trialDays} days free trial is running`
              : isTrialExpired
                ? 'Your free trial has ended'
              : `Start your ${trialDays} days free trial`}
          </Text>
          <Text style={styles.trialText}>
            {isTrialPlan
              ? `Your trial started on ${startedAt} and ends on ${endsAt}.`
              : isTrialExpired
                ? 'To continue using premium safety features, please add a membership plan.'
              : 'Unlock location, activity insights, and family safety controls with a free trial.'}
          </Text>
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Trial days left</Text>
            <Text style={styles.countdownValue}>{trialDaysLeft} days</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${trialProgress * 100}%` }]} />
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={handleManageMembership} activeOpacity={0.85}>
        <LinearGradient
          colors={['#A772F9', '#6B21A8']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>
            {hasMembership ? 'Upgrade Membership' : isTrialExpired ? 'Renew Membership' : 'Add Membership'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f0ff',
  },
  container: {
    minHeight: '100%',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3b0764',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  heroEyebrow: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#ede9fe',
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 10,
    fontWeight: '500',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6B21A8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  planBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4c1d95',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusActive: {
    backgroundColor: '#ecfdf3',
    color: '#15803d',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  periodPill: {
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  captionText: {
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  infoValueSmall: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  trialCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: 16,
    shadowColor: '#4c1d95',
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  trialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  trialTitle: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '800',
    marginBottom: 8,
  },
  trialText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    fontWeight: '500',
  },
  countdownCard: {
    marginTop: 14,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 12,
    padding: 12,
  },
  countdownLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  countdownValue: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 22,
    color: '#4c1d95',
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e9d5ff',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 999,
  },
  gradientButton: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
