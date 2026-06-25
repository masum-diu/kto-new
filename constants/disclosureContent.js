export const PRIVACY_POLICY_URL = 'https://kto.solutions/privacy-policy';

export const DISCLOSURE = {
  PARENT_MONITORING: {
    title: 'Parental Monitoring Disclosure',
    intro:
      'KTO helps parents and legal guardians monitor linked child devices for family safety. Before you continue, please review how data is collected and used.',
    bullets: [
      'Location data from linked child devices may be collected and shown on a map.',
      'Device activity, app usage, and safety alerts may be collected from child devices.',
      'Remote features such as live screen, camera capture, and audio may be used only on devices you own or are authorized to monitor.',
      'Data is transmitted securely to KTO servers (api.kto.solutions) and is accessible only to your parent/guardian account.',
      'You must be the parent or legal guardian of the child being monitored.',
    ],
    agreeLabel: 'I Agree and Continue',
    declineLabel: 'Decline',
  },
  LOCATION: {
    title: 'Location Data Disclosure',
    intro:
      'KTO needs location permission on this device to show your position relative to a linked child device on the map.',
    bullets: [
      'Location is used only while you use the Location feature.',
      'Location is not sold to third parties.',
      'You can revoke permission anytime in device settings.',
    ],
    agreeLabel: 'Allow Location Access',
    declineLabel: 'Not Now',
  },
  NOTIFICATIONS: {
    title: 'Notifications Disclosure',
    intro:
      'KTO would like to send notifications about safety alerts and activity updates from linked child devices.',
    bullets: [
      'Notifications may include location alerts, app activity, and safety events.',
      'You can disable notifications in device settings at any time.',
    ],
    agreeLabel: 'Allow Notifications',
    declineLabel: 'Not Now',
  },
  REMOTE_MONITORING: {
    title: 'Remote Monitoring Disclosure',
    intro:
      'This feature may access camera, screen, or audio data from a linked child device. Use only with consent from the device owner or legal guardian.',
    bullets: [
      'Photos, live screen, or audio may be captured from the child device remotely.',
      'Data is sent to your parent account over a secure connection.',
      'Misuse of monitoring features may violate local laws and store policies.',
    ],
    agreeLabel: 'I Understand and Continue',
    declineLabel: 'Cancel',
  },
  CHILD_DEVICE: {
    title: 'Child Device Monitoring Consent',
    intro:
      'This device may be monitored by a parent or legal guardian through the KTO app for safety purposes.',
    bullets: [
      'Location, app usage, and device activity may be shared with the linked parent account.',
      'Remote safety features may be enabled by the parent account.',
      'Monitoring should only be used on devices owned by your family and with proper consent.',
    ],
    agreeLabel: 'I Agree',
    declineLabel: 'Not Now',
  },
};
