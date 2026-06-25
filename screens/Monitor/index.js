import { View, Text, Image, Dimensions, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ProminentDisclosureModal from '../../components/ProminentDisclosureModal';
import { DISCLOSURE, PRIVACY_POLICY_URL } from '../../constants/disclosureContent';
import { CONSENT_KEYS, grantConsent } from '../../utils/disclosureConsent';

const Monitor = () => {
    const { width, height } = Dimensions.get("window");
    const navigation = useNavigation();
    const [showDisclosure, setShowDisclosure] = useState(true);

    const handleAgree = async () => {
        await grantConsent(CONSENT_KEYS.CHILD_DEVICE);
        setShowDisclosure(false);
        navigation.navigate("CircleCode");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require("../../assets/sdf.png")}
                        style={{ width: width * 0.9, height: height * 0.3 }}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Child device monitoring consent</Text>

                <Text style={styles.description}>
                    This device may be monitored by a parent or legal guardian using KTO for family safety.
                    Location, app usage, device activity, and remote safety features may be shared with the
                    linked parent account on secure KTO servers.
                </Text>

                <Text style={styles.description}>
                    Monitoring must only be used on devices you own or are legally authorized to monitor,
                    and with proper consent from the device user or guardian where required by law.
                </Text>

                <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                    <Text style={styles.policyLink}>Read Privacy Policy</Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.notNowBtn]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.buttonText, styles.notNowText]}>Not now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.agreeBtn]}
                        onPress={() => setShowDisclosure(true)}
                    >
                        <Text style={[styles.buttonText, styles.agreeText]}>Review & Agree</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ProminentDisclosureModal
                visible={showDisclosure}
                {...DISCLOSURE.CHILD_DEVICE}
                onAgree={handleAgree}
                onDecline={() => setShowDisclosure(false)}
            />
        </SafeAreaView>
    );
};

export default Monitor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    imageWrapper: {
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 8,
        color: "#333",
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
        color: "#4b5563",
        marginVertical: 12,
        lineHeight: 22,
    },
    policyLink: {
        color: "#6b21a8",
        fontWeight: "700",
        fontSize: 14,
        textDecorationLine: "underline",
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    notNowBtn: {
        borderWidth: 1,
        borderColor: "#9b1fe8",
        backgroundColor: "#fff",
        marginRight: 6,
    },
    agreeBtn: {
        backgroundColor: "#9b1fe8",
        marginLeft: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    notNowText: {
        color: "#9b1fe8",
    },
    agreeText: {
        color: "#fff",
    },
});
