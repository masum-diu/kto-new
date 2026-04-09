import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../api/api_instance';

const DeviceDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { device } = route.params;
    const [deviceName, setDeviceName] = useState(device?.child?.name || '');
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState(device?.child?.name || '');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('accessToken');
                const res = await instance.get(`/children/${device?.child?.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // console.log(res,"dfsdf")
                const name = res?.data?.data?.name;
                if (name) {
                    setDeviceName(name);
                    setNewName(name);
                }
            } catch (e) {}
            finally { setLoading(false); }
        };
        fetchDevice();
    }, []);

    const handleRename = async () => {
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('accessToken');
            await instance.patch(`/children/${device?.child?.id}`, {
                name: newName,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeviceName(newName);
            setModalVisible(false);
            navigation.setParams({ device: { ...device, child: { ...device.child, name: newName } } });
        } catch (e) {
            console.log(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
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
                {loading ? (
                    <ActivityIndicator size="small" color="#6d16a2" style={{ marginTop: 8 }} />
                ) : (
                    <>
                        <Text style={styles.deviceName}>{deviceName}</Text>
                        <Text style={styles.deviceType}>{device?.child?.deviceId}</Text>
                    </>
                )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionCard} onPress={() => setModalVisible(true)}>
                    <Text style={styles.optionText}>Rename Device</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("UsageReport", { trackId: device?.child?.id })}>
                    <Text style={styles.optionText}>View Usage Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Appblocking", { trackId: device?.child?.id    })}>
                    <Text style={styles.optionText}>Manage App Blocking</Text>
                </TouchableOpacity>
            </View>

            {/* Remove Device Button */}
            <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove Device</Text>
            </TouchableOpacity>

            {/* Rename Modal */}
            <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Rename Device</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Enter new name"
                            placeholderTextColor="#aaa"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleRename} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
        </SafeAreaView>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelText: {
        color: '#555',
        fontWeight: '600',
    },
    saveBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#6d16a2',
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
    },
});