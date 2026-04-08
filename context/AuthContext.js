import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((value) => {
      setAccessToken(value);
      setLoading(false);
    });
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem("accessToken", token);
    setAccessToken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
