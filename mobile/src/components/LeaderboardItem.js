import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getInitials, getRankSuffix } from '../utils/helpers';

const MEDAL_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

const LeaderboardItem = ({ entry, index }) => {
  const rank = index + 1;
  const medal = MEDAL_EMOJIS[rank];
  const rankColor = RANK_COLORS[rank] || '#AAAAAA';

  return (
    <View style={[styles.container, rank <= 3 && styles.containerTop]}>
      {/* Rank */}
      <View style={styles.rankSection}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
        )}
      </View>

      {/* Team Logo */}
      <View style={styles.logoSection}>
        {entry.team?.logo ? (
          <Image source={{ uri: entry.team.logo }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, rank <= 3 && { borderColor: rankColor }]}>
            <Text style={styles.logoInitials}>{getInitials(entry.team?.name || '?')}</Text>
          </View>
        )}
      </View>

      {/* Team Info */}
      <View style={styles.info}>
        <Text style={styles.teamName}>{entry.team?.name || 'Unknown Team'}</Text>
        <Text style={styles.kills}>{entry.total_kills} kills</Text>
      </View>

      {/* Points */}
      <View style={styles.pointsSection}>
        <Text style={[styles.points, { color: rankColor }]}>{entry.total_points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222222',
    gap: 10,
  },
  containerTop: {
    borderColor: '#333333',
    backgroundColor: '#151515',
  },
  rankSection: { width: 36, alignItems: 'center' },
  medal: { fontSize: 22 },
  rankText: { fontSize: 16, fontWeight: '800' },
  logoSection: {},
  logo: { width: 42, height: 42, borderRadius: 21 },
  logoPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444444',
  },
  logoInitials: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  info: { flex: 1 },
  teamName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  kills: { color: '#888888', fontSize: 12 },
  pointsSection: { alignItems: 'center' },
  points: { fontSize: 20, fontWeight: '900' },
  pointsLabel: { color: '#666666', fontSize: 10, fontWeight: '600' },
});

export default LeaderboardItem;
