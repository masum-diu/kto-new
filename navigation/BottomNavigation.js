import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/HomeScreen";
import Location from "../screens/Location";
import Safetyscreen from "../screens/Safetyscreen";
import MembershipScreen from "../screens/MembershipScreen";

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Images for each tab
                const icons = {
                    Home: require('../assets/fi_1551230.png'),
                    Location: require('../assets/fi_503080.png'),
                    Safety: require('../assets/fi_4548410.png'),
                    Membership: require('../assets/merber.png'),
                };

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[
                            styles.tabItem,
                            {
                                backgroundColor: isFocused ? "#6d16a2" : "transparent",
                                borderRadius: 100,
                                paddingHorizontal: isFocused ? 16 : 0,
                                paddingVertical: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            },
                        ]}
                    >
                        {/* Icon wrapper */}
                        <View
                            style={{
                                backgroundColor: isFocused ? "transparent" : "#f5e9fd",
                                borderRadius: 100,
                                padding: isFocused ? 0 : 12,
                            }}
                        >
                            <Image
                                source={icons[route.name]}
                                style={{
                                    width: 20,
                                    height: 20,
                                    tintColor: isFocused ? "#fff" : "#6d16a2",
                                    resizeMode: "contain"
                                }}
                            />
                        </View>

                        {isFocused && (
                            <Text style={{ fontSize: 14, fontFamily: "SemiBold", color: "#fff" }}>
                                {route.name === "Home"
                                    ? "Device"
                                    : route.name === "Location"
                                        ? "Location"
                                        : route.name === "Safety"
                                            ? "Safety"
                                            : "Membership"}
                            </Text>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

export default function BottomNavigation() {
    return (
        <Tab.Navigator
            tabBar={(props) => <MyTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Location" component={Location} />
            <Tab.Screen name="Safety" component={Safetyscreen} />
            <Tab.Screen name="Membership" component={MembershipScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        width: "100%",
        alignSelf: "center",
        bottom: 10,
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 15,
        shadowColor: "#6d16a2",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        height: 70,
    },
    tabItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 45,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 100,
        marginHorizontal: 10,
        overflow: 'hidden'
    },
});
