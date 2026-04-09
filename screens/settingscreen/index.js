import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    // console.log(user)
    const [loading, setLoading] = useState(true);
    const [familyId, setFamilyId] = useState(null);
    const handleLogout = async () => {
        await logout();
    };
    const getUser = async () => {
        try {
            setLoading(true);
            const storedToken = await AsyncStorage.getItem('accessToken');
            const response = await instance.get('/users/me', {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    "Content-Type": "application/json",

                },
            });

            setFamilyId(response?.data?.data?.familyId);
            setUser(response?.data?.data);
            setLoading(false);
        } catch (error) {
            //   console.error('User Retrieval Error:', error.response ? error.response.data : error.message);
        }
    };
    useEffect(() => {
        getUser();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
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
                    {loading ? (
                        <ActivityIndicator size="small" color="#6d16a2" style={{ marginLeft: 15 }} />
                    ) : (
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.name}</Text>
                            <Text style={styles.profileEmail}>{user?.email}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Settings Options */}
                <View style={styles.optionGroup}>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("MyProfile", { user })}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="person-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>My Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("CircleCode", { familyId })}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="add-circle-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Add Device</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("ConnectedDevice", { familyId })}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="wifi-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Connected Device</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("chatScreen")}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="chatbubble-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Chat</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="location-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>My Location</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("UsageReport")}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="bar-chart-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Usage Report</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Appblocking")}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="ban-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>App Blocking</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="videocam-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>My Recording</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="help-circle-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Help</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="chatbox-ellipses-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Feedback</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="language-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>Language</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="information-circle-outline" size={22} color="#6d16a2" />
                            <Text style={styles.optionText}>About us</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.optionCard, styles.logoutCard]} onPress={handleLogout}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="log-out-outline" size={22} color="#e53935" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0e6f7", // light purple
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
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    optionIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: "#6d16a2",
    },
    optionBadge: {
        color: "#000",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 12,
    },
    logoutCard: {
        borderColor: "#e53935",
        borderWidth: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e53935",
    },
});
