import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getTeams, createTeam, addTeamMember, removeTeamMember } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

const TeamScreen = () => {
  const { user } = useAuth();
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoUri, setLogoUri] = useState(null);
  const [invitePhone, setInvitePhone] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyTeam = async () => {
    try {
      const response = await getTeams();
      const team = response.data.teams.find(
        (t) => t.captain_id === user?.id || t.members?.some((m) => m.user_id === user?.id)
      );
      setMyTeam(team || null);
    } catch (error) {
      console.error('Fetch team error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyTeam();
    setRefreshing(false);
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
      setLogoFile(result.assets[0]);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', teamName.trim());
      if (logoFile) {
        formData.append('logo', { uri: logoFile.uri, type: 'image/jpeg', name: 'logo.jpg' });
      }
      await createTeam(formData);
      Alert.alert('Success', 'Team created!');
      fetchMyTeam();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (userId) => {
    if (!userId) return;
    setAddingMember(true);
    try {
      await addTeamMember(myTeam.id, parseInt(userId));
      Alert.alert('Success', 'Member added!');
      fetchMyTeam();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
      setInvitePhone('');
    }
  };

  const handleRemoveMember = (userId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTeamMember(myTeam.id, userId);
              fetchMyTeam();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!myTeam) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.createContainer}>
        <Text style={styles.createEmoji}>⚔️</Text>
        <Text style={styles.createTitle}>Create Your Team</Text>
        <Text style={styles.createSubtitle}>Build a squad of up to 4 players</Text>

        <TouchableOpacity style={styles.logoPickerBtn} onPress={pickLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <Text style={styles.logoPickerText}>🖼️ Pick Team Logo</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Enter team name"
          placeholderTextColor="#555555"
        />

        <TouchableOpacity
          style={[styles.createBtn, creating && styles.createBtnDisabled]}
          onPress={handleCreateTeam}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createBtnText}>Create Team 🔥</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const isCaptain = myTeam.captain_id === user?.id;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
    >
      {/* Team Banner */}
      <View style={styles.banner}>
        {myTeam.logo ? (
          <Image source={{ uri: myTeam.logo }} style={styles.teamLogo} />
        ) : (
          <View style={styles.teamLogoPlaceholder}>
            <Text style={styles.teamLogoInitials}>{getInitials(myTeam.name)}</Text>
          </View>
        )}
        <Text style={styles.teamName}>{myTeam.name}</Text>
        {isCaptain && <Text style={styles.captainBadge}>👑 Captain</Text>}
      </View>

      {/* Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Team Members ({myTeam.members?.length}/4)</Text>
        {myTeam.members?.map((member, index) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              {member.user?.profile_pic ? (
                <Image source={{ uri: member.user.profile_pic }} style={styles.memberAvatarImg} />
              ) : (
                <View style={styles.memberAvatarPlaceholder}>
                  <Text style={styles.memberAvatarText}>
                    {getInitials(member.user?.name || '?')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.user?.name || 'Player'}</Text>
              <Text style={styles.memberIgn}>{member.user?.ign || 'No IGN'}</Text>
            </View>
            {isCaptain && member.user_id !== user.id && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveMember(member.user_id, member.user?.name || 'Player')}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Add Member (Captain only) */}
      {isCaptain && myTeam.members?.length < 4 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕ Add Member (by User ID)</Text>
          <View style={styles.addMemberRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={invitePhone}
              onChangeText={setInvitePhone}
              placeholder="Enter User ID"
              placeholderTextColor="#555555"
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.addBtn, addingMember && styles.addBtnDisabled]}
              onPress={() => handleAddMember(invitePhone)}
              disabled={addingMember}
            >
              {addingMember ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.addBtnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  createContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  createEmoji: { fontSize: 60, marginBottom: 12 },
  createTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  createSubtitle: { color: '#888888', marginBottom: 30, textAlign: 'center' },
  logoPickerBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FF6B00',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPickerText: { color: '#FF6B00', fontSize: 12, textAlign: 'center' },
  logoPreview: { width: 100, height: 100, borderRadius: 50 },
  input: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 14,
    fontSize: 15,
  },
  createBtn: {
    width: '100%',
    backgroundColor: '#FF6B00',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnDisabled: { backgroundColor: '#7A3300' },
  createBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  banner: {
    backgroundColor: '#111111',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 16,
  },
  teamLogo: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  teamLogoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamLogoInitials: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  teamName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  captainBadge: { color: '#FF9500', fontSize: 13, fontWeight: '600' },
  section: {
    backgroundColor: '#111111',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 12 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    gap: 12,
  },
  memberAvatar: {},
  memberAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  memberAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: { color: '#FFFFFF', fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  memberIgn: { color: '#888888', fontSize: 12 },
  removeBtn: { padding: 8 },
  removeBtnText: { color: '#FF3B30', fontWeight: '700' },
  addMemberRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addBtnDisabled: { backgroundColor: '#7A3300' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' },
});

export default TeamScreen;
