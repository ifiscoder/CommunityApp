import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, TouchableOpacity, AppState } from 'react-native';
import { Text, Card, Avatar, Searchbar, Chip, ActivityIndicator, Surface, IconButton, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { profileApi, supabase } from '../../services/supabase';
import { MemberProfile } from '../../types';
import { AppTheme } from '../../constants/theme';

const AdminDashboardScreen = () => {
  const theme = useTheme<AppTheme>();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Reload members when screen comes into focus (after approve/delete)
  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  // Realtime subscription for new/updated members
  useEffect(() => {
    const subscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profile change detected:', payload);
          loadMembers(); // Refresh list when any profile changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadMembers();
      }
    });

    return () => {
      subscription.remove();
    };
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
      <Card style={[styles.card, isTablet && styles.tabletCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Card.Content style={styles.cardContent}>
          {item.photo_url ? (
            <Avatar.Image source={{ uri: item.photo_url }} size={60} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={60}
              label={getInitials(item.full_name)}
              style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}
              color={theme.colors.primary}
            />
          )}

          <View style={styles.info}>
            <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{item.full_name}</Text>
            <Text variant="bodySmall" style={[styles.email, { color: theme.colors.secondary }]}>{item.email}</Text>
            <Text variant="bodySmall" style={[styles.location, { color: theme.colors.outline }]}>
              {item.address_city}, {item.address_state}
            </Text>

            <View style={styles.chipContainer}>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: item.is_approved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)' }
                ]}
                textStyle={{ color: item.is_approved ? '#10B981' : '#FBBF24', fontSize: 12 }}
              >
                {item.is_approved ? 'Approved' : 'Pending'}
              </Chip>

              {item.is_verified && (
                <Chip
                  style={[styles.verifiedChip, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}
                  textStyle={{ color: '#38BDF8', fontSize: 12 }}
                >
                  Verified
                </Chip>
              )}
            </View>
          </View>

          <IconButton icon="chevron-right" size={24} iconColor={theme.colors.outline} />
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
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Admin Dashboard</Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.total}</Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.secondary }]}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={[styles.statNumber, styles.approvedStat]}>
              {stats.approved}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.secondary }]}>Approved</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineMedium" style={[styles.statNumber, styles.pendingStat]}>
              {stats.pending}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.secondary }]}>Pending</Text>
          </View>
        </View>
      </Surface>

      <View style={[styles.filterContainer, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder="Search members..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurface }]}
          iconColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.onSurface }}
          placeholderTextColor={theme.colors.outline}
        />

        <View style={styles.filterChips}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[
              styles.filterChip,
              { backgroundColor: filter === 'all' ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
            ]}
            textStyle={{ color: filter === 'all' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
            style={[
              styles.filterChip,
              { backgroundColor: filter === 'pending' ? 'rgba(251, 191, 36, 0.2)' : theme.colors.surfaceVariant }
            ]}
            textStyle={{ color: filter === 'pending' ? '#FBBF24' : theme.colors.onSurfaceVariant }}
          >
            Pending
          </Chip>
          <Chip
            selected={filter === 'approved'}
            onPress={() => setFilter('approved')}
            style={[
              styles.filterChip,
              { backgroundColor: filter === 'approved' ? 'rgba(16, 185, 129, 0.2)' : theme.colors.surfaceVariant }
            ]}
            textStyle={{ color: filter === 'approved' ? '#10B981' : theme.colors.onSurfaceVariant }}
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
            <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.secondary }]}>
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
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
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
  },
  approvedStat: {
    color: '#10B981',
  },
  pendingStat: {
    color: '#FBBF24',
  },
  statLabel: {
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    borderRadius: 16,
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
    borderRadius: 16,
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
    marginRight: 16,
    borderRadius: 30,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    marginBottom: 2,
  },
  location: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 28,
    borderRadius: 14,
  },
  verifiedChip: {
    height: 28,
    borderRadius: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    opacity: 0.7,
  },
});

export default AdminDashboardScreen;
