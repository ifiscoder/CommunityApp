import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, Avatar, IconButton, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { profileApi } from '../../services/supabase';
import { AppTheme } from '../../constants/theme';

const EditProfileScreen = () => {
  const theme = useTheme<AppTheme>();
  const { profile, user, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postal: '',
    date_of_birth: '',
    gender: '',
    occupation: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address_street: profile.address_street || '',
        address_city: profile.address_city || '',
        address_state: profile.address_state || '',
        address_postal: profile.address_postal || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
      });
      setPhotoUri(profile.photo_url || null);
    }
  }, [profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotoUri(result.assets[0].uri);

      try {
        setLoading(true);
        const photoUrl = await profileApi.uploadPhoto(
          user!.id,
          result.assets[0].base64
        );
        await profileApi.updateProfile(user!.id, { photo_url: photoUrl });
        await refreshProfile();
      } catch (error: any) {
        Alert.alert('Error', 'Failed to upload photo: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address_street) {
      newErrors.address_street = 'Street address is required';
    }
    if (!formData.address_city) {
      newErrors.address_city = 'City is required';
    }
    if (!formData.address_state) {
      newErrors.address_state = 'State is required';
    }
    if (!formData.address_postal) {
      newErrors.address_postal = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await profileApi.updateProfile(user!.id, formData);
      await refreshProfile();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={isTablet && styles.tabletContent}>
      <Surface style={[styles.card, isTablet && styles.tabletCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>Edit Profile</Text>

        <View style={styles.photoContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={[styles.photo, { borderColor: theme.colors.surfaceVariant, borderWidth: 4 }]} />
          ) : (
            <Avatar.Text
              size={120}
              label={getInitials(formData.full_name || 'User')}
              style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}
              color={theme.colors.primary}
            />
          )}
          <IconButton
            icon="camera"
            size={24}
            onPress={pickImage}
            loading={loading}
            disabled={loading}
            style={styles.cameraButton}
            containerColor={theme.colors.primary}
            iconColor={theme.colors.onPrimary}
          />
        </View>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Basic Information</Text>

        <TextInput
          label="Full Name *"
          value={formData.full_name}
          onChangeText={(value) => updateField('full_name', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          error={!!errors.full_name}
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
        {errors.full_name && <HelperText type="error">{errors.full_name}</HelperText>}

        <TextInput
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          error={!!errors.phone}
          disabled={saving}
          placeholder="+1-555-123-4567"
          placeholderTextColor={theme.colors.outline}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
        {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Address *</Text>

        <TextInput
          label="Street Address"
          value={formData.address_street}
          onChangeText={(value) => updateField('address_street', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          error={!!errors.address_street}
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
        {errors.address_street && <HelperText type="error">{errors.address_street}</HelperText>}

        <TextInput
          label="City"
          value={formData.address_city}
          onChangeText={(value) => updateField('address_city', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          error={!!errors.address_city}
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
        {errors.address_city && <HelperText type="error">{errors.address_city}</HelperText>}

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <TextInput
              label="State"
              value={formData.address_state}
              onChangeText={(value) => updateField('address_state', value)}
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.address_state}
              disabled={saving}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <TextInput
              label="Postal Code"
              value={formData.address_postal}
              onChangeText={(value) => updateField('address_postal', value)}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.address_postal}
              disabled={saving}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>
        </View>
        {(errors.address_state || errors.address_postal) && (
          <HelperText type="error">
            {errors.address_state || errors.address_postal}
          </HelperText>
        )}

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Additional Information (Optional)</Text>

        <TextInput
          label="Date of Birth"
          value={formData.date_of_birth}
          onChangeText={(value) => updateField('date_of_birth', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.outline}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        <TextInput
          label="Gender"
          value={formData.gender}
          onChangeText={(value) => updateField('gender', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        <TextInput
          label="Occupation"
          value={formData.occupation}
          onChangeText={(value) => updateField('occupation', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>Emergency Contact (Optional)</Text>

        <TextInput
          label="Contact Name"
          value={formData.emergency_contact_name}
          onChangeText={(value) => updateField('emergency_contact_name', value)}
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        <TextInput
          label="Contact Phone"
          value={formData.emergency_contact_phone}
          onChangeText={(value) => updateField('emergency_contact_phone', value)}
          keyboardType="phone-pad"
          style={[styles.input, { backgroundColor: 'transparent' }]}
          mode="outlined"
          disabled={saving}
          textColor={theme.colors.onSurface}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Save Changes
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={saving}
            style={[styles.button, { borderColor: theme.colors.outline }]}
            textColor={theme.colors.onSurface}
            contentStyle={styles.buttonContent}
          >
            Cancel
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
  title: {
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInputContainer: {
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

export default EditProfileScreen;
