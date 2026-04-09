import { useNavigation } from "@react-navigation/native";
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ConnectedDevice = ({ route }) => {
    const navigation = useNavigation();
    const familyId = route.params?.familyId;
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState([]);

    const getDeviceList = async () => {
        try {
            setLoading(true);
            const storedToken = await AsyncStorage.getItem('accessToken');
            const response = await instance.get(`/children?familyId=${familyId}`, {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            setDevices(response?.data?.data || []);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { getDeviceList(); }, []));

    if (loading) return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6d16a2" />
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Connected Devices</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                <Text style={styles.countText}>{devices.length} device{devices.length !== 1 ? 's' : ''} connected</Text>

                {devices?.map((device, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.deviceCard}
                        onPress={() => navigation.navigate('DeviceDetails', { device })}
                    >
                        <View style={styles.iconWrapper}>
                            <Ionicons name="phone-portrait-outline" size={26} color="#6d16a2" />
                        </View>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceBrand}>{device?.child?.deviceBrand || 'Unknown Device'}</Text>
                            <Text style={styles.deviceName}>{device?.child?.name || 'No name'}</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Connected</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}

                {devices.length === 0 && (
                    <View style={styles.emptyWrapper}>
                        <Ionicons name="phone-portrait-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>No devices connected</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ConnectedDevice;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0e6f7" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerText: { fontSize: 22, fontWeight: "600", color: "#000" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContainer: { padding: 16 },
    countText: {
        fontSize: 13,
        color: "#888",
        marginBottom: 12,
        marginLeft: 4,
    },
    deviceCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: "#6d16a2",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#f3e8ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    deviceInfo: { flex: 1 },
    deviceBrand: { fontSize: 15, fontWeight: "700", color: "#222" },
    deviceName: { fontSize: 13, color: "#888", marginTop: 2 },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#22c55e",
        marginRight: 5,
    },
    statusText: { fontSize: 12, color: "#22c55e", fontWeight: "600" },
    emptyWrapper: { alignItems: "center", marginTop: 80 },
    emptyText: { fontSize: 15, color: "#aaa", marginTop: 12 },
});
