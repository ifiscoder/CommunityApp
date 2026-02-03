import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { Text, Card, Button, Avatar, Chip, Divider, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    // If auth is done loading and profile is still null, user was deleted
    if (!authLoading && !profile) {
      console.log('Profile not found - user may have been deleted');
      signOut();
    }
  }, [authLoading, profile, signOut]);

  // Show loading only during initial auth check
  if (authLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // If no profile after loading, show error briefly before signOut redirects
  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Profile not found. Redirecting...</Text>
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
      <MaterialCommunityIcons name={icon as any} size={20} color="#64748b" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text variant="bodySmall" style={styles.infoLabel}>{label}</Text>
        <Text variant="bodyMedium" style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={isTablet && styles.tabletContent}>
      <Surface style={[styles.card, isTablet && styles.tabletCard]} elevation={1}>
        <View style={styles.header}>
          {profile.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
          ) : (
            <Avatar.Text 
              size={100} 
              label={getInitials(profile.full_name)} 
              style={styles.avatarPlaceholder}
            />
          )}
          
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.name}>{profile.full_name}</Text>
            <Text variant="bodyMedium" style={styles.email}>{profile.email}</Text>
            
            <View style={styles.chipContainer}>
              <Chip 
                icon={profile.is_approved ? 'check-circle' : 'clock-outline'}
                style={[
                  styles.statusChip, 
                  profile.is_approved ? styles.approvedChip : styles.pendingChip
                ]}
              >
                {profile.is_approved ? 'Approved' : 'Pending Approval'}
              </Chip>
              
              {profile.is_verified && (
                <Chip icon="shield-check" style={styles.verifiedChip}>
                  Verified
                </Chip>
              )}
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon="phone" label="Phone" value={profile.phone} />
          <InfoRow icon="email" label="Email" value={profile.email} />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Address</Text>
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

        {(profile.date_of_birth || profile.gender || profile.occupation) && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Additional Information</Text>
              {profile.date_of_birth && (
                <InfoRow icon="calendar" label="Date of Birth" value={profile.date_of_birth} />
              )}
              {profile.gender && (
                <InfoRow icon="gender-male-female" label="Gender" value={profile.gender} />
              )}
              {profile.occupation && (
                <InfoRow icon="briefcase" label="Occupation" value={profile.occupation} />
              )}
            </View>
          </>
        )}

        {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Contact</Text>
              {profile.emergency_contact_name && (
                <InfoRow icon="account" label="Name" value={profile.emergency_contact_name} />
              )}
              {profile.emergency_contact_phone && (
                <InfoRow icon="phone" label="Phone" value={profile.emergency_contact_phone} />
              )}
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EditProfile' as never)}
            style={styles.button}
            icon="pencil"
          >
            Edit Profile
          </Button>
          
          <Button
            mode="outlined"
            onPress={signOut}
            style={styles.button}
            icon="logout"
            textColor="#dc2626"
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
    backgroundColor: '#f8fafc',
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
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  tabletCard: {
    maxWidth: 700,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#2563eb',
  },
  headerInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    color: '#64748b',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 32,
  },
  approvedChip: {
    backgroundColor: '#dcfce7',
  },
  pendingChip: {
    backgroundColor: '#fef3c7',
  },
  verifiedChip: {
    backgroundColor: '#dbeafe',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e2e8f0',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    color: '#1e293b',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
});

export default ProfileScreen;
