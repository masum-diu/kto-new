import PusherModule from "pusher-js/react-native";

const DEFAULT_PUSHER_CONFIG = {
  key: "",
  cluster: "",
};

export const createFamilyRealtime = ({
  familyId,
  trackId,
  pusherConfig = DEFAULT_PUSHER_CONFIG,
  onSignal,
  onSessionStopped,
}) => {
  if (!familyId && !trackId) {
    throw new Error("familyId or trackId is required for realtime subscription");
  }

  if (!pusherConfig?.key || !pusherConfig?.cluster) {
    throw new Error(
      "Missing Pusher config. Set key and cluster before using Live Screen."
    );
  }

  const PusherClient =
    PusherModule?.Pusher ||
    PusherModule?.default?.Pusher ||
    PusherModule?.default ||
    PusherModule;
  if (typeof PusherClient !== "function") {
    throw new Error("Pusher client initialization failed.");
  }

  const channelNames = [
    familyId ? `family_${familyId}` : null,
    trackId ? `track_${trackId}` : null,
    trackId ? `screen_share_${trackId}` : null,
    trackId ? `screen-share-${trackId}` : null,
  ].filter(Boolean);

  const pusher = new PusherClient(pusherConfig.key, {
    cluster: pusherConfig.cluster,
    forceTLS: true,
  });
  pusher.connection.bind("state_change", (states) => {
    console.log("[Realtime] connection", states?.previous, "->", states?.current);
  });
  pusher.connection.bind("error", (err) => {
    console.log("[Realtime] connection error", err?.error?.data?.message || err?.message || err);
  });
  // Resolves once a channel is subscribed (or after a timeout), so callers can wait before
  // starting a session; events published before subscribing would otherwise be missed.
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });
  const readyTimer = setTimeout(() => resolveReady(false), 8000);

  const channels = channelNames.map((name) => {
    const channel = pusher.subscribe(name);
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("[Realtime] subscribed", name);
      clearTimeout(readyTimer);
      resolveReady(true);
    });
    channel.bind("pusher:subscription_error", (status) =>
      console.log("[Realtime] subscription error", name, status)
    );
    return { name, channel };
  });

  const signalHandler = (payload) => {
    const data = payload?.data?.signal || payload?.signal || payload?.data || payload || {};
    console.log("[Realtime] signal", data?.signalType, "from", data?.senderType, "session", data?.sessionId);
    onSignal?.(payload);
  };
  const stoppedHandler = (payload) => {
    onSessionStopped?.(payload);
  };

  channels.forEach(({ channel }) => {
    channel.bind("webrtc-signal", signalHandler);
    channel.bind("webrtc_signal", signalHandler);
    channel.bind("webrtc-session-stopped", stoppedHandler);
    channel.bind("webrtc_session_stopped", stoppedHandler);
  });

  return {
    channelNames,
    ready,
    unsubscribe: () => {
      clearTimeout(readyTimer);
      try {
        channels.forEach(({ name, channel }) => {
          channel.unbind("webrtc-signal", signalHandler);
          channel.unbind("webrtc_signal", signalHandler);
          channel.unbind("webrtc-session-stopped", stoppedHandler);
          channel.unbind("webrtc_session_stopped", stoppedHandler);
          pusher.unsubscribe(name);
        });
        pusher.disconnect();
      } catch (error) {
        // cleanup should be best-effort and never crash unmount flow
      }
    },
  };
};
