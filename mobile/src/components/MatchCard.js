import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDateTime, getMatchStatusColor } from '../utils/helpers';

const MatchCard = ({ match, onPress }) => {
  const statusColor = getMatchStatusColor(match.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Status + Round */}
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
          {match.status === 'live' && <Text style={[styles.liveDot, { color: statusColor }]}>● </Text>}
          <Text style={[styles.statusText, { color: statusColor }]}>{match.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.roundText}>Round {match.round}</Text>
        <Text style={styles.scheduleText}>{formatDateTime(match.scheduled_at)}</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <View style={styles.teamSide}>
          <Text style={styles.teamEmoji}>⚔️</Text>
          <Text style={styles.teamName}>{match.team1?.name || 'TBD'}</Text>
        </View>

        <View style={styles.vsBox}>
          <Text style={styles.vsText}>VS</Text>
          {match.winner_id && (
            <Text style={styles.winnerText}>
              {match.winner?.name} wins!
            </Text>
          )}
        </View>

        <View style={[styles.teamSide, styles.teamSideRight]}>
          <Text style={styles.teamEmoji}>🛡️</Text>
          <Text style={styles.teamName}>{match.team2?.name || 'TBD'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222222',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  liveDot: { fontSize: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  roundText: { color: '#888888', fontSize: 12, marginLeft: 'auto' },
  scheduleText: { color: '#AAAAAA', fontSize: 11 },
  teamsRow: { flexDirection: 'row', alignItems: 'center' },
  teamSide: { flex: 1, alignItems: 'center' },
  teamSideRight: { alignItems: 'center' },
  teamEmoji: { fontSize: 22, marginBottom: 4 },
  teamName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  vsBox: { alignItems: 'center', paddingHorizontal: 12 },
  vsText: { color: '#FF6B00', fontSize: 18, fontWeight: '900' },
  winnerText: { color: '#00C853', fontSize: 10, fontWeight: '700', marginTop: 4 },
});

export default MatchCard;
