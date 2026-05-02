import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { getTournaments } from '../api/apiService';
import TournamentCard from '../components/TournamentCard';

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

const TournamentListScreen = ({ navigation }) => {
  const [tournaments, setTournaments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    try {
      const response = await getTournaments();
      setTournaments(response.data.tournaments);
      setFiltered(response.data.tournaments);
    } catch (error) {
      console.error('Fetch tournaments error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    let data = tournaments;
    if (activeFilter !== 'all') {
      data = data.filter((t) => t.status === activeFilter);
    }
    if (search.trim()) {
      data = data.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(data);
  }, [activeFilter, search, tournaments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Search tournaments..."
        placeholderTextColor="#555555"
      />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TournamentCard
            tournament={item}
            onPress={() => navigation.navigate('TournamentDetail', { id: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyText}>No tournaments found</Text>
          </View>
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
  search: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterBtnActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  filterText: { color: '#888888', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#555555', fontSize: 16 },
});

export default TournamentListScreen;
