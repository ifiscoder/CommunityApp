import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, Alert } from 'react-native';
import { Text, Button, Avatar, Chip, Divider, Surface, ActivityIndicator, Dialog, Portal } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { profileApi } from '../../services/supabase';
import { MemberProfile } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MemberDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { memberId } = route.params as { memberId: string };
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    loadMember();
  }, [memberId]);

  const loadMember = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile(memberId);
      setMember(data);
    } catch (error) {
      console.error('Error loading member:', error);
      Alert.alert('Error', 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await profileApi.updateProfile(memberId, { is_approved: true });
      await loadMember();
      Alert.alert('Success', 'Member has been approved');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await profileApi.updateProfile(memberId, { 
        is_approved: false,
        full_name: '[Deleted]',
        email: '[deleted]',
        phone: '[deleted]',
      });
      setShowDeleteDialog(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete member');
    } finally {
      setActionLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Member not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={isTablet && styles.tabletContent}>
        <Surface style={[styles.card, isTablet && styles.tabletCard]} elevation={1}>
          <View style={styles.header}>
            {member.photo_url ? (
              <Image source={{ uri: member.photo_url }} style={styles.avatar} />
            ) : (
              <Avatar.Text 
                size={100} 
                label={getInitials(member.full_name)} 
                style={styles.avatarPlaceholder}
              />
            )}
            
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.name}>{member.full_name}</Text>
              <Text variant="bodyMedium" style={styles.email}>{member.email}</Text>
              
              <View style={styles.chipContainer}>
                <Chip 
                  icon={member.is_approved ? 'check-circle' : 'clock-outline'}
                  style={[
                    styles.statusChip, 
                    member.is_approved ? styles.approvedChip : styles.pendingChip
                  ]}
                >
                  {member.is_approved ? 'Approved' : 'Pending Approval'}
                </Chip>
                
                {member.is_verified && (
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
            <InfoRow icon="phone" label="Phone" value={member.phone} />
            <InfoRow icon="email" label="Email" value={member.email} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Address</Text>
            <InfoRow 
              icon="map-marker" 
              label="Street" 
              value={member.address_street} 
            />
            <InfoRow 
              icon="city" 
              label="City, State, Postal" 
              value={`${member.address_city}, ${member.address_state} ${member.address_postal}`} 
            />
          </View>

          {(member.date_of_birth || member.gender || member.occupation) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Additional Information</Text>
                {member.date_of_birth && (
                  <InfoRow icon="calendar" label="Date of Birth" value={member.date_of_birth} />
                )}
                {member.gender && (
                  <InfoRow icon="gender-male-female" label="Gender" value={member.gender} />
                )}
                {member.occupation && (
                  <InfoRow icon="briefcase" label="Occupation" value={member.occupation} />
                )}
              </View>
            </>
          )}

          {(member.emergency_contact_name || member.emergency_contact_phone) && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Contact</Text>
                {member.emergency_contact_name && (
                  <InfoRow icon="account" label="Name" value={member.emergency_contact_name} />
                )}
                {member.emergency_contact_phone && (
                  <InfoRow icon="phone" label="Phone" value={member.emergency_contact_phone} />
                )}
              </View>
            </>
          )}

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Account Information</Text>
            <InfoRow 
              icon="calendar-clock" 
              label="Member Since" 
              value={new Date(member.created_at).toLocaleDateString()} 
            />
            <InfoRow 
              icon="update" 
              label="Last Updated" 
              value={new Date(member.updated_at).toLocaleDateString()} 
            />
          </View>

          <View style={styles.buttonContainer}>
            {!member.is_approved && (
              <Button
                mode="contained"
                onPress={handleApprove}
                loading={actionLoading}
                disabled={actionLoading}
                style={[styles.button, styles.approveButton]}
                icon="check"
              >
                Approve Member
              </Button>
            )}
            
            <Button
              mode="outlined"
              onPress={() => setShowDeleteDialog(true)}
              disabled={actionLoading}
              style={[styles.button, styles.deleteButton]}
              textColor="#dc2626"
              icon="delete"
            >
              Delete Member
            </Button>
          </View>
        </Surface>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Member</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete {member.full_name}? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor="#dc2626">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  approveButton: {
    backgroundColor: '#16a34a',
  },
  deleteButton: {
    borderColor: '#dc2626',
  },
});

export default MemberDetailScreen;
