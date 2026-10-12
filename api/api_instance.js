import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "https://api.kto.solutions/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the stored token unless the caller already set an Authorization header.
instance.interceptors.request.use(async (config) => {
  if (!config.headers?.Authorization) {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
