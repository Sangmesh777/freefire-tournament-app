import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getTournaments } from '../api/apiService';
import TournamentCard from '../components/TournamentCard';
import { formatCurrency } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await getTournaments();
      setTournaments(response.data.tournaments.slice(0, 5));
    } catch (error) {
      console.error('Fetch tournaments error:', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
    >
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>🔥</Text>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || user?.ign || 'Player'}</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.adminBadge} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.adminBadgeText}>⚙️ Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🎮</Text>
          <Text style={styles.statLabel}>IGN</Text>
          <Text style={styles.statValue}>{user?.ign || 'Set IGN'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🆔</Text>
          <Text style={styles.statLabel}>FF UID</Text>
          <Text style={styles.statValue}>{user?.ff_uid || 'Set UID'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>👑</Text>
          <Text style={styles.statLabel}>Role</Text>
          <Text style={styles.statValue}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Featured Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Upcoming Tournaments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tournaments')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {tournaments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tournaments available yet</Text>
          </View>
        ) : (
          tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onPress={() => navigation.navigate('TournamentDetail', { id: t.id })}
            />
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Tournaments')}
          >
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionText}>Tournaments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Team')}>
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionText}>My Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Leaderboard')}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionEmoji}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111111',
    marginBottom: 16,
    gap: 12,
  },
  bannerEmoji: { fontSize: 36 },
  welcomeText: { color: '#888888', fontSize: 12 },
  userName: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  adminBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statLabel: { color: '#666666', fontSize: 10, marginBottom: 2 },
  statValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  seeAll: { color: '#FF6B00', fontSize: 13 },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: { color: '#555555', fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  actionEmoji: { fontSize: 24, marginBottom: 6 },
  actionText: { color: '#CCCCCC', fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

export default HomeScreen;
