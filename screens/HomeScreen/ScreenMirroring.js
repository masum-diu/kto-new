import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width } = Dimensions.get("window"); // screen width dynamically নিচ্ছি

export default function ScreenMirroring({ route }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  console.log(data)
  const navigation = useNavigation();
  const { selectedChild } = route.params;
  console.log(selectedChild)

  const requestScreenCapturePermission = async () => {

    try {
      setLoading(true);
      const response = await instance.get(
        `/screenshots/${selectedChild}`,

      );
      setLoading(false);
      setData(response.data.data);

    } catch (error) {
      console.error("Error requesting screen capture permission:", error);
    }
  };


  useEffect(() => {
    requestScreenCapturePermission();
  }, []);


  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image
          source={require("../../assets/angle-small-left.png")}
          style={{ width: 35, height: 35 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>screenshot</Text>

      {/* Image Section */}

      {loading ? <View style={styles.imageRow}>
        <Image
          source={require("../../assets/remotecamera.png")}
          style={styles.imageResponsive}
          resizeMode="contain"
        />
        <Text style={styles.connecting}>Connecting to the device...</Text>
        <Text style={styles.subText}>
          It takes time to connect, please wait...
        </Text>
      </View> : <View style={styles.imageRow}>
        {data?.map((item, index) => {
          console.log(item)
          return (
          <Image
            key={index}
            source={{ uri: `https://ktobackend.etherstaging.xyz${item?.image_url}` }}
            style={styles.imageResponsive}
            resizeMode="contain"
          />)})}

      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2E8FF",
    alignItems: "center",
    paddingTop: 32,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    marginBottom: 30,
  },
  imageRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  imageResponsive: {
    width: width * 1,
    height: width * 0.5,
  },
  connecting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
});
