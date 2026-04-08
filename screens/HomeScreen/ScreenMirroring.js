import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList, Modal, Alert } from "react-native";
import instance from "../../api/api_instance";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width } = Dimensions.get("window"); // screen width dynamically নিচ্ছি

export default function ScreenMirroring({ route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  // console.log(data)
  const navigation = useNavigation();
  const { selectedChild } = route.params;
  // console.log(selectedChild)

  const requestScreenCapturePermission = async () => {

    try {
      setLoading(true);
      const response = await instance.get(
        `/photos/${selectedChild}`,

      );
      setLoading(false);
      setData(response.data.data);

    } catch (error) {
      console.error("Error requesting screen capture permission:", error);
    }
  };

  const camaraRequest = async (cameraType) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const response = await instance.post(
        "/control/send-command",
        {
          trackId: selectedChild,
          command: "CAPTURE_CAMERA",
          options: {
            camera: cameraType, // "front" বা "back"
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      Alert.alert("Command Sent", `Camera capture command sent for ${cameraType} camera.`);
      // console.log("Command sent:", response.data);

    } catch (error) {
      console.log("Camera request error:", error);
    }
  };

  useEffect(() => {
    requestScreenCapturePermission();
  }, []);



  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => { setSelectedImage(item.imageUrl); setModalVisible(true); }}>
      <Image source={{ uri: `https://api.kto.solutions${item.imageUrl}` }} style={styles.gridImage} resizeMode="cover" />
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Get Photos</Text>
        <TouchableOpacity onPress={requestScreenCapturePermission} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Image Section */}

      <View style={styles.cameraContainer}>
        <TouchableOpacity onPress={() => camaraRequest("front")} style={styles.cameraButton}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>Front Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => camaraRequest("back")} style={styles.cameraButton}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>Back Camera</Text>
        </TouchableOpacity>
      </View>


      {loading ? <View style={styles.imageRow}>
        <Image
          source={require("../../assets/remotecamera.png")}
          style={styles.imageResponsive}
          resizeMode="contain"
        />
        <Text style={styles.connecting}>Connecting to the device...</Text>
        <Text style={styles.subText}>
          It takes time to connect, please wait...
        </Text>
      </View> : (
        <FlatList
          data={data}
          renderItem={renderGridItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: `https://api.kto.solutions${selectedImage}` }} style={styles.fullImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    paddingHorizontal: 15,
  },

  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6a1b9a",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  cameraIcon: {
    fontSize: 18,
    marginRight: 6,
  },

  cameraText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2E8FF",
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    width: '100%',
  },
  backButton: {
    // No specific styles needed here now
  },
  backIcon: {
    width: 35,
    height: 35,
  },
  headerPlaceholder: {
    width: 35, // to balance the back button
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 24,
    color: '#6a1b9a',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  imageRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "center",
    marginBottom: 40,
  },
  imageResponsive: {
    width: width * 1,
    height: width * 0.5,
  },
  connecting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
  },
});
