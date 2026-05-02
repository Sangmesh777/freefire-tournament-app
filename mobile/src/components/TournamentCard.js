import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, formatCurrency, getStatusColor, truncate } from '../utils/helpers';

const TournamentCard = ({ tournament, onPress }) => {
  const statusColor = getStatusColor(tournament.status);
  const registrationCount = tournament.registrations?.length || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Top row: name + status */}
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>{tournament.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {tournament.status}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={styles.statValue}>{formatCurrency(tournament.prize_pool)}</Text>
          <Text style={styles.statLabel}>Prize</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>👥</Text>
          <Text style={styles.statValue}>{registrationCount}/{tournament.max_teams}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>🎟️</Text>
          <Text style={styles.statValue}>{formatCurrency(tournament.entry_fee)}</Text>
          <Text style={styles.statLabel}>Entry</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>📅</Text>
          <Text style={styles.statValue}>{formatDate(tournament.start_date)}</Text>
          <Text style={styles.statLabel}>Start</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  name: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 14, marginBottom: 3 },
  statValue: { color: '#FF6B00', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  statLabel: { color: '#666666', fontSize: 10, marginTop: 1 },
  divider: { width: 1, height: 30, backgroundColor: '#2A2A2A' },
});

export default TournamentCard;
