import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RTCView } from "react-native-webrtc";
import {
  getLatestWebrtcOffer,
  getWebrtcStatus,
  requestWebrtcSession,
  sendWebrtcSignal,
  stopWebrtcSession,
} from "../../services/liveScreen/webrtcApi";
import { createFamilyRealtime } from "../../services/liveScreen/familyRealtime";
import { ParentWebrtcManager } from "../../services/liveScreen/webrtcManager";

const LIVE_STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
   WAITING_ANSWER: "waiting_answer",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ENDED: "ended",
  ERROR: "error",
};

const extractPayload = (event) => {
  const payload = event?.data || event?.payload || event || {};
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch (error) {
      return {};
    }
  }
  return payload;
};

const extractEventData = (payload) =>
  payload?.data?.signal ||
  payload?.signal ||
  payload?.data ||
  payload;

const extractStopReason = (payload) => {
  const base = extractPayload(payload);
  const eventData = extractEventData(base);
  return String(
    eventData?.reason ||
      eventData?.stopReason ||
      eventData?.stop_reason ||
      base?.reason ||
      "unknown"
  ).trim();
};

const normalizeSdp = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value.sdp === "string") return value.sdp;
  return null;
};

const normalizeSignalType = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase().replace(/_/g, "-");
};

const normalizeCandidate = (value) => {
  if (!value) return null;

  const raw = typeof value === "string" ? { candidate: value } : value;
  const candidate = raw?.candidate || raw?.iceCandidate || raw?.data?.candidate;
  if (!candidate) return null;

  return {
    candidate,
    sdpMid: raw?.sdpMid ?? raw?.id ?? null,
    sdpMLineIndex:
      raw?.sdpMLineIndex ?? raw?.label ?? raw?.sdpMlineIndex ?? 0,
  };
};

const isAuthError = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const message = String(error?.response?.data?.message || error?.message || "");
  return (
    status === 401 ||
    code === "UNAUTHORIZED" ||
    /invalid|expired token|unauthorized/i.test(message)
  );
};

