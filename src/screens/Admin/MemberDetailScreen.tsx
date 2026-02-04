import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, Alert } from 'react-native';
import { Text, Button, Avatar, Chip, Divider, Surface, ActivityIndicator, Dialog, Portal, useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { profileApi, supabase } from '../../services/supabase';
import { MemberProfile } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTheme } from '../../constants/theme';

const MemberDetailScreen = () => {
  const theme = useTheme<AppTheme>();
  const route = useRoute();
  const navigation = useNavigation();
  const { memberId } = route.params as { memberId: string };
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
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
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      console.log('Approving member:', memberId);
      await profileApi.updateProfile(memberId, { is_approved: true });
      console.log('Member approved successfully');
      setShowApproveDialog(false);
      await loadMember();
    } catch (error: any) {
      console.error('Approve error:', error);
      Alert.alert('Error', error.message || 'Failed to approve member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading) return; // Prevent multiple clicks
    
    console.log('handleDelete called for member:', memberId);
    try {
      setActionLoading(true);
      console.log('Calling Edge Function: admin-delete-user');
      console.log('With userId:', memberId);

      // Call Edge Function to delete auth user (profile cascades automatically)
      const response = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: memberId }
      });

      console.log('Edge Function response:', response);

      const { data, error } = response;

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to delete user');
      }

      console.log('Member deleted successfully:', data);
      setShowDeleteDialog(false);
      navigation.goBack();
    } catch (error: any) {
      console.error('Delete error caught:', error);
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
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{label}</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Member not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={isTablet && styles.tabletContent} keyboardShouldPersistTaps="handled">
        <Surface style={[styles.card, isTablet && styles.tabletCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={styles.header}>
            {member.photo_url ? (
              <Image source={{ uri: member.photo_url }} style={styles.avatar} />
            ) : (
              <Avatar.Text
                size={100}
                label={getInitials(member.full_name)}
                style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}
                color={theme.colors.primary}
              />
            )}

            <View style={styles.headerInfo}>
              <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>{member.full_name}</Text>
              <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.secondary }]}>{member.email}</Text>

              <View style={styles.chipContainer}>
                <Chip
                  icon={member.is_approved ? 'check-circle' : 'clock-outline'}
                  style={[
                    styles.statusChip,
                    { backgroundColor: member.is_approved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)' }
                  ]}
                  textStyle={{ color: member.is_approved ? '#10B981' : '#FBBF24' }}
                >
                  {member.is_approved ? 'Approved' : 'Pending'}
                </Chip>

                {member.is_verified && (
                  <Chip
                    icon="shield-check"
                    style={[styles.statusChip, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}
                    textStyle={{ color: '#38BDF8' }}
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
            <InfoRow icon="phone" label="Phone" value={member.phone} />
            <InfoRow icon="email" label="Email" value={member.email} />
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Address</Text>
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
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Additional Information</Text>
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
              <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
              <View style={styles.section}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Emergency Contact</Text>
                {member.emergency_contact_name && (
                  <InfoRow icon="account" label="Name" value={member.emergency_contact_name} />
                )}
                {member.emergency_contact_phone && (
                  <InfoRow icon="phone" label="Phone" value={member.emergency_contact_phone} />
                )}
              </View>
            </>
          )}

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Account Information</Text>
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
                onPress={() => setShowApproveDialog(true)}
                disabled={actionLoading}
                style={[styles.button, styles.approveButton]}
                icon="check"
                contentStyle={styles.buttonContent}
              >
                Approve Member
              </Button>
            )}

            <Button
              mode="outlined"
              onPress={() => setShowDeleteDialog(true)}
              disabled={actionLoading}
              style={[styles.button, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              icon="delete"
              contentStyle={styles.buttonContent}
            >
              Delete Member
            </Button>
          </View>
        </Surface>
      </ScrollView>

      {/* Loading Overlay */}
      {actionLoading && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: '#fff', marginTop: 16 }}>Processing...</Text>
        </View>
      )}

      <Portal>
        <Dialog 
          visible={showDeleteDialog} 
          onDismiss={() => !actionLoading && setShowDeleteDialog(false)} 
          style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.dialogHeader}>
            <View style={[styles.dialogIconContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color={theme.colors.error} />
            </View>
            <Dialog.Title style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
              Delete Member
            </Dialog.Title>
          </View>
          
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Are you sure you want to delete{' '}
              <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                {member.full_name}
              </Text>
              ?
            </Text>
            <Text variant="bodySmall" style={[styles.dialogWarning, { color: theme.colors.error }]}>
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              mode="outlined"
              onPress={() => setShowDeleteDialog(false)} 
              disabled={actionLoading}
              style={[styles.dialogButton, { borderColor: theme.colors.outline }]}
              textColor={theme.colors.onSurface}
            >
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleDelete} 
              loading={actionLoading} 
              disabled={actionLoading}
              style={[styles.dialogButton, styles.deleteButton, { backgroundColor: theme.colors.error }]}
              textColor={theme.colors.onError}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* Approve Confirmation Dialog */}
        <Dialog 
          visible={showApproveDialog} 
          onDismiss={() => !actionLoading && setShowApproveDialog(false)} 
          style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.dialogHeader}>
            <View style={[styles.dialogIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={32} color="#10B981" />
            </View>
            <Dialog.Title style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>
              Approve Member
            </Dialog.Title>
          </View>
          
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Are you sure you want to approve{' '}
              <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                {member?.full_name}
              </Text>
              ?
            </Text>
            <Text variant="bodySmall" style={[styles.dialogWarning, { color: '#10B981' }]}>
              Member status will be updated to approved.
            </Text>
          </Dialog.Content>
          
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              mode="outlined"
              onPress={() => setShowApproveDialog(false)} 
              disabled={actionLoading}
              style={[styles.dialogButton, { borderColor: theme.colors.outline }]}
              textColor={theme.colors.onSurface}
            >
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={handleApprove} 
              loading={actionLoading} 
              disabled={actionLoading}
              style={[styles.dialogButton, { backgroundColor: '#10B981' }]}
              textColor="#FFFFFF"
            >
              Approve
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    borderRadius: 24,
    marginHorizontal: 24,
    paddingVertical: 8,
  },
  dialogHeader: {
    alignItems: 'center',
    paddingTop: 16,
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  dialogWarning: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  dialogButton: {
    borderRadius: 12,
    flex: 1,
  },
  deleteButton: {
    borderRadius: 12,
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
  approveButton: {
    backgroundColor: '#10B981',
  },
});

export default MemberDetailScreen;
