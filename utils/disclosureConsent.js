import AsyncStorage from '@react-native-async-storage/async-storage';

export const CONSENT_KEYS = {
  PARENT_MONITORING: 'disclosure_parent_monitoring_v1',
  LOCATION: 'disclosure_location_v1',
  NOTIFICATIONS: 'disclosure_notifications_v1',
  REMOTE_MONITORING: 'disclosure_remote_monitoring_v1',
  CHILD_DEVICE: 'disclosure_child_device_v1',
};

export async function hasConsent(key) {
  const value = await AsyncStorage.getItem(key);
  return value === 'true';
}

export async function grantConsent(key) {
  await AsyncStorage.setItem(key, 'true');
}
