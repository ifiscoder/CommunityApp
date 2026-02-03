import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, useWindowDimensions, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { profileApi } from '../../services/supabase';

const EditProfileScreen = () => {
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
    <ScrollView style={styles.container} contentContainerStyle={isTablet && styles.tabletContent}>
      <Surface style={[styles.card, isTablet && styles.tabletCard]} elevation={1}>
        <Text variant="headlineSmall" style={styles.title}>Edit Profile</Text>

        <View style={styles.photoContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Avatar.Text 
              size={120} 
              label={getInitials(formData.full_name || 'User')} 
              style={styles.avatarPlaceholder}
            />
          )}
          <IconButton
            icon="camera"
            size={24}
            onPress={pickImage}
            loading={loading}
            disabled={loading}
            style={styles.cameraButton}
            containerColor="#2563eb"
            iconColor="#ffffff"
          />
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
        
        <TextInput
          label="Full Name *"
          value={formData.full_name}
          onChangeText={(value) => updateField('full_name', value)}
          style={styles.input}
          mode="outlined"
          error={!!errors.full_name}
          disabled={saving}
        />
        {errors.full_name && <HelperText type="error">{errors.full_name}</HelperText>}

        <TextInput
          label="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
          error={!!errors.phone}
          disabled={saving}
          placeholder="+1-555-123-4567"
        />
        {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

        <Text variant="titleMedium" style={styles.sectionTitle}>Address *</Text>

        <TextInput
          label="Street Address"
          value={formData.address_street}
          onChangeText={(value) => updateField('address_street', value)}
          style={styles.input}
          mode="outlined"
          error={!!errors.address_street}
          disabled={saving}
        />
        {errors.address_street && <HelperText type="error">{errors.address_street}</HelperText>}

        <TextInput
          label="City"
          value={formData.address_city}
          onChangeText={(value) => updateField('address_city', value)}
          style={styles.input}
          mode="outlined"
          error={!!errors.address_city}
          disabled={saving}
        />
        {errors.address_city && <HelperText type="error">{errors.address_city}</HelperText>}

        <View style={styles.row}>
          <TextInput
            label="State"
            value={formData.address_state}
            onChangeText={(value) => updateField('address_state', value)}
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            error={!!errors.address_state}
            disabled={saving}
          />
          <TextInput
            label="Postal Code"
            value={formData.address_postal}
            onChangeText={(value) => updateField('address_postal', value)}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
            mode="outlined"
            error={!!errors.address_postal}
            disabled={saving}
          />
        </View>
        {(errors.address_state || errors.address_postal) && (
          <HelperText type="error">
            {errors.address_state || errors.address_postal}
          </HelperText>
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>Additional Information (Optional)</Text>

        <TextInput
          label="Date of Birth"
          value={formData.date_of_birth}
          onChangeText={(value) => updateField('date_of_birth', value)}
          placeholder="YYYY-MM-DD"
          style={styles.input}
          mode="outlined"
          disabled={saving}
        />

        <TextInput
          label="Gender"
          value={formData.gender}
          onChangeText={(value) => updateField('gender', value)}
          style={styles.input}
          mode="outlined"
          disabled={saving}
        />

        <TextInput
          label="Occupation"
          value={formData.occupation}
          onChangeText={(value) => updateField('occupation', value)}
          style={styles.input}
          mode="outlined"
          disabled={saving}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Contact (Optional)</Text>

        <TextInput
          label="Contact Name"
          value={formData.emergency_contact_name}
          onChangeText={(value) => updateField('emergency_contact_name', value)}
          style={styles.input}
          mode="outlined"
          disabled={saving}
        />

        <TextInput
          label="Contact Phone"
          value={formData.emergency_contact_phone}
          onChangeText={(value) => updateField('emergency_contact_phone', value)}
          keyboardType="phone-pad"
          style={styles.input}
          mode="outlined"
          disabled={saving}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
          >
            Save Changes
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={saving}
            style={styles.button}
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
    backgroundColor: '#f8fafc',
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
  title: {
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#2563eb',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
});

export default EditProfileScreen;
