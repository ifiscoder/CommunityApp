import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Searchbar, Chip, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { profileApi } from '../../services/supabase';
import { MemberProfile } from '../../types';

const AdminDashboardScreen = () => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, filter, members]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getAllProfiles();
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (filter === 'pending') {
      filtered = filtered.filter(m => !m.is_approved);
    } else if (filter === 'approved') {
      filtered = filtered.filter(m => m.is_approved);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.full_name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query) ||
        m.address_city.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderItem = ({ item }: { item: MemberProfile }) => (
    <TouchableOpacity
      onPress={() => (navigation as any).navigate('MemberDetail', { memberId: item.id })}
    >
      <Card style={[styles.card, isTablet && styles.tabletCard]} elevation={1}>
        <Card.Content style={styles.cardContent}>
          {item.photo_url ? (
            <Avatar.Image source={{ uri: item.photo_url }} size={60} style={styles.avatar} />
          ) : (
            <Avatar.Text 
              size={60} 
              label={getInitials(item.full_name)} 
              style={styles.avatarPlaceholder}
            />
          )}
          
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>{item.full_name}</Text>
            <Text variant="bodySmall" style={styles.email}>{item.email}</Text>
            <Text variant="bodySmall" style={styles.location}>
              {item.address_city}, {item.address_state}
            </Text>
            
            <View style={styles.chipContainer}>
              <Chip 
                style={[
                  styles.statusChip,
                  item.is_approved ? styles.approvedChip : styles.pendingChip
                ]}
                textStyle={item.is_approved ? styles.approvedText : styles.pendingText}
              >
                {item.is_approved ? 'Approved' : 'Pending'}
              </Chip>
              
              {item.is_verified && (
                <Chip style={styles.verifiedChip} textStyle={styles.verifiedText}>
                  Verified
                </Chip>
              )}
            </View>
          </View>
          
          <IconButton icon="chevron-right" size={24} iconColor="#94a3b8" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const stats = {
    total: members.length,
    approved: members.filter(m => m.is_approved).length,
    pending: members.filter(m => !m.is_approved).length,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Admin Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={styles.statNumber}>{stats.total}</Text>
            <Text variant="bodySmall" style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={[styles.statNumber, styles.approvedStat]}>
              {stats.approved}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={[styles.statNumber, styles.pendingStat]}>
              {stats.pending}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search members..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterChips}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
            style={styles.filterChip}
          >
            Pending
          </Chip>
          <Chip
            selected={filter === 'approved'}
            onPress={() => setFilter('approved')}
            style={styles.filterChip}
          >
            Approved
          </Chip>
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          isTablet && styles.tabletList
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadMembers}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No members found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  approvedStat: {
    color: '#16a34a',
  },
  pendingStat: {
    color: '#ca8a04',
  },
  statLabel: {
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
  },
  list: {
    padding: 16,
  },
  tabletList: {
    padding: 24,
    alignItems: 'center',
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  tabletCard: {
    maxWidth: 700,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#2563eb',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  email: {
    color: '#64748b',
    marginBottom: 2,
  },
  location: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  approvedChip: {
    backgroundColor: '#dcfce7',
  },
  pendingChip: {
    backgroundColor: '#fef3c7',
  },
  approvedText: {
    color: '#16a34a',
    fontSize: 12,
  },
  pendingText: {
    color: '#ca8a04',
    fontSize: 12,
  },
  verifiedChip: {
    backgroundColor: '#dbeafe',
    height: 28,
  },
  verifiedText: {
    color: '#2563eb',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#64748b',
  },
});

export default AdminDashboardScreen;
