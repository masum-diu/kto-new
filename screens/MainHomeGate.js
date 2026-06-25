import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import BottomNavigation from '../navigation/BottomNavigation';
import ProminentDisclosureModal from '../components/ProminentDisclosureModal';
import { DISCLOSURE } from '../constants/disclosureContent';
import { CONSENT_KEYS, grantConsent, hasConsent } from '../utils/disclosureConsent';
import { useAuth } from '../context/AuthContext';

export default function MainHomeGate() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showDisclosure, setShowDisclosure] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const accepted = await hasConsent(CONSENT_KEYS.PARENT_MONITORING);
      setShowDisclosure(!accepted);
      setLoading(false);
    };
    checkConsent();
  }, []);

  const handleAgree = async () => {
    await grantConsent(CONSENT_KEYS.PARENT_MONITORING);
    setShowDisclosure(false);
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
    </>
  );
}
