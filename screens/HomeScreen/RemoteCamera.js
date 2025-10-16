import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window"); // screen width dynamically নিচ্ছি

export default function RemoteCamera() {
     const navigation = useNavigation();
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
      <Text style={styles.title}>Remote Camera</Text>

      {/* Image Section */}
      <View style={styles.imageRow}>
        <Image
          source={require("../../assets/remotecamera.png")}
          style={styles.imageResponsive}
          resizeMode="contain"
        />
      </View>

      {/* Connecting Text */}
      <Text style={styles.connecting}>Connecting to the device...</Text>
      <Text style={styles.subText}>
        It takes time to connect, please wait...
      </Text>
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
