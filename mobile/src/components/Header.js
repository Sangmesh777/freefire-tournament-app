import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const Header = ({ title, showBack = false }) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title || '🔥 FF TOURNAMENT'}</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
        {user?.profile_pic ? (
          <Image source={{ uri: user.profile_pic }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{getInitials(user?.name || user?.phone || '?')}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { color: '#FF6B00', fontSize: 22, fontWeight: '700' },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatar: { marginLeft: 12 },
  avatarImg: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FF6B00' },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});

export default Header;
