import { View, Text, TextInput, TouchableOpacity, Image, Dimensions, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const KidsProfileSetup = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const { width } = Dimensions.get("window");
    const navigation = useNavigation();

    const handleSave = () => {
        navigation.navigate("Monitor");
    };

    return (
        <ScrollView style={styles.container}>
            <View>
                {/* Title */}
                <Text style={styles.title}>Add new device</Text>
                <Text style={styles.subtitle}>Complete your child’s information</Text>

                {/* Upload Image */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={require("../../assets/upload.png")}
                        style={[styles.uploadImage, { width: width * 0.35, height: width * 0.35 }]}
                        resizeMode="contain"
                    />
                </View>

                {/* Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        placeholder="Enter your child’s name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor="#a1a1a1"
                    />
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        placeholder="Enter your Age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#a1a1a1"
                    />
                </View>

                {/* Gender Selection */}
                <View style={styles.genderRow}>
                    <TouchableOpacity onPress={handleSave} style={[styles.genderBtn, styles.boyBtn]}>
                        <View style={styles.genderContent}>
                            <Image
                                source={require("../../assets/f1.png")}
                                style={styles.genderIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.genderText}>Boy</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSave} style={[styles.genderBtn, styles.girlBtn]}>
                        <View style={styles.genderContent}>
                            <Image
                                source={require("../../assets/f2.png")}
                                style={styles.genderIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.genderText}>Girl</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity onPress={handleSave} style={styles.submitBtn}>
                    <Text style={styles.submitText}>Complete</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default KidsProfileSetup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 40,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "500",
        marginVertical: 20,
        color: "#555",
    },
    imageWrapper: {
        alignItems: "center",
        marginBottom: 20,
    },
    uploadImage: {
        marginBottom: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7f7f7f",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fafafa",
        fontSize: 14,
        color: "#333",
    },
    genderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 12,
        gap: 8,
    },
    genderBtn: {
        flex: 1,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#9b1fe8",
        paddingVertical: 12,
        marginBottom: 12,
    },
    boyBtn: {
        backgroundColor: "#f2deff",
        marginRight: 6,
    },
    girlBtn: {
        backgroundColor: "#fff",
        marginLeft: 6,
    },
    genderContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    genderIcon: {
        width: 22,
        height: 22,
    },
    genderText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
    },
    submitBtn: {
        backgroundColor: "#9b1fe8",
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    submitText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
    },
});
