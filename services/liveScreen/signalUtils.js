// Helpers for parsing realtime WebRTC signalling events (shared by Live Screen and One-Way Audio).

export const extractPayload = (event) => {
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

export const extractEventData = (payload) =>
  payload?.data?.signal ||
  payload?.signal ||
  payload?.data ||
  payload;

export const extractStopReason = (payload) => {
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

export const normalizeSdp = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value.sdp === "string") return value.sdp;
  return null;
};

export const normalizeSignalType = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase().replace(/_/g, "-");
};

export const normalizeCandidate = (value) => {
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

export const isAuthError = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const message = String(error?.response?.data?.message || error?.message || "");
  return (
    status === 401 ||
    code === "UNAUTHORIZED" ||
    /invalid|expired token|unauthorized/i.test(message)
  );
};
