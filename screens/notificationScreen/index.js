import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, PermissionsAndroid, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import instance from "../../api/api_instance";
import ProminentDisclosureModal from "../../components/ProminentDisclosureModal";
import { DISCLOSURE } from "../../constants/disclosureContent";
import { CONSENT_KEYS, grantConsent, hasConsent } from "../../utils/disclosureConsent";

export default function Notifications() {
  const navigation = useNavigation();
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedLogId, setHighlightedLogId] = useState(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const lastTopLogIdRef = useRef(null);

  const requestNotificationPermission = async () => {
    if (Platform.OS !== "android") return;
    if (Platform.Version < 33) return;

    const accepted = await hasConsent(CONSENT_KEYS.NOTIFICATIONS);
    if (!accepted) {
      setShowDisclosure(true);
      return;
    }

    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } catch (error) {
      console.log("Notification permission error:", error);
    }
  };

  const handleNotificationConsentAgree = async () => {
    await grantConsent(CONSENT_KEYS.NOTIFICATIONS);
    setShowDisclosure(false);
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } catch (error) {
      console.log("Notification permission error:", error);
    }
  };

  const showStatusBarNotification = async (logItem) => {
    try {
      const notifeeModule = require("@notifee/react-native");
      const notifee = notifeeModule?.default;
      const AndroidImportance = notifeeModule?.AndroidImportance;

      if (!notifee || !AndroidImportance) {
        console.log("Notifee native module not ready.");
        return;
      }

      const channelId = await notifee.createChannel({
        id: "kto-notification-logs",
        name: "Notification Logs",
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: logItem?.title || "Notification",
        body: logItem?.message || "No message available",
        data: {
          targetScreen: "NotificationScreen",
        },
        android: {
          channelId,
          smallIcon: "ic_launcher",
          pressAction: {
            id: "open-notification-screen",
          },
        },
      });
    } catch (error) {
      console.log("Show notification error:", error);
    }
  };

  const notifyIfNewLog = async (logs) => {
    if (!Array.isArray(logs) || logs.length === 0) return;

    const latestLog = logs[0];
    const latestLogId = String(latestLog?.id || "");
    if (!latestLogId) return;

    const notifiedLogId = await AsyncStorage.getItem("lastNotifiedLogId");
    if (notifiedLogId === latestLogId) return;

    await showStatusBarNotification(latestLog);
    await AsyncStorage.setItem("lastNotifiedLogId", latestLogId);
  };

  const getNotificationLogs = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await instance.get("/notifications/logs?page=1&limit=10", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const logs = response?.data?.data?.logs || response?.data?.data || [];
      const parsedLogs = Array.isArray(logs) ? logs : [];
      const latestLogId = parsedLogs[0]?.id ?? null;

      if (lastTopLogIdRef.current !== null && latestLogId && latestLogId !== lastTopLogIdRef.current) {
        setHighlightedLogId(latestLogId);
      }
      lastTopLogIdRef.current = latestLogId;

      setNotificationLogs(parsedLogs);
      await notifyIfNewLog(parsedLogs);
    } catch (error) {
      console.log("Notification logs fetch error:", error);
      setNotificationLogs([]);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    getNotificationLogs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getNotificationLogs();

      const intervalId = setInterval(() => {
        getNotificationLogs({ silent: true });
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }, [])
  );

  const getMessageFromLog = (logItem) => logItem?.message || "No message available";
  const getTitleFromLog = (logItem) => logItem?.title || "Notification";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/angle-small-left.png")}
            style={{ width: 35, height: 35 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#8C52FF" />
            <Text style={styles.loaderText}>Loading notifications...</Text>
          </View>
        ) : notificationLogs.length > 0 ? (
          notificationLogs.map((logItem, index) => {
            const isHighlighted = logItem?.id === highlightedLogId;
            return (
              <TouchableOpacity
                key={logItem?.id || index}
                style={[styles.card, isHighlighted && styles.highlightCard]}
                onPress={() => showStatusBarNotification(logItem)}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={[styles.title, isHighlighted && styles.highlightTitle]}>
                    {getTitleFromLog(logItem)}
                  </Text>
                  <Text style={[styles.subtitle, isHighlighted && styles.highlightSubtitle]}>
                    {getMessageFromLog(logItem)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No notification logs available.</Text>
        )}
      </ScrollView>

      <ProminentDisclosureModal
        visible={showDisclosure}
        {...DISCLOSURE.NOTIFICATIONS}
        onAgree={handleNotificationConsentAgree}
        onDecline={() => setShowDisclosure(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0e6f7",
  },
  //  backButton: {
  //   position: "absolute",
  //   top: 30,
  //   left: 20,
  // },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: "#B066FF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "medium",
    color: "#000",
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  highlightCard: {
    backgroundColor: "#F5EDFF",
    borderWidth: 1,
    borderColor: "#8C52FF",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8C52FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  highlightTitle: {
    color: "#6a1b9a",
    fontWeight: "700",
  },
  highlightSubtitle: {
    color: "#5e35b1",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 30,
    fontSize: 14,
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
});
