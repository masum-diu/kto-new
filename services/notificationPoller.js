// Checks /notifications/logs while the app is open (on any screen) and shows a status-bar
// notification for new entries. The Notifications screen shares the same "last notified" id,
// so nothing is shown twice.
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../api/api_instance";
import { CONSENT_KEYS, hasConsent } from "../utils/disclosureConsent";

const POLL_INTERVAL_MS = 15000;
const LAST_ID_KEY = "lastNotifiedLogId";
const MAX_PER_CHECK = 3;

const loadNotifee = () => {
  try {
    const mod = require("@notifee/react-native");
    return { notifee: mod?.default, AndroidImportance: mod?.AndroidImportance };
  } catch (error) {
    return {};
  }
};

const canNotify = async (notifee) => {
  // Don't prompt here: the Notifications screen asks for consent and permission.
  if (!(await hasConsent(CONSENT_KEYS.NOTIFICATIONS))) return false;
  try {
    const settings = await notifee.getNotificationSettings();
    return settings?.authorizationStatus === 1; // AUTHORIZED
  } catch (error) {
    return false;
  }
};

const show = async (notifee, AndroidImportance, log) => {
  const channelId = await notifee.createChannel({
    id: "kto-notification-logs",
    name: "Notification Logs",
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    id: `log-${log.id}`,
    title: log?.title || "Notification",
    body: log?.message || "No message available",
    data: { targetScreen: "NotificationScreen" },
    android: {
      channelId,
      smallIcon: "ic_launcher",
      pressAction: { id: "open-notification-screen" },
    },
  });
};

let checking = false;

export const checkForNewNotifications = async () => {
  if (checking) return;
  checking = true;
  try {
    const res = await instance.get("/notifications/logs?page=1&limit=10");
    const raw = res?.data?.data?.logs || res?.data?.data || [];
    const logs = Array.isArray(raw) ? raw : [];
    if (logs.length === 0) return;

    const newest = Number(logs[0]?.id) || 0;
    if (!newest) return;

    const stored = await AsyncStorage.getItem(LAST_ID_KEY);
    // First run on this device: remember the latest entry instead of replaying history.
    if (stored === null) {
      await AsyncStorage.setItem(LAST_ID_KEY, String(newest));
      return;
    }

    const last = Number(stored) || 0;
    const fresh = logs
      .filter((l) => Number(l?.id) > last)
      .sort((a, b) => Number(a.id) - Number(b.id))
      .slice(-MAX_PER_CHECK);
    if (fresh.length === 0) return;

    // Save first so a slow display (or the Notifications screen polling at the same time) can't repeat it.
    await AsyncStorage.setItem(LAST_ID_KEY, String(newest));

    const { notifee, AndroidImportance } = loadNotifee();
    if (!notifee || !AndroidImportance || !(await canNotify(notifee))) return;
    for (const log of fresh) {
      await show(notifee, AndroidImportance, log);
    }
  } catch (error) {
    console.log("[notifications] check failed", error?.response?.status, error?.message);
  } finally {
    checking = false;
  }
};

// ---- Child alerts (SOS, low battery, uninstall attempt, geofence exit) ----

const ALERT_LAST_ID_KEY = "lastNotifiedAlertId";
const CHILD_TRACK_IDS_KEY = "childTrackIds"; // [{ trackId, label }], saved by the Home screen
// With nothing remembered yet, only alerts this recent are shown (not the whole history).
const FIRST_RUN_WINDOW_MS = 10 * 60 * 1000;

const ALERT_INFO = {
  SOS: { title: "SOS alert", fallback: "pressed the SOS button" },
  LOW_BATTERY: { title: "Low battery", fallback: "has a low battery" },
  UNINSTALL_ATTEMPT: { title: "Uninstall attempt", fallback: "tried to uninstall the app" },
  GEOFENCE_EXIT: { title: "Left safe zone", fallback: "left a safe zone" },
};

const readChildren = async () => {
  try {
    const raw = await AsyncStorage.getItem(CHILD_TRACK_IDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((c) => c?.trackId) : [];
  } catch (error) {
    return [];
  }
};

// Title and body text for an alert, shared by the status-bar notification and the Notice list.
export const describeAlert = (alert, label = "Your child") => {
  const info = ALERT_INFO[alert?.type] || { title: "Alert", fallback: "needs attention" };
  return {
    title: info.title,
    body: alert?.message ? `${label}: ${alert.message}` : `${label} ${info.fallback}`,
  };
};

// All alerts for every linked child (GET /alerts/{trackId}), each tagged with the child's label.
export const fetchChildAlerts = async () => {
  const children = await readChildren();
  const results = await Promise.all(
    children.map(async (child) => {
      try {
        const res = await instance.get(`/alerts/${child.trackId}`);
        const list = res?.data?.data?.alerts;
        return (Array.isArray(list) ? list : []).map((a) => ({ ...a, label: child.label }));
      } catch (error) {
        return [];
      }
    })
  );
  return results.flat().filter((a) => Number(a?.id) > 0);
};

const showAlert = async (notifee, AndroidImportance, alert, label) => {
  const { title, body } = describeAlert(alert, label);
  const channelId = await notifee.createChannel({
    id: "kto-child-alerts",
    name: "Child Alerts",
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    id: `alert-${alert.id}`,
    title,
    body,
    data: { targetScreen: "NotificationScreen" },
    android: {
      channelId,
      smallIcon: "ic_launcher",
      importance: AndroidImportance.HIGH,
      pressAction: { id: "open-notification-screen" },
    },
  });
};

let checkingAlerts = false;

export const checkForNewAlerts = async () => {
  if (checkingAlerts) return;
  checkingAlerts = true;
  try {
    const all = await fetchChildAlerts();
    if (all.length === 0) return;

    const newest = Math.max(...all.map((a) => Number(a.id)));
    const stored = await AsyncStorage.getItem(ALERT_LAST_ID_KEY);
    const last = stored === null ? null : Number(stored) || 0;

    const fresh = all
      .filter((a) => {
        if (a.status && a.status !== "active") return false;
        if (last !== null) return Number(a.id) > last;
        const ageMs = Date.now() - new Date(a.createdAt).getTime();
        return ageMs >= 0 && ageMs <= FIRST_RUN_WINDOW_MS;
      })
      .sort((a, b) => Number(a.id) - Number(b.id))
      .slice(-MAX_PER_CHECK);

    // Save first so an overlapping check can't show the same alert twice.
    await AsyncStorage.setItem(ALERT_LAST_ID_KEY, String(Math.max(newest, last ?? 0)));
    if (fresh.length === 0) return;

    const { notifee, AndroidImportance } = loadNotifee();
    if (!notifee || !AndroidImportance || !(await canNotify(notifee))) return;
    for (const alert of fresh) {
      await showAlert(notifee, AndroidImportance, alert, alert.label || "Your child");
    }
  } catch (error) {
    console.log("[alerts] check failed", error?.response?.status, error?.message);
  } finally {
    checkingAlerts = false;
  }
};

const checkAll = () => {
  checkForNewNotifications();
  checkForNewAlerts();
};

// Starts polling; returns a function that stops it.
export const startNotificationPolling = () => {
  let timer = null;

  const start = () => {
    if (timer) return;
    checkAll();
    timer = setInterval(checkAll, POLL_INTERVAL_MS);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  if (AppState.currentState === "active") start();
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") start();
    else stop();
  });

  return () => {
    stop();
    sub.remove();
  };
};
