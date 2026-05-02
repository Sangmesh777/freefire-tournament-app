import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { sendOTP } from '../api/apiService';
import { isValidPhone } from '../utils/helpers';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const trimmedPhone = phone.trim();
    if (!isValidPhone(trimmedPhone)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number with country code (e.g., +919876543210)');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(trimmedPhone);
      navigation.navigate('OTP', { phone: trimmedPhone });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <Text style={styles.title}>FREE FIRE</Text>
        <Text style={styles.subtitle}>TOURNAMENT APP</Text>
        <Text style={styles.description}>Enter your phone number to get started</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 9876543210"
            placeholderTextColor="#555555"
            keyboardType="phone-pad"
            maxLength={15}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>SEND OTP 🔥</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  fireEmoji: { fontSize: 60, marginBottom: 8 },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  description: { color: '#888888', marginBottom: 40, fontSize: 14 },
  inputContainer: { width: '100%', marginBottom: 20 },
  label: { color: '#AAAAAA', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#FF6B00',
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#7A3300' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  disclaimer: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 16,
  },
});

export default LoginScreen;
