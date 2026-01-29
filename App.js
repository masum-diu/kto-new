import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Onboarding from "./screens/onboarding";
import WhoseDevices from "./screens/WhoseDevices";
import AuthScreen from "./screens/SignIn";
import Verification from "./screens/Verification";
import CreateAccount from "./screens/CreateAccount";
import CreateFamily from "./screens/CreateFamily";
import CircleCode from "./screens/CircleCode";
import KidsProfileSetup from "./screens/KidsProfileSetup";
import Monitor from "./screens/Monitor";
import BottomNavigation from "./navigation/BottomNavigation";
import RemoteCamera from "./screens/HomeScreen/RemoteCamera";
import ScreenMirroring from "./screens/HomeScreen/ScreenMirroring";
import OneWayAudio from "./screens/HomeScreen/oneWayAudio";
import notifications from "./screens/notificationScreen/index";
import settingscreen from "./screens/settingscreen/index";
import chat from "./screens/settingscreen/chat";
import UsageReport from "./screens/settingscreen/usagesReport";
import Appblocking from "./screens/settingscreen/appblocking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConnectedDevice from "./screens/settingscreen/connectedDevice";
import DeviceDetails from "./screens/settingscreen/deviceDetails";
import sucessmessage from "./screens/CreateAccount/sucessmessage";
import { useState } from "react";
const Stack = createNativeStackNavigator();
export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  AsyncStorage.getItem("accessToken").then((value) => {
    setAccessToken(value);
    console.log("Stored Access Token:", value);
  });
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!accessToken ? (
            <Stack.Screen name="Onboarding" component={Onboarding} />
          ) : null}
          <Stack.Screen name="WhoseDevices" component={WhoseDevices} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Verification" component={Verification} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="sucessmessage" component={sucessmessage} />
          {/* <Stack.Screen name="CreateFamily" component={CreateFamily} /> */}
          <Stack.Screen name="CircleCode" component={CircleCode} />
          <Stack.Screen name="KidsProfileSetup" component={KidsProfileSetup} />
          <Stack.Screen name="Monitor" component={Monitor} />
          <Stack.Screen name="MainHome" component={BottomNavigation} />
          <Stack.Screen name="RemoteCameraView" component={RemoteCamera} />
          <Stack.Screen name="ScreenMirroring" component={ScreenMirroring} />
          <Stack.Screen name="OneWayAudio" component={OneWayAudio} />
          <Stack.Screen name="NotificationScreen" component={notifications} />
          <Stack.Screen name="settingscreen" component={settingscreen} />
          <Stack.Screen name="chatScreen" component={chat} />
          <Stack.Screen name="UsageReport" component={UsageReport} />
          <Stack.Screen name="Appblocking" component={Appblocking} />
          <Stack.Screen name="ConnectedDevice" component={ConnectedDevice} />
          <Stack.Screen name="DeviceDetails" component={DeviceDetails} />



        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
