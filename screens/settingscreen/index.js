import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";

const SettingsScreen = () => {
      const navigation = useNavigation();
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image
                        source={require("../../assets/angle-small-left.png")}
                        style={{ width: 35, height: 35 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Settings</Text>
                 <View style={{ width: 24 }} /> 
            </View>

            {/* Profile Section */}
            <TouchableOpacity style={styles.profileCard}>
                <Image
                    source={require("../../assets/logoicons.png")}
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Jhon Smith Roman</Text>
                    <Text style={styles.profileEmail}>jhon.smith@gmail.com</Text>
                </View>
            </TouchableOpacity>

            {/* Settings Options */}
            <View style={styles.optionGroup}>
                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>My Device</Text>
                    <Text style={styles.optionBadge}>1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("chatScreen")}>
                    <Text style={styles.optionText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>My Location</Text>
                    <Text style={styles.optionBadge}>1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>Usage Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>App Blocking</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>My Recording</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>Feedback</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>Language</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>About us</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D6A3F6", // light purple
    },
    header: {
        padding: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
   
    headerText: {
        fontSize: 22,
        fontWeight: "600",
        color: "#000",
    },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        margin: 15,
        borderRadius: 12,
        padding: 15,
        
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    profileInfo: {
        marginLeft: 15,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    profileEmail: {
        fontSize: 14,
        color: "#000",
    },
    optionGroup: {
        marginHorizontal: 15,
        marginTop: 10,
    },
    optionCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    optionText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
    },
    optionBadge: {
        // backgroundColor: "#D9B3FF",
        color: "#000",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 12,
    },
});
