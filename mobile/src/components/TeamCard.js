import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getInitials } from '../utils/helpers';

const TeamCard = ({ team, onPress }) => {
  const memberCount = team.members?.length || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.logoSection}>
        {team.logo ? (
          <Image source={{ uri: team.logo }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoInitials}>{getInitials(team.name)}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.captain}>
          👑 {team.captain?.name || team.captain?.ign || 'Captain'}
        </Text>
        <Text style={styles.members}>{memberCount}/4 members</Text>
      </View>

      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    gap: 14,
  },
  logoSection: {},
  logo: { width: 52, height: 52, borderRadius: 26 },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitials: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  teamName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  captain: { color: '#FF9500', fontSize: 12, marginBottom: 2 },
  members: { color: '#888888', fontSize: 12 },
  arrow: { paddingLeft: 8 },
  arrowText: { color: '#555555', fontSize: 22 },
});

export default TeamCard;
