import instance from "../../api/api_instance";

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  if (!error?.response) {
    return true;
  }
  return RETRYABLE_STATUS.has(error.response.status);
};

const requestWithRetry = async (requestFn, retries = 2, retryDelayMs = 500) => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }
      await sleep(retryDelayMs * (attempt + 1));
      attempt += 1;
    }
  }
  throw new Error("Request failed after retries");
};

const authHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const logApiStart = (name, payload) => {
  console.log(`[LiveScreen API] ${name} -> request`, payload);
};

const logApiSuccess = (name, data) => {
  console.log(`[LiveScreen API] ${name} -> response`, data);
};

const logApiError = (name, error) => {
  console.error(`[LiveScreen API] ${name} -> error`, {
    status: error?.response?.status,
    data: error?.response?.data,
    message: error?.message,
  });
};

export const requestWebrtcSession = async ({
  accessToken,
  trackId,
  mediaType = "screen",
  intervalMs,
  metadata,
}) => {
  const payload = { trackId, mediaType };
  if (intervalMs) payload.intervalMs = intervalMs;
  if (metadata) payload.metadata = metadata;

  const apiName = "POST /screen-share/webrtc/request";
  logApiStart(apiName, payload);
  try {
    const response = await requestWithRetry(() =>
      instance.post("/screen-share/webrtc/request", payload, {
        headers: authHeaders(accessToken),
      })
    );
    logApiSuccess(apiName, response?.data);
    return response?.data?.data;
  } catch (error) {
    logApiError(apiName, error);
    throw error;
  }
};

export const sendWebrtcSignal = async ({
  accessToken,
  trackId,
  signalType,
  senderType = "parent",
  target = "child",
  sessionId,
  sdp,
  candidate,
}) => {
  const payload = {
    trackId,
    signalType,
    senderType,
    target,
  };
  if (sessionId) payload.sessionId = sessionId;
  if (sdp) payload.sdp = sdp;
  if (candidate) payload.candidate = candidate;

  const apiName = "POST /screen-share/webrtc/signal";
  logApiStart(apiName, payload);
  try {
    const response = await requestWithRetry(() =>
      instance.post("/screen-share/webrtc/signal", payload, {
        headers: authHeaders(accessToken),
      })
    );
    logApiSuccess(apiName, response?.data);
    return response?.data?.data;
  } catch (error) {
    logApiError(apiName, error);
    throw error;
  }
};

export const stopWebrtcSession = async ({
  accessToken,
  trackId,
  sessionId,
  reason,
}) => {
  const payload = { trackId };
  if (sessionId) payload.sessionId = sessionId;
  if (reason) payload.reason = reason;

  const apiName = "POST /screen-share/webrtc/stop";
  logApiStart(apiName, payload);
  try {
    const response = await requestWithRetry(() =>
      instance.post("/screen-share/webrtc/stop", payload, {
        headers: authHeaders(accessToken),
      })
    );
    logApiSuccess(apiName, response?.data);
    return response?.data?.data;
  } catch (error) {
    logApiError(apiName, error);
    throw error;
  }
};

export const getWebrtcStatus = async ({ accessToken, trackId }) => {
  const apiName = "GET /screen-share/webrtc/status/:trackId";
  logApiStart(apiName, { trackId });
  try {
    const response = await requestWithRetry(() =>
      instance.get(`/screen-share/webrtc/status/${trackId}`, {
        headers: authHeaders(accessToken),
      })
    );
    logApiSuccess(apiName, response?.data);
    return response?.data?.data;
  } catch (error) {
    logApiError(apiName, error);
    throw error;
  }
};

export const getLatestWebrtcOffer = async ({ accessToken, trackId }) => {
  const apiName = "GET /screen-share/webrtc/latest-offer/:trackId";
  logApiStart(apiName, { trackId });
  try {
    const response = await requestWithRetry(() =>
      instance.get(`/screen-share/webrtc/latest-offer/${trackId}`, {
        headers: authHeaders(accessToken),
      })
    );
    logApiSuccess(apiName, response?.data);
    return response?.data?.data;
  } catch (error) {
    logApiError(apiName, error);
    throw error;
  }
};
