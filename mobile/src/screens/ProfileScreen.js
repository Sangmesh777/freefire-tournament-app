import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/apiService';
import { getInitials } from '../utils/helpers';

const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [ign, setIgn] = useState(user?.ign || '');
  const [ffUid, setFfUid] = useState(user?.ff_uid || '');
  const [profilePic, setProfilePic] = useState(user?.profile_pic || null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      setImageFile(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (ign) formData.append('ign', ign);
      if (ffUid) formData.append('ff_uid', ffUid);
      if (imageFile) {
        formData.append('profile_pic', {
          uri: imageFile.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      const response = await updateProfile(formData);
      await updateUser(response.data.user);
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={editing ? pickImage : null} style={styles.avatarContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(user?.name || user?.phone)}</Text>
            </View>
          )}
          {editing && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#555555"
            editable={editing}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>In-Game Name (IGN)</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={ign}
            onChangeText={setIgn}
            placeholder="Your Free Fire IGN"
            placeholderTextColor="#555555"
            editable={editing}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Free Fire UID</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={ffUid}
            onChangeText={setFfUid}
            placeholder="Your FF UID"
            placeholderTextColor="#555555"
            keyboardType="number-pad"
            editable={editing}
          />
        </View>

        {editing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    backgroundColor: '#111111',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: { marginBottom: 12, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FF6B00' },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 4,
  },
  editBadgeText: { fontSize: 16 },
  phone: { color: '#888888', fontSize: 14, marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#FF6B0022',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: '#FF6B00', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  form: { paddingHorizontal: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { color: '#AAAAAA', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputDisabled: { opacity: 0.6 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#CCCCCC', fontWeight: '700' },
  saveBtn: {
    flex: 2,
    backgroundColor: '#FF6B00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#7A3300' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800' },
  editBtn: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FF6B00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  editBtnText: { color: '#FF6B00', fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    backgroundColor: '#2A0A0A',
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
  logoutBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
});

export default ProfileScreen;
