import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getTournamentById, registerForTournament, getTeams } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency, getStatusColor } from '../utils/helpers';

const TournamentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [tRes, tmsRes] = await Promise.all([getTournamentById(id), getTeams()]);
      setTournament(tRes.data.tournament);
      const userTeam = tmsRes.data.teams.find((t) =>
        t.members?.some((m) => m.user_id === user?.id)
      );
      setMyTeam(userTeam || null);
    } catch (error) {
      console.error('Fetch detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    if (!myTeam) {
      Alert.alert('No Team', 'You need to create or join a team first!');
      return;
    }

    Alert.alert(
      'Register Team',
      `Register "${myTeam.name}" for this tournament?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setRegistering(true);
            try {
              await registerForTournament(id, myTeam.id);
              Alert.alert('Success', 'Team registered successfully!');
              fetchData();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Registration failed');
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Tournament not found</Text>
      </View>
    );
  }

  const isRegistered = tournament.registrations?.some((r) => r.team_id === myTeam?.id);
  const registrationCount = tournament.registrations?.length || 0;
  const statusColor = getStatusColor(tournament.status);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
    >
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.trophyEmoji}>🏆</Text>
        <Text style={styles.name}>{tournament.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {tournament.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statValue}>{formatCurrency(tournament.prize_pool)}</Text>
          <Text style={styles.statLabel}>Prize Pool</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>👥</Text>
          <Text style={styles.statValue}>{registrationCount}/{tournament.max_teams}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🎟️</Text>
          <Text style={styles.statValue}>{formatCurrency(tournament.entry_fee)}</Text>
          <Text style={styles.statLabel}>Entry Fee</Text>
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Schedule</Text>
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>Start Date</Text>
            <Text style={styles.scheduleValue}>{formatDate(tournament.start_date)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>End Date</Text>
            <Text style={styles.scheduleValue}>{formatDate(tournament.end_date)}</Text>
          </View>
        </View>
      </View>

      {/* Registered Teams */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Registered Teams ({registrationCount})</Text>
        {tournament.registrations?.length === 0 ? (
          <Text style={styles.emptyText}>No teams registered yet</Text>
        ) : (
          tournament.registrations?.map((reg, index) => (
            <View key={reg.id} style={styles.teamRow}>
              <Text style={styles.teamIndex}>{index + 1}</Text>
              <Text style={styles.teamName}>{reg.team?.name || 'Unknown Team'}</Text>
            </View>
          ))
        )}
      </View>

      {/* Register Button */}
      {tournament.status === 'upcoming' && !isRegistered && (
        <TouchableOpacity
          style={[styles.registerBtn, registering && styles.registerBtnDisabled]}
          onPress={handleRegister}
          disabled={registering}
        >
          {registering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerBtnText}>⚔️ Register Team</Text>
          )}
        </TouchableOpacity>
      )}

      {isRegistered && (
        <View style={styles.registeredBanner}>
          <Text style={styles.registeredText}>✅ Your team is registered!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF3B30', fontSize: 16 },
  banner: {
    backgroundColor: '#111111',
    padding: 24,
    alignItems: 'center',
    marginBottom: 4,
  },
  trophyEmoji: { fontSize: 50, marginBottom: 10 },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 20, borderRightWidth: 1, borderRightColor: '#222222' },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { color: '#FF6B00', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: '#666666', fontSize: 11 },
  section: {
    backgroundColor: '#111111',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center' },
  scheduleItem: { flex: 1, alignItems: 'center' },
  scheduleLabel: { color: '#666666', fontSize: 12, marginBottom: 4 },
  scheduleValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  divider: { width: 1, height: 40, backgroundColor: '#333333' },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    gap: 12,
  },
  teamIndex: { color: '#FF6B00', fontWeight: '700', width: 24, textAlign: 'center' },
  teamName: { color: '#CCCCCC', fontSize: 14, fontWeight: '600' },
  emptyText: { color: '#555555', textAlign: 'center', padding: 16 },
  registerBtn: {
    backgroundColor: '#FF6B00',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  registerBtnDisabled: { backgroundColor: '#7A3300' },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  registeredBanner: {
    backgroundColor: '#00C85322',
    borderWidth: 1,
    borderColor: '#00C853',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  registeredText: { color: '#00C853', fontWeight: '700', fontSize: 15 },
});

export default TournamentDetailScreen;
