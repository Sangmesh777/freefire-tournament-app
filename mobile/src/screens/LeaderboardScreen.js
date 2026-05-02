import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { getLeaderboard, getTournaments } from '../api/apiService';
import LeaderboardItem from '../components/LeaderboardItem';

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async (tournamentId) => {
    try {
      const response = await getLeaderboard(tournamentId);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
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
    fetchTournaments();
    fetchLeaderboard(null);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard(selectedTournament);
    setRefreshing(false);
  };

  const handleSelectTournament = (id) => {
    setSelectedTournament(id);
    setLoading(true);
    fetchLeaderboard(id);
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.pageTitle}>📊 Leaderboard</Text>
      <View style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedTournament && styles.filterChipActive]}
          onPress={() => handleSelectTournament(null)}
        >
          <Text style={[styles.filterChipText, !selectedTournament && styles.filterChipTextActive]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
        {tournaments.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.filterChip, selectedTournament === t.id && styles.filterChipActive]}
            onPress={() => handleSelectTournament(t.id)}
          >
            <Text style={[styles.filterChipText, selectedTournament === t.id && styles.filterChipTextActive]}>
              {t.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <View style={styles.podium}>
          <View style={[styles.podiumItem, styles.podiumSecond]}>
            <Text style={styles.podiumEmoji}>🥈</Text>
            <Text style={styles.podiumName}>{leaderboard[1]?.team?.name}</Text>
            <Text style={styles.podiumPoints}>{leaderboard[1]?.total_points} pts</Text>
          </View>
          <View style={[styles.podiumItem, styles.podiumFirst]}>
            <Text style={styles.podiumEmoji}>🥇</Text>
            <Text style={styles.podiumName}>{leaderboard[0]?.team?.name}</Text>
            <Text style={styles.podiumPoints}>{leaderboard[0]?.total_points} pts</Text>
          </View>
          <View style={[styles.podiumItem, styles.podiumThird]}>
            <Text style={styles.podiumEmoji}>🥉</Text>
            <Text style={styles.podiumName}>{leaderboard[2]?.team?.name}</Text>
            <Text style={styles.podiumPoints}>{leaderboard[2]?.total_points} pts</Text>
          </View>
        </View>
      )}

      <Text style={styles.listTitle}>All Rankings</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <LeaderboardItem entry={item} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>No leaderboard data yet</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  list: { padding: 16 },
  pageTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 16 },
  filterScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterChipActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  filterChipText: { color: '#888888', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  podiumItem: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    flex: 1,
  },
  podiumFirst: { backgroundColor: '#2A2000', borderWidth: 1, borderColor: '#FFD700', paddingVertical: 20 },
  podiumSecond: { backgroundColor: '#1A2A2A', borderWidth: 1, borderColor: '#C0C0C0' },
  podiumThird: { backgroundColor: '#2A1500', borderWidth: 1, borderColor: '#CD7F32' },
  podiumEmoji: { fontSize: 28, marginBottom: 6 },
  podiumName: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  podiumPoints: { color: '#FF6B00', fontSize: 12, fontWeight: '800', marginTop: 4 },
  listTitle: { color: '#AAAAAA', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#555555', fontSize: 15 },
});

export default LeaderboardScreen;
