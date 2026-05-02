import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  getAdminStats,
  getAllUsers,
  getTournaments,
  createTournament,
  deleteTournament,
  updateUserRole,
  deleteAdminUser,
} from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/helpers';

const AdminScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create tournament form
  const [tName, setTName] = useState('');
  const [tStartDate, setTStartDate] = useState('');
  const [tEndDate, setTEndDate] = useState('');
  const [tPrize, setTPrize] = useState('');
  const [tMaxTeams, setTMaxTeams] = useState('16');
  const [tEntryFee, setTEntryFee] = useState('0');
  const [creating, setCreating] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await getTournaments();
      setTournaments(response.data.tournaments);
    } catch (error) {
      console.error('Fetch tournaments error:', error);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      navigation.goBack();
      return;
    }
    loadTabData('stats');
  }, []);

  const loadTabData = async (tab) => {
    setLoading(true);
    setActiveTab(tab);
    try {
      if (tab === 'stats') await fetchStats();
      else if (tab === 'users') await fetchUsers();
      else if (tab === 'tournaments') await fetchTournaments();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTabData(activeTab);
    setRefreshing(false);
  };

  const handleCreateTournament = async () => {
    if (!tName || !tStartDate || !tEndDate) {
      Alert.alert('Error', 'Please fill in name, start date, and end date');
      return;
    }
    setCreating(true);
    try {
      await createTournament({
        name: tName,
        start_date: tStartDate,
        end_date: tEndDate,
        prize_pool: parseFloat(tPrize) || 0,
        max_teams: parseInt(tMaxTeams) || 16,
        entry_fee: parseFloat(tEntryFee) || 0,
      });
      Alert.alert('Success', 'Tournament created!');
      setTName(''); setTStartDate(''); setTEndDate(''); setTPrize('');
      setTMaxTeams('16'); setTEntryFee('0');
      fetchTournaments();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTournament = (id, name) => {
    Alert.alert('Delete Tournament', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTournament(id);
            fetchTournaments();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete tournament');
          }
        },
      },
    ]);
  };

  const handleToggleUserRole = (userId, currentRole, userName) => {
    const newRole = currentRole === 'admin' ? 'player' : 'admin';
    Alert.alert('Change Role', `Make ${userName} a ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await updateUserRole(userId, newRole);
            fetchUsers();
          } catch (error) {
            Alert.alert('Error', 'Failed to update role');
          }
        },
      },
    ]);
  };

  const renderStats = () => (
    <View>
      <Text style={styles.sectionTitle}>📊 Dashboard Overview</Text>
      <View style={styles.statsGrid}>
        {[
          { label: 'Total Users', value: stats?.totalUsers, emoji: '👤' },
          { label: 'Total Teams', value: stats?.totalTeams, emoji: '👥' },
          { label: 'Tournaments', value: stats?.totalTournaments, emoji: '🏆' },
          { label: 'Matches', value: stats?.totalMatches, emoji: '🎮' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={styles.statValue}>{stat.value ?? '-'}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTournaments = () => (
    <View>
      <Text style={styles.sectionTitle}>➕ Create Tournament</Text>
      <View style={styles.createForm}>
        {[
          { placeholder: 'Tournament Name', value: tName, setter: setTName },
          { placeholder: 'Start Date (YYYY-MM-DD)', value: tStartDate, setter: setTStartDate },
          { placeholder: 'End Date (YYYY-MM-DD)', value: tEndDate, setter: setTEndDate },
          { placeholder: 'Prize Pool (₹)', value: tPrize, setter: setTPrize, keyboardType: 'numeric' },
          { placeholder: 'Max Teams', value: tMaxTeams, setter: setTMaxTeams, keyboardType: 'numeric' },
          { placeholder: 'Entry Fee (₹)', value: tEntryFee, setter: setTEntryFee, keyboardType: 'numeric' },
        ].map((field) => (
          <TextInput
            key={field.placeholder}
            style={styles.input}
            value={field.value}
            onChangeText={field.setter}
            placeholder={field.placeholder}
            placeholderTextColor="#555555"
            keyboardType={field.keyboardType || 'default'}
          />
        ))}
        <TouchableOpacity
          style={[styles.createBtn, creating && styles.createBtnDisabled]}
          onPress={handleCreateTournament}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.createBtnText}>Create Tournament</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🏆 All Tournaments</Text>
      {tournaments.map((t) => (
        <View key={t.id} style={styles.listItem}>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemName}>{t.name}</Text>
            <Text style={styles.listItemSub}>
              {formatDate(t.start_date)} · {formatCurrency(t.prize_pool)} · {t.status}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteTournament(t.id, t.name)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderUsers = () => (
    <View>
      <Text style={styles.sectionTitle}>👥 All Users ({users.length})</Text>
      {users.map((u) => (
        <View key={u.id} style={styles.listItem}>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemName}>{u.name || u.phone}</Text>
            <Text style={styles.listItemSub}>
              {u.phone} · {u.ign || 'No IGN'} · {u.role}
            </Text>
          </View>
          {u.id !== user?.id && (
            <TouchableOpacity
              style={styles.roleBtn}
              onPress={() => handleToggleUserRole(u.id, u.role, u.name || u.phone)}
            >
              <Text style={styles.roleBtnText}>
                {u.role === 'admin' ? '👤' : '⚙️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
    >
      {/* Tabs */}
      <View style={styles.tabs}>
        {['stats', 'tournaments', 'users'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => loadTabData(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'stats' ? '📊 Stats' : tab === 'tournaments' ? '🏆 Events' : '👥 Users'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'tournaments' && renderTournaments()}
            {activeTab === 'users' && renderUsers()}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  tabs: { flexDirection: 'row', backgroundColor: '#111111', padding: 8, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  tabActive: { backgroundColor: '#FF6B00' },
  tabText: { color: '#888888', fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { color: '#FF6B00', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#888888', fontSize: 12, fontWeight: '600' },
  createForm: { backgroundColor: '#111111', borderRadius: 14, padding: 16 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 10,
    fontSize: 14,
  },
  createBtn: {
    backgroundColor: '#FF6B00',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  createBtnDisabled: { backgroundColor: '#7A3300' },
  createBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    alignItems: 'center',
  },
  listItemInfo: { flex: 1 },
  listItemName: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginBottom: 3 },
  listItemSub: { color: '#888888', fontSize: 12 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  roleBtn: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  roleBtnText: { fontSize: 18 },
});

export default AdminScreen;
