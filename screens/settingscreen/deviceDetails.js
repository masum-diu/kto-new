import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Switch, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../api/api_instance';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DeviceDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { device } = route.params;
    const trackId = device?.child?.id;
    const trackidchild = device?.child?.trackId;
    console.log(trackidchild)

    const [deviceName, setDeviceName] = useState(device?.child?.name || '');
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState(device?.child?.name || '');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Safe Browsing
    const [safeBrowsing, setSafeBrowsing] = useState(false);
    const [safeBrowsingSaving, setSafeBrowsingSaving] = useState(false);

    // Keywords
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [keywordModal, setKeywordModal] = useState(false);
    const [keywordSaving, setKeywordSaving] = useState(false);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('accessToken');
                const [childRes, policyRes] = await Promise.all([
                    instance.get(`/children/${device?.child?.id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    instance.get(`/children/${trackId}`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const name = childRes?.data?.data?.name;
                if (name) { setDeviceName(name); setNewName(name); }
                const policy = policyRes?.data?.data;
                console.log("API policy:", policy);
                setSafeBrowsing(policy?.safe_browsing || false);
                setKeywords(policy?.policy?.blocked_keywords || []);
            } catch (e) { }
            finally { setLoading(false); }
        };
        fetchDevice();
    }, []);

    const handleRename = async () => {
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('accessToken');
            await instance.patch(`/children/${device?.child?.id}`, { name: newName }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeviceName(newName);
            setModalVisible(false);
            navigation.setParams({ device: { ...device, child: { ...device.child, name: newName } } });
        } catch (e) { console.log(e); }
        finally { setSaving(false); }
    };



    const addKeyword = async () => {
        const trimmed = keywordInput.trim().toLowerCase();
        if (!trimmed || keywords.includes(trimmed)) return;
        const updated = [...keywords, trimmed];

        try {
            setKeywordSaving(true);
            const token = await AsyncStorage.getItem('accessToken');
            await instance.post('/policies', {
                trackId: trackidchild,
                blockedKeywords: updated,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setKeywords(updated);
            setKeywordInput('');
        } catch (e) { console.log(e); }
        finally { setKeywordSaving(false); }
    };

    

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Device Details</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Device Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.deviceIconWrapper}>
                        <Ionicons name="phone-portrait-outline" size={40} color="#6d16a2" />
                    </View>
                    {loading ? (
                        <ActivityIndicator size="small" color="#6d16a2" style={{ marginTop: 8 }} />
                    ) : (
                        <>
                            <Text style={styles.deviceName}>{deviceName}</Text>
                            <Text style={styles.deviceType}>{device?.child?.deviceBrand}</Text>
                            <Text style={styles.deviceId}>{device?.child?.deviceId}</Text>
                        </>
                    )}
                </View>

                {/* Options */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.optionCard} onPress={() => setModalVisible(true)}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="pencil-outline" size={20} color="#6d16a2" />
                            <Text style={styles.optionText}>Rename Device</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("UsageReport", { trackId: device?.child?.trackId })}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="bar-chart-outline" size={20} color="#6d16a2" />
                            <Text style={styles.optionText}>View Usage Report</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate("Appblocking", { trackId: device?.child?.trackId })}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="ban-outline" size={20} color="#6d16a2" />
                            <Text style={styles.optionText}>Manage App Blocking</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                </View>



                {/* Keyword Detection */}
                <View style={styles.section}>
                    <View style={styles.keywordCard}>
                        <View style={styles.keywordHeader}>
                            <View style={styles.safeBrowsingLeft}>
                                <View style={styles.safeBrowsingIcon}>
                                    <Ionicons name="search-outline" size={22} color="#6d16a2" />
                                </View>
                                <View>
                                    <Text style={styles.safeBrowsingTitle}>Keyword Detection</Text>
                                    <Text style={styles.safeBrowsingSubtitle}>Alert when child searches these words</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setKeywordModal(true)} style={styles.addKeywordBtn}>
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {keywords.length === 0 ? (
                            <Text style={styles.emptyKeyword}>No keywords added yet</Text>
                        ) : (
                            <View style={styles.keywordList}>
                                {keywords.map((kw, i) => (
                                    <View key={i} style={styles.keywordChip}>
                                        <Text style={styles.keywordText}>{kw}</Text>
                                        {/* <TouchableOpacity onPress={() => removeKeyword(kw)}>
                                            <Ionicons name="close-circle" size={16} color="#6d16a2" />
                                        </TouchableOpacity> */}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Remove Device */}
                <TouchableOpacity style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.removeButtonText}>Remove Device</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Rename Modal */}
            <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Rename Device</Text>
                        <TextInput style={styles.modalInput} value={newName} onChangeText={setNewName} placeholder="Enter new name" placeholderTextColor="#aaa" />
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

            {/* Keyword Modal */}
            <Modal transparent animationType="slide" visible={keywordModal} onRequestClose={() => setKeywordModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Add Keyword</Text>
                        <Text style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                            Parents will be notified when child searches this word in browser.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={keywordInput}
                            onChangeText={setKeywordInput}
                            placeholder="e.g. drugs, violence"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setKeywordModal(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={async () => { await addKeyword(); setKeywordModal(false); }} disabled={keywordSaving}>
                                {keywordSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Add</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default DeviceDetails;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0e6f7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    headerText: { fontSize: 20, fontWeight: '700', color: '#000' },
    infoCard: { backgroundColor: '#fff', borderRadius: 16, margin: 15, padding: 20, alignItems: 'center', elevation: 2 },
    deviceIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    deviceName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    deviceType: { fontSize: 14, color: '#888', marginTop: 4 },
    deviceId: { fontSize: 12, color: '#bbb', marginTop: 2 },
    section: { marginHorizontal: 12, marginBottom: 12 },
    optionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 8, elevation: 1 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    optionText: { fontSize: 15, fontWeight: '600', color: '#333' },
    safeBrowsingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
    safeBrowsingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    safeBrowsingIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    safeBrowsingTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    safeBrowsingSubtitle: { fontSize: 11, color: '#999', marginTop: 2 },
    keywordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 1 },
    keywordHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    addKeywordBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6d16a2', alignItems: 'center', justifyContent: 'center' },
    emptyKeyword: { fontSize: 13, color: '#bbb', textAlign: 'center', paddingVertical: 10 },
    keywordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    keywordChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
    keywordText: { fontSize: 13, color: '#6d16a2', fontWeight: '600' },
    removeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 15, backgroundColor: '#e74c3c', padding: 15, borderRadius: 12, gap: 8 },
    removeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
    modalInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#333', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
    cancelText: { color: '#555', fontWeight: '600' },
    saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#6d16a2' },
    saveText: { color: '#fff', fontWeight: '600' },
});
