import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const Verification = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [resendActive, setResendActive] = useState(false);
  const navigation = useNavigation();

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev > 0) return prev - 1;
        setResendActive(true); // Enable resend when timer reaches 0
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const min = Math.floor(timer / 60).toString().padStart(2, '0');
    const sec = (timer % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) { // only numbers
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (text && index < code.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    console.log('Code entered:', code.join(''));
    navigation.navigate("CreateAccount");
  };

  const handleResend = () => {
    if (!resendActive) return;
    setTimer(300);
    setResendActive(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verification</Text>

      <View style={styles.codeRow}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={el => (inputsRef.current[index] = el)}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.codeInput, { color: '#9b1fe8' }]}
            textAlign="center"
          />
        ))}
      </View>

      <Text style={styles.timer}>{formatTime()}</Text>

      <Text style={styles.subHeader}>Verify your email address</Text>
      <Text style={styles.description}>
        We have sent you 4-digit verification code at{"\n"}
        <Text style={styles.email}>dummy@gmail.com</Text>
      </Text>

      <TouchableOpacity disabled={!resendActive} onPress={handleResend}>
        <Text style={[styles.resendText, resendActive ? styles.resendActive : styles.resendDisabled]}>
          Didn't receive the code?{" "}
          <Text style={resendActive ? styles.resendActive : styles.resendDisabled}>
            Resend here
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleVerify} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Verification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 64,
    color: "#000",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: "#9b1fe8",
    borderRadius: 50,
    marginHorizontal: 8,
    width: 56,
    height: 56,
    fontSize: 20,
  },
  timer: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  email: {
    color: "#6b7280",
  },
  resendText: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    fontWeight: "500",
  },
  resendActive: {
    color: "#9b1fe8",
  },
  resendDisabled: {
    color: "#9ca3af",
  },
  confirmButton: {
    backgroundColor: "#9b1fe8",
    paddingVertical: 14,
    borderRadius: 50,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
