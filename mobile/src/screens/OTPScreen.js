import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { verifyOTP } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

const OTPScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(phone, otpString);
      const { token, user, isNewUser } = response.data;
      await login(token, user);

      if (isNewUser) {
        Alert.alert(
          'Welcome!',
          'Please complete your profile to get started.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fireEmoji}>🔐</Text>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{'\n'}
        <Text style={styles.phone}>{phone}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[styles.otpInput, digit && styles.otpInputFilled]}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>VERIFY & LOGIN</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={() => navigation.goBack()}>
        <Text style={styles.resendText}>Change phone number</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  fireEmoji: { fontSize: 50, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    color: '#888888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  phone: { color: '#FF6B00', fontWeight: '700' },
  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpInputFilled: { borderColor: '#FF6B00' },
  button: {
    backgroundColor: '#FF6B00',
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#7A3300' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  resendButton: { marginTop: 20 },
  resendText: { color: '#FF6B00', fontSize: 14 },
});

export default OTPScreen;
