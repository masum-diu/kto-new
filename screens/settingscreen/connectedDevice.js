import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";
const dummyDevices = [
    {
        id: "1",
        name: "Jhon’s Phone",
        type: "Kid's phone",
        status: "Connected",
        image: require("../../assets/logoicons.png"),
    },
    {
        id: "2",
        name: "Jane’s Tablet",
        type: "Kid's tablet",
        status: "Disconnected",
        image: require("../../assets/logoicons.png"),
    },
    {
        id: "3",
        name: "Dad's Phone",
        type: "Parent's phone",
        status: "Connected",
        image: require("../../assets/logoicons.png"),
    },
];

const ConnectedDevice = ({ route }) => {
    const navigation = useNavigation();
    const familyId = route.params?.familyId;
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    console.log(devices);
     const getDeviceList = async () => {
        try {
            setLoading(true);
            const storedToken = await AsyncStorage.getItem('accessToken');
            const response = await instance.get(`/children?familyId=${familyId}`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    "Content-Type": "application/json",
                },
            });
            // console.log(response,"response")
             setDevices(response?.data?.data);
            setLoading(false);
           
        } catch (error) {
            //   console.error('User Retrieval Error:', error.response ? error.response.data : error.message);
        }
    };
    useEffect(() => {
        getDeviceList();
    }, []);

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
            <Text style={styles.headerText}>Connected Devices</Text>
            <View style={{ width: 24 }} />
        </View>

        {/* Device List */}
        <View style={styles.listContainer}>
            {devices?.map((device) => (
                <TouchableOpacity key={device.id} style={styles.deviceCard} onPress={() => navigation.navigate('DeviceDetails', { device })}>
                    <Image source={require("../../assets/logoicons.png")} style={styles.deviceImage} />
                    <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{device?.child?.deviceBrand}</Text>
                        {/* <Text style={styles.deviceType}>{device?.child?.deviceId}</Text> */}
                    </View>
                    {/* <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: device.status === 'Connected' ? '#2ecc71' : '#e74c3c' }]} />
                        <Text style={styles.deviceStatus}>{device.status}</Text>
                    </View> */}
                </TouchableOpacity>
            ))}
        </View>
    </ScrollView>
  );
}

export default ConnectedDevice;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0e6f7",
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
    listContainer: {
        marginHorizontal: 15,
        marginTop: 10,
    },
    deviceCard: {
        flexDirection: "row",
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
    deviceImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    deviceType: {
        fontSize: 14,
        color: "#7f7f7f",
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    deviceStatus: {
        fontSize: 14,
        color: "#555",
    },
});