export default function LiveScreen({ route }) {
  const navigation = useNavigation();
  const { selectedChild, familyId, pusherConfig, iceServers } = route.params || {};
  const [liveState, setLiveState] = useState(LIVE_STATE.IDLE);
  const [remoteStream, setRemoteStream] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Tap Start Live Screen to begin.");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    lastSignalType: "none",
    lastSignalSessionId: "n/a",
    sentIceCount: 0,
    receivedIceCount: 0,
    queuedIceCount: 0,
    answerApplied: false,
    onTrackFired: false,
  });
  const [lastStopReason, setLastStopReason] = useState("n/a");
  const [lastStopPayload, setLastStopPayload] = useState("n/a");
  const sessionIdRef = useRef(null);
  const tokenRef = useRef(null);
  const realtimeRef = useRef(null);
  const webrtcRef = useRef(null);
  const mountedRef = useRef(true);
  const answerAppliedRef = useRef(false);
  const pendingRemoteCandidatesRef = useRef([]);

  const isBusy = useMemo(
    () => [LIVE_STATE.REQUESTING, LIVE_STATE.CONNECTING].includes(liveState),
    [liveState]
  );

  const updateError = useCallback((message) => {
    setErrorMessage(message);
    setLiveState(LIVE_STATE.ERROR);
    console.warn("[LiveScreen] Error:", message);
  }, []);

  const isNoActiveSessionError = useCallback((error) => {
    const code = error?.response?.data?.code;
    const message = error?.response?.data?.message || error?.message || "";
    return (
      code === "NO_ACTIVE_SESSION" ||
      /No active WebRTC session found for this track/i.test(String(message))
    );
  }, []);

  const cleanupConnection = useCallback(() => {
    webrtcRef.current?.close();
    webrtcRef.current = null;
    setRemoteStream(null);
    answerAppliedRef.current = false;
    pendingRemoteCandidatesRef.current = [];
    setDebugInfo((prev) => ({
      ...prev,
      answerApplied: false,
      onTrackFired: false,
      queuedIceCount: 0,
    }));
    realtimeRef.current?.unsubscribe?.();
    realtimeRef.current = null;
  }, []);

  const safeStopSession = useCallback(
    async (reason = "parent-stopped") => {
      const token = tokenRef.current;
      if (!token || !selectedChild) return;
      try {
        let sessionIdToStop = sessionIdRef.current;
        if (!sessionIdToStop) {
          const latestOffer = await getLatestWebrtcOffer({
            accessToken: token,
            trackId: selectedChild,
          });
          sessionIdToStop = latestOffer?.sessionId || null;
        }
        if (!sessionIdToStop) {
          return;
        }
        await stopWebrtcSession({
          accessToken: token,
          trackId: selectedChild,
          sessionId: sessionIdToStop,
          reason: reason || "parent-ended",
        });
      } catch (error) {
        if (isAuthError(error) && mountedRef.current) {
          setErrorMessage("Session expired. Please sign in again.");
        }
      }
    },
    [selectedChild]
  );

  const stopLiveSession = useCallback(
    async (reason = "parent-stopped") => {
      await safeStopSession(reason);
      cleanupConnection();
      sessionIdRef.current = null;
      if (mountedRef.current) {
        setLiveState(LIVE_STATE.ENDED);
        setStatusMessage("Live session ended.");
      }
    },
    [cleanupConnection, safeStopSession]
  );

  const handleIncomingSignal = useCallback(
    async (rawEvent) => {
      try {
        const payload = extractPayload(rawEvent);
        const eventData = extractEventData(payload);
        const trackId = eventData?.trackId;
        const sessionId = eventData?.sessionId;
        const signalType = normalizeSignalType(eventData?.signalType);
        const senderType = eventData?.senderType;
        setDebugInfo((prev) => ({
          ...prev,
          lastSignalType: signalType || "unknown",
          lastSignalSessionId: sessionId || "n/a",
        }));

        if (!trackId || trackId !== selectedChild) return;
        if (sessionIdRef.current && sessionId && sessionIdRef.current !== sessionId) return;
        // Some backends may echo parent-originated signals on same channel.
        if (senderType === "parent") return;

        if (signalType === "answer") {
          const answerSdp = normalizeSdp(eventData?.sdp || eventData);
          if (!answerSdp) return;
          setLiveState(LIVE_STATE.CONNECTING);
          setStatusMessage("Answer received. Establishing connection...");
          await webrtcRef.current?.applyAnswer(answerSdp);
          answerAppliedRef.current = true;
          setDebugInfo((prev) => ({ ...prev, answerApplied: true }));
          if (pendingRemoteCandidatesRef.current.length > 0) {
            for (const queuedCandidate of pendingRemoteCandidatesRef.current) {
              try {
                await webrtcRef.current?.addIceCandidate(queuedCandidate);
                setDebugInfo((prev) => ({
                  ...prev,
                  receivedIceCount: prev.receivedIceCount + 1,
                }));
              } catch (error) {
                // Ignore malformed candidates from queue.
              }
            }
            pendingRemoteCandidatesRef.current = [];
            setDebugInfo((prev) => ({ ...prev, queuedIceCount: 0 }));
          }
          setStatusMessage("Answer applied. Waiting for remote video track...");
        } else if (signalType === "ice-candidate" || signalType === "candidate") {
          const normalizedCandidate = normalizeCandidate(eventData?.candidate || eventData);
          if (!normalizedCandidate) return;
          if (!answerAppliedRef.current) {
            pendingRemoteCandidatesRef.current.push(normalizedCandidate);
            setDebugInfo((prev) => ({
              ...prev,
              queuedIceCount: pendingRemoteCandidatesRef.current.length,
            }));
            return;
          }
          try {
            await webrtcRef.current?.addIceCandidate(normalizedCandidate);
            setDebugInfo((prev) => ({
              ...prev,
              receivedIceCount: prev.receivedIceCount + 1,
            }));
          } catch (error) {
            // Some candidates can arrive early or duplicated; do not fail the session.
          }
        }
      } catch (error) {
        updateError("Failed to process incoming WebRTC signal.");
      }
    },
    [selectedChild, updateError]
  );

  const handleSessionStoppedEvent = useCallback(
    async (rawEvent) => {
      const payload = extractPayload(rawEvent);
      const eventData = extractEventData(payload);
      if (eventData?.trackId !== selectedChild) return;
      if (
        sessionIdRef.current &&
        eventData?.sessionId &&
        eventData?.sessionId !== sessionIdRef.current
      ) {
        return;
      }
      const reason = extractStopReason(payload);
      setLastStopReason(reason || "unknown");
      try {
        setLastStopPayload(JSON.stringify(payload));
      } catch (error) {
        setLastStopPayload(String(payload));
      }
      cleanupConnection();
      sessionIdRef.current = null;
      setLiveState(LIVE_STATE.ENDED);
      setStatusMessage(`Session stopped (${reason || "unknown"}).`);
    },
    [cleanupConnection, selectedChild]
  );

  const setupRealtime = useCallback((runtimePusherConfig) => {
    realtimeRef.current?.unsubscribe?.();
    realtimeRef.current = createFamilyRealtime({
      familyId,
      trackId: selectedChild,
      pusherConfig: runtimePusherConfig,
      onSignal: handleIncomingSignal,
      onSessionStopped: handleSessionStoppedEvent,
    });
  }, [familyId, handleIncomingSignal, handleSessionStoppedEvent, selectedChild]);

  const startLiveSession = useCallback(async () => {
    if (!selectedChild) {
      updateError("Please select a child device before starting Live Screen.");
      return;
    }

    try {
      setErrorMessage("");
      setStatusMessage("Checking current session status...");
      setLiveState(LIVE_STATE.REQUESTING);
      const token = await AsyncStorage.getItem("accessToken");
      tokenRef.current = token;
      if (!token) {
        throw new Error("Authentication token missing. Please sign in again.");
      }

      setLoadingStatus(true);
      const status = await getWebrtcStatus({ accessToken: token, trackId: selectedChild });
      setLoadingStatus(false);
      if (status?.active) {
        setStatusMessage("Existing active session found. Stopping and restarting...");
        let activeSessionId = status?.sessionId || null;
        if (!activeSessionId) {
          const latestOffer = await getLatestWebrtcOffer({
            accessToken: token,
            trackId: selectedChild,
          });
          activeSessionId = latestOffer?.sessionId || null;
        }
        if (!activeSessionId) {
          throw new Error("Active session found but sessionId is missing.");
        }
        try {
          await stopWebrtcSession({
            accessToken: token,
            trackId: selectedChild,
            sessionId: activeSessionId,
            reason: "parent-restart",
          });
        } catch (stopError) {
          if (!isNoActiveSessionError(stopError)) {
            throw stopError;
          }
          setStatusMessage("Previous session already cleared. Continuing...");
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      sessionIdRef.current = null;
      answerAppliedRef.current = false;
      pendingRemoteCandidatesRef.current = [];
      setDebugInfo({
        lastSignalType: "none",
        lastSignalSessionId: "n/a",
        sentIceCount: 0,
        receivedIceCount: 0,
        queuedIceCount: 0,
        answerApplied: false,
        onTrackFired: false,
      });
      setLastStopReason("n/a");
      setLastStopPayload("n/a");

      const runtimePusherConfig = {
        key: pusherConfig?.key || (await AsyncStorage.getItem("pusherKey")) || "",
        cluster:
          pusherConfig?.cluster || (await AsyncStorage.getItem("pusherCluster")) || "",
      };
      setupRealtime(runtimePusherConfig);

      const requestPayload = {
        accessToken: token,
        trackId: selectedChild,
        mediaType: "screen",
        intervalMs: 2500,
        metadata: { reason: "Live check-in" },
      };

      let session;
      try {
        session = await requestWebrtcSession(requestPayload);
      } catch (requestError) {
        const isActiveSessionConflict =
          requestError?.response?.status === 409 ||
          requestError?.response?.data?.code === "SESSION_ACTIVE";

        if (!isActiveSessionConflict) {
          throw requestError;
        }

        setStatusMessage("Active session conflict. Recovering previous session...");
        const statusAfterConflict = await getWebrtcStatus({
          accessToken: token,
          trackId: selectedChild,
        });
        let conflictSessionId = statusAfterConflict?.sessionId || null;
        if (!conflictSessionId) {
          const latestOffer = await getLatestWebrtcOffer({
            accessToken: token,
            trackId: selectedChild,
          });
          conflictSessionId = latestOffer?.sessionId || null;
        }
        if (!conflictSessionId) {
          throw new Error("Active session exists but sessionId could not be resolved.");
        }

        try {
          await stopWebrtcSession({
            accessToken: token,
            trackId: selectedChild,
            sessionId: conflictSessionId,
            reason: "parent-recover-conflict",
          });
        } catch (stopError) {
          if (!isNoActiveSessionError(stopError)) {
            throw stopError;
          }
          setStatusMessage("Conflict session already cleared. Retrying request...");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        session = await requestWebrtcSession(requestPayload);
      }

      sessionIdRef.current = session?.sessionId || null;
      if (!sessionIdRef.current) {
        throw new Error("No sessionId returned from WebRTC request.");
      }

      webrtcRef.current?.close();
      webrtcRef.current = new ParentWebrtcManager({
        iceServers,
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
          setLiveState(LIVE_STATE.CONNECTED);
          setStatusMessage("Remote stream is visible.");
          setDebugInfo((prev) => ({ ...prev, onTrackFired: true }));
        },
        onIceCandidate: async (candidate) => {
          if (!sessionIdRef.current) return;
          await sendWebrtcSignal({
            accessToken: tokenRef.current,
            trackId: selectedChild,
            signalType: "ice-candidate",
            senderType: "parent",
            target: "child",
            sessionId: sessionIdRef.current,
            candidate: {
              candidate: candidate?.candidate,
              sdpMid: candidate?.sdpMid ?? null,
              sdpMLineIndex: candidate?.sdpMLineIndex ?? 0,
            },
          });
          setDebugInfo((prev) => ({
            ...prev,
            sentIceCount: prev.sentIceCount + 1,
          }));
        },
      });

      const offer = await webrtcRef.current.createOffer();
      await sendWebrtcSignal({
        accessToken: token,
        trackId: selectedChild,
        signalType: "offer",
        senderType: "parent",
        target: "child",
        sessionId: sessionIdRef.current,
        sdp: offer.sdp,
      });

      setLiveState(LIVE_STATE.WAITING_ANSWER);
      setStatusMessage("Offer sent. Waiting for child answer...");
    } catch (error) {
      setLoadingStatus(false);
      cleanupConnection();
      sessionIdRef.current = null;
      if (isAuthError(error)) {
        updateError("Session expired. Please sign in again.");
        return;
      }
      updateError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start Live Screen session."
      );
    }
  }, [
    cleanupConnection,
    iceServers,
    isNoActiveSessionError,
    pusherConfig,
    selectedChild,
    setupRealtime,
    updateError,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopLiveSession("parent-unmount");
    };
  }, [stopLiveSession]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" && sessionIdRef.current) {
        stopLiveSession("app-backgrounded");
      }
    });
    return () => sub.remove();
  }, [stopLiveSession]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Live Screen</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.streamCard}>
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.rtcView}
            objectFit="contain"
            mirror={false}
          />
        ) : (
          <View style={styles.placeholder}>
            {(isBusy || loadingStatus) && <ActivityIndicator color="#6a1b9a" />}
            <Text style={styles.placeholderText}>Waiting for remote stream...</Text>
          </View>
        )}
      </View>

      <Text style={styles.stateLabel}>State: {liveState}</Text>
      <Text style={styles.statusText}>
        {liveState === LIVE_STATE.ENDED
          ? `Session stopped (${lastStopReason || "unknown"}).`
          : statusMessage}
      </Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <View style={styles.debugCard}>
        <Text style={styles.debugTitle}>Debug</Text>
        <Text style={styles.debugText}>sessionId: {sessionIdRef.current || "n/a"}</Text>
        <Text style={styles.debugText}>lastSignal: {debugInfo.lastSignalType}</Text>
        <Text style={styles.debugText}>signalSessionId: {debugInfo.lastSignalSessionId}</Text>
        <Text style={styles.debugText}>answerApplied: {String(debugInfo.answerApplied)}</Text>
        <Text style={styles.debugText}>onTrack: {String(debugInfo.onTrackFired)}</Text>
        <Text style={styles.debugText}>lastStopReason: {lastStopReason}</Text>
        <Text style={styles.debugText}>lastStopPayload: {lastStopPayload}</Text>
        <Text style={styles.debugText}>
          ICE sent/recv/queued: {debugInfo.sentIceCount}/{debugInfo.receivedIceCount}/{debugInfo.queuedIceCount}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          disabled={isBusy || liveState === LIVE_STATE.WAITING_ANSWER}
          onPress={startLiveSession}
          style={[styles.actionButton, styles.startBtn]}
        >
          <Text style={styles.actionButtonText}>Start Live Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!sessionIdRef.current && liveState !== LIVE_STATE.CONNECTED}
          onPress={() => stopLiveSession("parent-stopped")}
          style={[styles.actionButton, styles.stopBtn]}
        >
          <Text style={styles.actionButtonText}>Stop Live Screen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3edff",
    padding: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  streamCard: {
    height: 280,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  rtcView: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#ddd",
    fontSize: 14,
  },
  stateLabel: {
    marginTop: 14,
    fontWeight: "700",
    color: "#222",
  },
  statusText: {
    marginTop: 6,
    color: "#5e5e5e",
  },
  errorText: {
    marginTop: 8,
    color: "#b00020",
    fontWeight: "600",
  },
  debugCard: {
    marginTop: 10,
    backgroundColor: "#f0e9ff",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd1ff",
  },
  debugTitle: {
    fontWeight: "700",
    color: "#3f2a60",
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    color: "#4b4b4b",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  startBtn: {
    backgroundColor: "#6a1b9a",
  },
  stopBtn: {
    backgroundColor: "#b63d3d",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
