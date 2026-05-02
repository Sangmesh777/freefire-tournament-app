import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getMatchById } from '../api/apiService';
import { formatDateTime, getMatchStatusColor } from '../utils/helpers';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const MatchScreen = ({ route }) => {
  const { id } = route.params;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);

  const fetchMatch = async () => {
    try {
      const response = await getMatchById(id);
      setMatch(response.data.match);
    } catch (error) {
      console.error('Fetch match error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    setupSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_match', id);
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const setupSocket = async () => {
    const token = await AsyncStorage.getItem('token');
    const socket = io(BASE_URL, { auth: { token } });

    socket.on('connect', () => {
      socket.emit('join_match', id);
    });

    socket.on('match_updated', ({ match: updatedMatch }) => {
      if (updatedMatch.id === parseInt(id)) {
        setMatch(updatedMatch);
      }
    });

    socket.on('match_result', () => {
      fetchMatch();
    });

    socketRef.current = socket;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  const statusColor = getMatchStatusColor(match.status);
  const team1Result = match.results?.find((r) => r.team_id === match.team1_id);
  const team2Result = match.results?.find((r) => r.team_id === match.team2_id);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
    >
      {/* Match Header */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
          {match.status === 'live' && <Text style={styles.liveDot}>●</Text>}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {match.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.roundText}>Round {match.round}</Text>
        <Text style={styles.scheduleText}>{formatDateTime(match.scheduled_at)}</Text>
      </View>

      {/* Teams vs */}
      <View style={styles.teamsContainer}>
        <View style={styles.teamBox}>
          <Text style={styles.teamEmoji}>⚔️</Text>
          <Text style={styles.teamName}>{match.team1?.name || 'TBD'}</Text>
          {team1Result && (
            <View style={styles.resultBox}>
              <Text style={styles.kills}>{team1Result.kills} 💀</Text>
              <Text style={styles.points}>{team1Result.points} pts</Text>
            </View>
          )}
          {match.winner_id === match.team1_id && (
            <Text style={styles.winnerBadge}>👑 WINNER</Text>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.teamBox}>
          <Text style={styles.teamEmoji}>🛡️</Text>
          <Text style={styles.teamName}>{match.team2?.name || 'TBD'}</Text>
          {team2Result && (
            <View style={styles.resultBox}>
              <Text style={styles.kills}>{team2Result.kills} 💀</Text>
              <Text style={styles.points}>{team2Result.points} pts</Text>
            </View>
          )}
          {match.winner_id === match.team2_id && (
            <Text style={styles.winnerBadge}>👑 WINNER</Text>
          )}
        </View>
      </View>

      {/* Results Table */}
      {match.results && match.results.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Match Results</Text>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultCol, { flex: 2 }]}>Team</Text>
            <Text style={styles.resultCol}>Kills</Text>
            <Text style={styles.resultCol}>Placement</Text>
            <Text style={styles.resultCol}>Points</Text>
          </View>
          {match.results.map((result) => (
            <View key={result.id} style={styles.resultRow}>
              <Text style={[styles.resultCell, { flex: 2, color: '#FFFFFF' }]}>
                {result.team?.name || 'Team'}
              </Text>
              <Text style={[styles.resultCell, { color: '#FF3B30' }]}>{result.kills}</Text>
              <Text style={[styles.resultCell, { color: '#FF9500' }]}>#{result.placement}</Text>
              <Text style={[styles.resultCell, { color: '#00C853' }]}>{result.points}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF3B30', fontSize: 16 },
  header: { backgroundColor: '#111111', padding: 20, alignItems: 'center', marginBottom: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 8,
  },
  liveDot: { color: '#FF3B30', fontSize: 10 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  roundText: { color: '#888888', fontSize: 13, marginBottom: 4 },
  scheduleText: { color: '#CCCCCC', fontSize: 13 },
  teamsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamBox: { flex: 1, alignItems: 'center', padding: 10 },
  teamEmoji: { fontSize: 30, marginBottom: 8 },
  teamName: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, textAlign: 'center', marginBottom: 6 },
  resultBox: { alignItems: 'center' },
  kills: { color: '#FF3B30', fontWeight: '700', fontSize: 14 },
  points: { color: '#00C853', fontWeight: '700', fontSize: 14 },
  winnerBadge: { color: '#FFD700', fontSize: 11, fontWeight: '700', marginTop: 6 },
  vsContainer: { paddingHorizontal: 10 },
  vsText: { color: '#FF6B00', fontSize: 22, fontWeight: '900' },
  section: {
    backgroundColor: '#111111',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 12 },
  resultsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 8,
  },
  resultCol: { flex: 1, color: '#888888', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  resultCell: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '600' },
});

export default MatchScreen;
