import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";

const dummyChats = [
  {
    id: "1",
    name: "Jhon Smith Roman",
    message: "Ok, see you then.",
    time: "10:49 AM",
    pinned: true,
    image: require("../../assets/logoicons.png"),
  },
  {
    id: "2",
    name: "Family Group",
    message: "Jane: Don't forget to buy milk!",
    time: "9:30 AM",
    pinned: true,
    image: require("../../assets/logoicons.png"),
  },
  {
    id: "3",
    name: "Alice",
    message: "Thanks for your help!",
    time: "Yesterday",
    image: require("../../assets/logoicons.png"),
  },
];

export default function chat() {
  const navigation = useNavigation();
  const pinnedChats = dummyChats.filter((chat) => chat.pinned);
  const otherChats = dummyChats.filter((chat) => !chat.pinned);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/angle-small-left.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerPlaceholder} /> {/* Placeholder for alignment */}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.sectionHeader}>Pinned Chats</Text>
        {pinnedChats.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.avatar} />
            <View style={styles.textWrapper}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.message}</Text>
            </View>
            <Text style={styles.subtitle}>{item.time}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionHeader}>All Chats</Text>
        {otherChats.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.avatar} />
            <View style={styles.textWrapper}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.subtitle}>{item.message}</Text>
            </View>
            <Text style={styles.subtitle}>{item.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backIcon: { width: 35, height: 35 },
  headerPlaceholder: { width: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "medium",
    color: "#333",
  },
  listContainer: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  sectionHeader: {
    color: "#a4a4a4",
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "500",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});
