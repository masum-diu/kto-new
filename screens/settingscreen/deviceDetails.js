import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const DeviceDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { device } = route.params;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require("../../assets/angle-small-left.png")}
                        style={{ width: 35, height: 35 }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>{device.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Device Info Card */}
            <View style={styles.infoCard}>
                <Image source={require("../../assets/logoicons.png")} style={styles.deviceImage} />
                <Text style={styles.deviceName}>{device?.child?.deviceBrand}</Text>
                <Text style={styles.deviceType}> {device?.child?.deviceId}</Text>
                {/* <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: device.status === 'Connected' ? '#2ecc71' : '#e74c3c' }]} />
                    <Text style={styles.deviceStatus}>{device.status}</Text>
                </View> */}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionCard}>
                    <Text style={styles.optionText}>Rename Device</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("UsageReport")}>
                    <Text style={styles.optionText}>View Usage Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Appblocking")}>
                    <Text style={styles.optionText}>Manage App Blocking</Text>
                </TouchableOpacity>
            </View>

            {/* Remove Device Button */}
            <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove Device</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default DeviceDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0e6f7',
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
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    deviceImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    deviceName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    deviceType: {
        fontSize: 16,
        color: '#7f7f7f',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    deviceStatus: {
        fontSize: 16,
        color: "#555",
    },
    optionsContainer: {
        marginHorizontal: 15,
    },
    optionCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    removeButton: {
        margin: 15,
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});