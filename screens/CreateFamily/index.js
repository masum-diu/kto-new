import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const CreateFamily = () => {
  const navigation = useNavigation();
  const [familyName, setFamilyName] = useState('');

  const handleSave = () => {
    navigation.navigate("CircleCode");
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.title}>Create a family</Text>

        {/* Family Name */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Family name</Text>
          <TextInput
            placeholder="Enter your Family name"
            value={familyName}
            onChangeText={setFamilyName}
            style={styles.input}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSave} style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateFamily;

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
