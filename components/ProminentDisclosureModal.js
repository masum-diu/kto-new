import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants/disclosureContent';

export default function ProminentDisclosureModal({
  visible,
  title,
  intro,
  bullets = [],
  agreeLabel = 'I Agree',
  declineLabel = 'Decline',
  onAgree,
  onDecline,
}) {
  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.intro}>{intro}</Text>

            {bullets.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            <TouchableOpacity onPress={openPrivacyPolicy} style={styles.policyLink}>
              <Text style={styles.policyLinkText}>Read Privacy Policy</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.agreeBtn} onPress={onAgree} activeOpacity={0.85}>
            <Text style={styles.agreeText}>{agreeLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.85}>
            <Text style={styles.declineText}>{declineLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4c1d95',
    marginBottom: 10,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    color: '#6b21a8',
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#4b5563',
    fontWeight: '500',
  },
  policyLink: {
    marginTop: 8,
    marginBottom: 14,
  },
  policyLinkText: {
    color: '#6b21a8',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  agreeBtn: {
    backgroundColor: '#6b21a8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  agreeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  declineBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  declineText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },
});
