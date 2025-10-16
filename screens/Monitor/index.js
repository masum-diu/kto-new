import { View, Text, Image, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const Monitor = () => {
    const { width, height } = Dimensions.get("window");
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageWrapper}>
                <Image
                    source={require("../../assets/sdf.png")}
                    style={{ width: width * 0.9, height: height * 0.3 }}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.title}>Monitor the child's gadget</Text>

            <Text style={styles.description}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.notNowBtn]}>
                    <Text style={[styles.buttonText, styles.notNowText]}>Not now</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.agreeBtn]} onPress={() => navigation.navigate("MainHome")}>
                    <Text style={[styles.buttonText, styles.agreeText]}>Agree</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Monitor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    imageWrapper: {
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 8,
        color: "#333",
    },
    description: {
        fontSize: 14,
        fontWeight: "400",
        color: "#7f7f7f",
        marginVertical: 20,
        lineHeight: 20,
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
