import { View, Text, TextInput, TouchableOpacity, Image, Dimensions, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import instance from '../../api/api_instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [number, setNumber] = useState('');
  const { width, height } = Dimensions.get("window");
  const navigation = useNavigation();

  const handleSave = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('accessToken');
      console.log('Stored Access Token:', storedToken);
      const response = await instance.patch('/users/me', {
        name,
        familyName,
        number,
      }, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",

        },

      });
       console.log('Verification Successful:', response.data);
      navigation.navigate("sucessmessage");

      // Navigate to the next screen or perform other actions
    } catch (error) {
      console.error('Verification Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Create an account</Text>

      {/* Profile Upload */}
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/upload.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Name */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter your Number"
          value={number}
          onChangeText={setNumber}
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Password */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Family name</Text>
        <TextInput
          placeholder="Enter your family name"
          value={familyName}
          onChangeText={setFamilyName}
          style={styles.input}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateAccount;

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
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 130,
    height: 130,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#7f7f7f',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#a1a1a1',
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
