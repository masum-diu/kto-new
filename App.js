import React, { useEffect, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Onboarding from "./screens/onboarding";
import WhoseDevices from "./screens/WhoseDevices";
import AuthScreen from "./screens/SignIn";
import Verification from "./screens/Verification";
import CreateAccount from "./screens/CreateAccount";
import CircleCode from "./screens/CircleCode";
import KidsProfileSetup from "./screens/KidsProfileSetup";
import Monitor from "./screens/Monitor";
import MyProfile from "./screens/settingscreen/MyProfile";
import Sucessmessage from "./screens/CreateAccount/sucessmessage";

import BottomNavigation from "./navigation/BottomNavigation";
import RemoteCamera from "./screens/HomeScreen/RemoteCamera";
import ScreenMirroring from "./screens/HomeScreen/ScreenMirroring";
import OneWayAudio from "./screens/HomeScreen/oneWayAudio";
import LiveScreen from "./screens/HomeScreen/LiveScreen";
import Notifications from "./screens/notificationScreen/index";
import Settingscreen from "./screens/settingscreen/index";
import Chat from "./screens/settingscreen/chat";
import UsageReport from "./screens/settingscreen/usagesReport";
import Appblocking from "./screens/settingscreen/appblocking";
import ConnectedDevice from "./screens/settingscreen/connectedDevice";
import DeviceDetails from "./screens/settingscreen/deviceDetails";
import UpgradeMembership from "./screens/MembershipScreen/UpgradeMembership";

const Stack = createNativeStackNavigator();

function Navigator() {
  const { accessToken, loading } = useAuth();
  const navigationRef = useRef(null);
  const pendingTargetScreenRef = useRef(null);

  const navigateFromNotification = (targetScreen) => {
    if (!targetScreen) return;
    if (!navigationRef.current) {
      pendingTargetScreenRef.current = targetScreen;
      return;
    }
    navigationRef.current.navigate(targetScreen);
  };

  useEffect(() => {
    let unsubscribe;

    try {
      const notifeeModule = require("@notifee/react-native");
      const notifee = notifeeModule?.default;
      const EventType = notifeeModule?.EventType;

      if (!notifee || !EventType || !accessToken) return;

      unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
        if (type !== EventType.PRESS) return;
        navigateFromNotification(detail?.notification?.data?.targetScreen);
      });

      notifee.getInitialNotification().then((initialNotification) => {
        const targetScreen = initialNotification?.notification?.data?.targetScreen;
        navigateFromNotification(targetScreen);
      });
    } catch (error) {
      console.log("Notifee root handler init error:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [accessToken]);

  if (loading) return null;
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingTargetScreenRef.current) {
          navigationRef.current?.navigate(pendingTargetScreenRef.current);
          pendingTargetScreenRef.current = null;
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {accessToken ? (
          <>
            <Stack.Screen name="MainHome" component={BottomNavigation} />
            <Stack.Screen name="RemoteCameraView" component={RemoteCamera} />
            <Stack.Screen name="ScreenMirroring" component={ScreenMirroring} />
            <Stack.Screen name="OneWayAudio" component={OneWayAudio} />
            <Stack.Screen name="LiveScreen" component={LiveScreen} />
            <Stack.Screen name="NotificationScreen" component={Notifications} />
            <Stack.Screen name="settingscreen" component={Settingscreen} />
            <Stack.Screen name="chatScreen" component={Chat} />
            <Stack.Screen name="UsageReport" component={UsageReport} />
            <Stack.Screen name="Appblocking" component={Appblocking} />
            <Stack.Screen name="ConnectedDevice" component={ConnectedDevice} />
            <Stack.Screen name="DeviceDetails" component={DeviceDetails} />
            <Stack.Screen name="MyProfile" component={MyProfile} />
            <Stack.Screen name="CircleCode" component={CircleCode} />
            <Stack.Screen name="UpgradeMembership" component={UpgradeMembership} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="WhoseDevices" component={WhoseDevices} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Verification" component={Verification} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />
            <Stack.Screen name="sucessmessage" component={Sucessmessage} />
            <Stack.Screen name="CircleCode" component={CircleCode} />
            <Stack.Screen name="KidsProfileSetup" component={KidsProfileSetup} />
            <Stack.Screen name="Monitor" component={Monitor} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Navigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
