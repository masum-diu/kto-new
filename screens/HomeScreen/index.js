import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";


const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("settingscreen")}> 
            <Image source={require("../../assets/Settings.png")}
            style={styles.headerIcon} /></TouchableOpacity>
          <TouchableOpacity style={styles.familyBtn}>
            <Text style={styles.familyText}>Demo Family</Text>
            <Image source={require("../../assets/ions1.png")} style={styles.headerSmallIcon} />
          </TouchableOpacity>
           <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}> 
            <Image source={require("../../assets/Chat.png")} style={styles.headerIcon} /></TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Image
              source={require("../../assets/logoicons.png")}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>John Smith</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
                <Text style={[styles.onlineText, { marginLeft: 6 }]}>100%</Text>
              </View>
            </View>
          </View>
          {/* <Image  source={require("../assets/logoicons.png")} style={styles.addIcon} /> */}
          <Text className="text-white text-3xl">+</Text>
        </View>

        {/* User Report */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Report</Text>
          <Text style={styles.smallText}>Screen Time: 1hr 45 min</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Device Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Activity</Text>
          <View style={styles.iconRow}>

            <View style={styles.iconBox}>
              <Image source={require("../../assets/fi_1827419.png")} style={styles.iconImg} />
              <Text style={styles.iconText}>Screen Time Limits</Text>
            </View>

            <View style={styles.iconBox}>
              <Image source={require("../../assets/fi_1827419.png")} style={styles.iconImg} />
              <Text style={styles.iconText}>App Time Limits</Text>
            </View>
            <View style={styles.iconBox}>
              <Image source={require("../../assets/fi_1827419.png")} style={styles.iconImg} />
              <Text style={styles.iconText}>App Rules</Text>
            </View>
          </View>
        </View>

        {/* Live Monitoring */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Live Monitoring</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => navigation.navigate("RemoteCameraView")}>
              <View style={styles.iconBox}>
                <Image source={require("../../assets/fi_711191.png")} style={styles.iconImg} />
                <Text style={styles.iconText}>Remote Camera</Text>
              </View>  </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ScreenMirroring")}> <View style={styles.iconBox}>
              <Image source={require("../../assets/fi_711191.png")} style={styles.iconImg} />
              <Text style={styles.iconText}>Screen Mirroring</Text>
            </View></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("OneWayAudio")}>
              <View style={styles.iconBox}>
                <Image source={require("../../assets/fi_711191.png")} style={styles.iconImg} />
                <Text style={styles.iconText}>One-Way Audio</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6a1b9a", paddingTop: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: 16 },
  headerIcon: { width: 44, height: 44 },
  headerSmallIcon: { width: 10, height: 6 },
  familyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  familyText: { color: "#6a1b9a", fontWeight: "500", marginRight: 6 },
  profileCard: { backgroundColor: "rgba(255, 255, 255, 0.15)", margin: 16, borderRadius: 8, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  onlineRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  onlineDot: { width: 8, height: 8, backgroundColor: "green", borderRadius: 4, marginRight: 4 },
  onlineText: { color: "#fff", fontSize: 12 },
  addIcon: { width: 28, height: 28 },
  card: { backgroundColor: "#fff", marginHorizontal: 16, marginVertical: 8, borderRadius: 8, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  smallText: { fontSize: 13, color: "#666", marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "#ddd", borderRadius: 6, overflow: "hidden" },
  progressFill: { width: "40%", height: "100%", backgroundColor: "#0abab5" },
  iconRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  iconBox: { alignItems: "center", width: 90 },
  iconImg: { width: 28, height: 28 },
  iconText: { fontSize: 12, color: "#333", marginTop: 4, textAlign: "center" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", paddingVertical: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  navBtn: { alignItems: "center" },
  navBtnActive: { backgroundColor: "#6a1b9a", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center" },
  bottomIcon: { width: 22, height: 22 },
  navTextActive: { color: "#fff", marginLeft: 6, fontSize: 14 },
});
