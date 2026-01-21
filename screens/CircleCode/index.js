import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import instance from '../../api/api_instance';

const CircleCode = ({ route }) => {
  const navigation = useNavigation();
  const familyId = route.params?.familyId;
  const [id, setId] = React.useState(null);
  console.log(familyId)
  const handleGenerateCode = async () => {
  try {
    const response = await instance.post('/devices/generate-code', {
      familyId,
    });
    console.log(response);
    const trackId = response?.data?.data?.trackId;
      setId(trackId);
    

  } catch (error) {
    console.error('Family Code Generation Error:', error.response ? error.response.data : error.message);
  }
  };
  const getqurCode = async () => {
    try {
      const response = await instance.get('/children/app-download-qr/image');
      console.log('QR Code Retrieved:', response);
    } catch (error) {
      console.error('QR Code Retrieval Error:', error.response ? error.response.data : error.message);
    }
  };
  useEffect(() => {
    getqurCode();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.title}>Add new device</Text>

        {/* Bind child’s device */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bind child’s device</Text>
          <View style={styles.card}>
            <Image
              source={require("../../assets/quer.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{id}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleGenerateCode} style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CircleCode;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5, // Android shadow
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 16,
  },
  codeBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 30,
    paddingVertical: 12,
    width: '100%',
  },
  codeText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#9b1fe8',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});
