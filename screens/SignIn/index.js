import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (isSignIn) {
      navigation.navigate("Verification");
    } else {
      // console.log("Sign Up with:", email, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        You need to {isSignIn ? 'Sign In' : 'create an account'}
      </Text>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: '#a1a1a1' }]}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { color: '#a1a1a1', marginBottom: 24 }]}
          secureTextEntry
        />
      </View>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>
          {isSignIn ? 'Sign In' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      {/* Toggle */}
      <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)}>
        {isSignIn ? (
          <Text style={styles.toggleText}>
            <Text style={styles.subText}>Don't have an account? </Text>
            <Text style={styles.linkText}>Sign Up</Text>
          </Text>
        ) : (
          <Text style={styles.toggleText}>
            <Text style={styles.subText}>Already have an account? </Text>
            <Text style={styles.linkText}>Sign In</Text>
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 64,
    color: "#000",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#7f7f7f",
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "600",
    marginBottom: 24,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#9b1fe8",
    paddingVertical: 14,
    borderRadius: 50,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  subText: {
    color: "#7f7f7f",
  },
  linkText: {
    color: "#9b1fe8",
    fontWeight: "600",
  },
});
