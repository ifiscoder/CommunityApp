import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, RefreshControl } from 'react-native';
import { Text, Button, Avatar, Chip, Divider, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme } from '../../constants/theme';

const ProfileScreen = () => {
  const theme = useTheme<AppTheme>();
  const { profile, user, signOut, loading: authLoading, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !profile) {
      console.log('Profile not found - user may have been deleted');
      signOut();
    }
  }, [authLoading, profile, signOut]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  if (authLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.primary }}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Profile not found. Redirecting...</Text>
      </View>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{label}</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={isTablet && styles.tabletContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Surface style={[styles.card, isTablet && styles.tabletCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.header}>
          {profile.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={100}
              label={getInitials(profile.full_name)}
              style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}
              color={theme.colors.primary}
            />
          )}

          <View style={styles.headerInfo}>
            <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{profile.full_name}</Text>
            <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.secondary }]}>{profile.email}</Text>

            <View style={styles.chipContainer}>
              <Chip
                icon={profile.is_approved ? 'check-circle' : 'clock-outline'}
                style={[
                  styles.statusChip,
                  { backgroundColor: profile.is_approved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)' }
                ]}
                textStyle={{ color: profile.is_approved ? '#10B981' : '#FBBF24', textDecorationLine: 'none' }}
              >
                {profile.is_approved ? 'Approved' : 'Pending'}
              </Chip>

              {profile.is_verified && (
                <Chip
                  icon="shield-check"
                  style={[styles.statusChip, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}
                  textStyle={{ color: '#38BDF8', textDecorationLine: 'none' }}
                >
                  Verified
                </Chip>
              )}
            </View>
          </View>
        </View>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Contact Information</Text>
          <InfoRow icon="phone" label="Phone" value={profile.phone} />
          <InfoRow icon="email" label="Email" value={profile.email} />
        </View>

        <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Address</Text>
          <InfoRow
            icon="map-marker"
            label="Street"
            value={profile.address_street}
          />
          <InfoRow
            icon="city"
            label="City, State, Postal"
            value={`${profile.address_city}, ${profile.address_state} ${profile.address_postal}`}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EditProfile' as never)}
            style={styles.button}
            icon="pencil"
            contentStyle={styles.buttonContent}
          >
            Edit Profile
          </Button>

          <Button
            mode="outlined"
            onPress={signOut}
            style={[styles.button, { borderColor: theme.colors.error }]}
            icon="logout"
            textColor={theme.colors.error}
            contentStyle={styles.buttonContent}
          >
            Sign Out
          </Button>
        </View>
      </Surface>
    </ScrollView>
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
  tabletContent: {
    padding: 24,
    alignItems: 'center',
  },
  card: {
    margin: 16,
    padding: 24,
    borderRadius: 24,
  },
  tabletCard: {
    maxWidth: 700,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    borderRadius: 50,
  },
  headerInfo: {
    marginLeft: 24,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  divider: {
    marginVertical: 24,
    height: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;
