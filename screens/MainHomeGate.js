import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, View } from 'react-native';
import BottomNavigation from '../navigation/BottomNavigation';
import ProminentDisclosureModal from '../components/ProminentDisclosureModal';
import { DISCLOSURE } from '../constants/disclosureContent';
import { CONSENT_KEYS, grantConsent, hasConsent } from '../utils/disclosureConsent';
import { useAuth } from '../context/AuthContext';

export default function MainHomeGate() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showNotifDisclosure, setShowNotifDisclosure] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const accepted = await hasConsent(CONSENT_KEYS.PARENT_MONITORING);
      const notifAccepted = await hasConsent(CONSENT_KEYS.NOTIFICATIONS);
      setShowDisclosure(!accepted);
      // The notification prompt comes after the monitoring one, never on top of it.
      setShowNotifDisclosure(accepted && !notifAccepted);
      setLoading(false);
    };
    checkConsent();
  }, []);

  const handleAgree = async () => {
    await grantConsent(CONSENT_KEYS.PARENT_MONITORING);
    setShowDisclosure(false);
    if (!(await hasConsent(CONSENT_KEYS.NOTIFICATIONS))) setShowNotifDisclosure(true);
  };

  // Needed so safety alerts can show up in the status bar from any screen.
  const handleNotifAgree = async () => {
    await grantConsent(CONSENT_KEYS.NOTIFICATIONS);
    setShowNotifDisclosure(false);
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      } catch (error) {
        console.log('Notification permission error:', error);
      }
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Consent Required',
      'You must accept the monitoring disclosure to use KTO parental features.',
      [
        { text: 'Review Again', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  return (
    <>
      <BottomNavigation />
      <ProminentDisclosureModal
        visible={showDisclosure}
        {...DISCLOSURE.PARENT_MONITORING}
        onAgree={handleAgree}
        onDecline={handleDecline}
      />
      <ProminentDisclosureModal
        visible={showNotifDisclosure}
        {...DISCLOSURE.NOTIFICATIONS}
        onAgree={handleNotifAgree}
        onDecline={() => setShowNotifDisclosure(false)}
      />
    </>
  );
}
