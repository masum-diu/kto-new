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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import {
  extractEventData,
  extractPayload,
  extractStopReason,
  isAuthError,
  normalizeCandidate,
  normalizeSdp,
  normalizeSignalType,
} from "../../services/liveScreen/signalUtils";

// Same WebRTC flow as Live Screen / One-Way Audio, but the session is requested with
// mediaType "camera" so the child sends its camera instead of its screen.
const MEDIA_TYPE = "camera";

const STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  WAITING_ANSWER: "waiting_answer",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ENDED: "ended",
  ERROR: "error",
};

export default function RemoteCamera({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { selectedChild, familyId, pusherConfig, iceServers } = route.params || {};
  const [state, setState] = useState(STATE.IDLE);
  const [statusMessage, setStatusMessage] = useState("Choose a camera and tap Start Camera.");
  const [errorMessage, setErrorMessage] = useState("");
  const [remoteStream, setRemoteStream] = useState(null);
  const [facing, setFacing] = useState("back");
  const sessionIdRef = useRef(null);
  const tokenRef = useRef(null);
  const realtimeRef = useRef(null);
  const webrtcRef = useRef(null);
  const mountedRef = useRef(true);
  const answerAppliedRef = useRef(false);
  const answerApplyingRef = useRef(false);
  const streamReceivedRef = useRef(false);
  const streamWaitRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const isBusy = useMemo(
    () => [STATE.REQUESTING, STATE.CONNECTING, STATE.WAITING_ANSWER].includes(state),
    [state]
  );
  const live = state === STATE.CONNECTED;

  const updateError = useCallback((message) => {
    setErrorMessage(message);
    setState(STATE.ERROR);
    console.warn("[RemoteCamera] Error:", message);
  }, []);

  const isNoActiveSessionError = (error) => {
    const code = error?.response?.data?.code;
    const message = error?.response?.data?.message || error?.message || "";
    return (
      code === "NO_ACTIVE_SESSION" ||
      /No active WebRTC session found for this track/i.test(String(message))
    );
  };

  const cleanupConnection = useCallback(() => {
    webrtcRef.current?.close();
    webrtcRef.current = null;
    answerAppliedRef.current = false;
    answerApplyingRef.current = false;
    streamReceivedRef.current = false;
    clearTimeout(streamWaitRef.current);
    pendingCandidatesRef.current = [];
    realtimeRef.current?.unsubscribe?.();
    realtimeRef.current = null;
    setRemoteStream(null);
  }, []);

  const safeStopSession = useCallback(
    async (reason) => {
      const token = tokenRef.current;
      if (!token || !selectedChild) return;
      try {
        let sessionId = sessionIdRef.current;
        if (!sessionId) {
          const latest = await getLatestWebrtcOffer({ accessToken: token, trackId: selectedChild });
          sessionId = latest?.sessionId || null;
        }
        if (!sessionId) return;
        await stopWebrtcSession({
          accessToken: token,
          trackId: selectedChild,
          sessionId,
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

  const stopCamera = useCallback(
    async (reason = "parent-stopped") => {
      await safeStopSession(reason);
      cleanupConnection();
      sessionIdRef.current = null;
      if (mountedRef.current) {
        setState(STATE.ENDED);
        setStatusMessage("Camera session ended.");
      }
    },
    [cleanupConnection, safeStopSession]
  );

  const handleIncomingSignal = useCallback(
    async (rawEvent) => {
      try {
        const eventData = extractEventData(extractPayload(rawEvent));
        const signalType = normalizeSignalType(eventData?.signalType);
        if (!eventData?.trackId || eventData.trackId !== selectedChild) return;
        if (
          sessionIdRef.current &&
          eventData.sessionId &&
          sessionIdRef.current !== eventData.sessionId
        ) {
          return;
        }
        if (eventData.senderType === "parent") return;

        if (signalType === "answer") {
          // The same answer can arrive on several realtime channels; applying it twice makes
          // WebRTC throw, so only the first one is used.
          if (answerAppliedRef.current || answerApplyingRef.current) return;
          const answerSdp = normalizeSdp(eventData?.sdp || eventData);
          if (!answerSdp) return;
          answerApplyingRef.current = true;
          setState(STATE.CONNECTING);
          setStatusMessage("Answer received. Establishing connection...");
          await webrtcRef.current?.applyAnswer(answerSdp);
          answerAppliedRef.current = true;
          for (const queued of pendingCandidatesRef.current) {
            try {
              await webrtcRef.current?.addIceCandidate(queued);
            } catch (error) {
              // Ignore malformed queued candidates.
            }
          }
          pendingCandidatesRef.current = [];
          // ontrack can fire while the answer is being applied, i.e. before this line.
          if (!streamReceivedRef.current) {
            setStatusMessage("Connected to the device. Waiting for the camera...");
          }
          clearTimeout(streamWaitRef.current);
          streamWaitRef.current = setTimeout(() => {
            if (mountedRef.current && webrtcRef.current && !streamReceivedRef.current) {
              setStatusMessage(
                "Still no video after 20s. The child device may not be sending its camera, or camera permission is missing."
              );
            }
          }, 20000);
        } else if (signalType === "ice-candidate" || signalType === "candidate") {
          const candidate = normalizeCandidate(eventData?.candidate || eventData);
          if (!candidate) return;
          if (!answerAppliedRef.current) {
            pendingCandidatesRef.current.push(candidate);
            return;
          }
          try {
            await webrtcRef.current?.addIceCandidate(candidate);
          } catch (error) {
            // Early or duplicate candidates must not fail the session.
          }
        }
      } catch (error) {
        answerApplyingRef.current = false;
        console.warn("[RemoteCamera] signal processing failed:", error?.message || error);
        // Once the answer is applied, a bad extra signal must not tear down a working session.
        if (!answerAppliedRef.current) {
          updateError("Failed to process incoming WebRTC signal.");
        }
      }
    },
    [selectedChild, updateError]
  );

  const handleSessionStopped = useCallback(
    (rawEvent) => {
      const payload = extractPayload(rawEvent);
      const eventData = extractEventData(payload);
      if (eventData?.trackId !== selectedChild) return;
      if (
        sessionIdRef.current &&
        eventData?.sessionId &&
        eventData.sessionId !== sessionIdRef.current
      ) {
        return;
      }
      cleanupConnection();
      sessionIdRef.current = null;
      setState(STATE.ENDED);
      setStatusMessage(`Session stopped (${extractStopReason(payload) || "unknown"}).`);
    },
    [cleanupConnection, selectedChild]
  );

  const stopSessionById = async (token, sessionId, reason) => {
    try {
      await stopWebrtcSession({ accessToken: token, trackId: selectedChild, sessionId, reason });
    } catch (error) {
      if (!isNoActiveSessionError(error)) throw error;
    }
  };

  const resolveActiveSessionId = async (token, status) => {
    let id = status?.sessionId || null;
    if (!id) {
      const latest = await getLatestWebrtcOffer({ accessToken: token, trackId: selectedChild });
      id = latest?.sessionId || null;
    }
    if (!id) throw new Error("Active session found but sessionId is missing.");
    return id;
  };

  const startCamera = useCallback(async () => {
    if (!selectedChild) {
      updateError("Please select a child device first.");
      return;
    }

    try {
      setErrorMessage("");
      setStatusMessage("Checking current session status...");
      setState(STATE.REQUESTING);
      const token = await AsyncStorage.getItem("accessToken");
      tokenRef.current = token;
      if (!token) throw new Error("Authentication token missing. Please sign in again.");

      // Clear any session left over from Live Screen, audio, or an earlier camera session.
      const status = await getWebrtcStatus({ accessToken: token, trackId: selectedChild });
      if (status?.active) {
        setStatusMessage("Existing active session found. Restarting...");
        await stopSessionById(token, await resolveActiveSessionId(token, status), "parent-restart");
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      sessionIdRef.current = null;
      answerAppliedRef.current = false;
      answerApplyingRef.current = false;
      streamReceivedRef.current = false;
      pendingCandidatesRef.current = [];

      realtimeRef.current?.unsubscribe?.();
      realtimeRef.current = createFamilyRealtime({
        familyId,
        trackId: selectedChild,
        pusherConfig: {
          key: pusherConfig?.key || (await AsyncStorage.getItem("pusherKey")) || "",
          cluster: pusherConfig?.cluster || (await AsyncStorage.getItem("pusherCluster")) || "",
        },
        onSignal: handleIncomingSignal,
        onSessionStopped: handleSessionStopped,
      });
      // Don't ask the child to start until we are listening for its answer.
      setStatusMessage("Connecting...");
      await realtimeRef.current.ready;

      const requestPayload = {
        accessToken: token,
        trackId: selectedChild,
        mediaType: MEDIA_TYPE,
        metadata: { reason: "Remote camera check-in", camera: facing },
      };

      let session;
      try {
        session = await requestWebrtcSession(requestPayload);
      } catch (requestError) {
        const isConflict =
          requestError?.response?.status === 409 ||
          requestError?.response?.data?.code === "SESSION_ACTIVE";
        if (!isConflict) throw requestError;

        setStatusMessage("Active session conflict. Recovering previous session...");
        const afterConflict = await getWebrtcStatus({ accessToken: token, trackId: selectedChild });
        await stopSessionById(
          token,
          await resolveActiveSessionId(token, afterConflict),
          "parent-recover-conflict"
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        session = await requestWebrtcSession(requestPayload);
      }

      sessionIdRef.current = session?.sessionId || null;
      if (!sessionIdRef.current) throw new Error("No sessionId returned from WebRTC request.");

      webrtcRef.current?.close();
      webrtcRef.current = new ParentWebrtcManager({
        iceServers,
        onRemoteStream: (stream) => {
          streamReceivedRef.current = true;
          clearTimeout(streamWaitRef.current);
          setRemoteStream(stream);
          setState(STATE.CONNECTED);
          setStatusMessage(`Live: ${facing} camera`);
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

      setState(STATE.WAITING_ANSWER);
      setStatusMessage("Request sent. Waiting for the child device...");
    } catch (error) {
      cleanupConnection();
      sessionIdRef.current = null;
      if (isAuthError(error)) {
        updateError("Session expired. Please sign in again.");
        return;
      }
      updateError(
        error?.response?.data?.message || error?.message || "Unable to start camera session."
      );
    }
  }, [
    cleanupConnection,
    facing,
    familyId,
    handleIncomingSignal,
    handleSessionStopped,
    iceServers,
    pusherConfig,
    selectedChild,
    updateError,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera("parent-unmount");
    };
  }, [stopCamera]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active" && sessionIdRef.current) stopCamera("app-backgrounded");
    });
    return () => sub.remove();
  }, [stopCamera]);

  const sessionActive = isBusy || live;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Remote Camera</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.videoCard}>
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.rtcView}
            objectFit="contain"
            mirror={false}
          />
        ) : (
          <View style={styles.placeholder}>
            {isBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="videocam-outline" size={48} color="#bbb" />
            )}
            <Text style={styles.placeholderText}>
              {isBusy ? "Waiting for the camera..." : "Camera is off"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cameraRow}>
        {["back", "front"].map((side) => (
          <TouchableOpacity
            key={side}
            disabled={sessionActive}
            onPress={() => setFacing(side)}
            style={[styles.cameraChip, facing === side && styles.cameraChipActive, sessionActive && styles.disabled]}
          >
            <Ionicons
              name={side === "back" ? "camera-outline" : "camera-reverse-outline"}
              size={18}
              color={facing === side ? "#fff" : "#6a1b9a"}
            />
            <Text style={[styles.cameraChipText, facing === side && styles.cameraChipTextActive]}>
              {side === "back" ? "Back camera" : "Front camera"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.statusText}>
        {state === STATE.ERROR ? "Something went wrong" : statusMessage}
      </Text>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={styles.actionRow}>
        <TouchableOpacity
          disabled={sessionActive}
          onPress={startCamera}
          style={[styles.actionButton, styles.startBtn, sessionActive && styles.disabled]}
        >
          <Text style={styles.actionButtonText}>Start Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!sessionActive}
          onPress={() => stopCamera("parent-stopped")}
          style={[styles.actionButton, styles.stopBtn, !sessionActive && styles.disabled]}
        >
          <Text style={styles.actionButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3edff", padding: 16, paddingTop: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#1f1f1f" },
  videoCard: {
    height: 360,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  rtcView: { width: "100%", height: "100%", backgroundColor: "#111" },
  placeholder: { justifyContent: "center", alignItems: "center", gap: 10 },
  placeholderText: { color: "#ddd", fontSize: 14 },
  cameraRow: { flexDirection: "row", marginTop: 14, gap: 10 },
  cameraChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  cameraChipActive: { backgroundColor: "#6a1b9a" },
  cameraChipText: { fontSize: 13, fontWeight: "600", color: "#6a1b9a" },
  cameraChipTextActive: { color: "#fff" },
  statusText: { marginTop: 14, color: "#5e5e5e" },
  errorText: { marginTop: 8, color: "#b00020", fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  startBtn: { backgroundColor: "#6a1b9a" },
  stopBtn: { backgroundColor: "#b63d3d" },
  disabled: { opacity: 0.45 },
  actionButtonText: { color: "#fff", fontWeight: "700" },
});
