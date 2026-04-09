import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../../api/api_instance';

const MyProfile = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params;

    const [name, setName] = useState(user?.name || '');
    const [familyName, setFamilyName] = useState(user?.familyName || '');
    const [number, setNumber] = useState(user?.phoneNumber || '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                const res = await instance.get('/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res?.data?.data;
                setName(data?.name || '');
                setFamilyName(data?.familyName || '');
                setNumber(data?.phoneNumber || '');
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async () => {
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('accessToken');
            await instance.patch('/users/me', { name, familyName, phoneNumber: number }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (e) {
            console.log(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>My Profile</Text>
                <View style={{ width: 26 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#6d16a2" />
                    </View>
                ) : (<>
                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={48} color="#6d16a2" />
                    </View>
                    <Text style={styles.emailText}>{user?.email}</Text>
                </View>

                {/* Fields */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Family Name</Text>
                    <TextInput
                        style={styles.input}
                        value={familyName}
                        onChangeText={setFamilyName}
                        placeholder="Enter family name"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={number}
                        onChangeText={setNumber}
                        placeholder="Enter phone number"
                        placeholderTextColor="#aaa"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Read-only email */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.input, styles.readOnly]}>
                        <Text style={{ color: '#999' }}>{user?.email}</Text>
                    </View>
                </View>

                {success && (
                    <View style={styles.successBanner}>
                        <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                        <Text style={styles.successText}>Profile updated successfully</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
                </>)}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyProfile;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0e6f7' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerText: { fontSize: 20, fontWeight: '700', color: '#000' },
    content: { padding: 20 },
    avatarWrapper: { alignItems: 'center', marginBottom: 24 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#ede0ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emailText: { fontSize: 14, color: '#888' },
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        elevation: 1,
    },
    readOnly: { justifyContent: 'center' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    successText: { color: '#16a34a', fontWeight: '600', fontSize: 14 },
    saveBtn: {
        backgroundColor: '#6d16a2',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
