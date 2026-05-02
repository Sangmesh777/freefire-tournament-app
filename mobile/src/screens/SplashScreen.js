import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <Text style={styles.title}>FREE FIRE</Text>
        <Text style={styles.subtitle}>TOURNAMENT</Text>
        <Text style={styles.tagline}>Survive. Dominate. Champion.</Text>
      </Animated.View>
      <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>v1.0.0</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#888888',
    marginTop: 12,
    letterSpacing: 2,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: '#444444',
    fontSize: 12,
  },
});

export default SplashScreen;
