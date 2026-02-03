import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { TextInput, Button, Text, HelperText, Surface, ProgressBar, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../constants/theme';

const steps = [
  { title: 'Account', fields: ['email', 'password'] },
  { title: 'Basic Info', fields: ['full_name', 'phone'] },
  { title: 'Address', fields: ['address_street', 'address_city', 'address_state', 'address_postal'] },
];

const RegisterScreen = () => {
  const theme = useTheme<AppTheme>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postal: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { signUp } = useAuth();
  const navigation = useNavigation();

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (step === 1) {
      if (!formData.full_name || formData.full_name.length < 2) {
        newErrors.full_name = 'Full name must be at least 2 characters';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (step === 2) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setSubmitError('');

    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        phone: formData.phone,
        address_street: formData.address_street,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_postal: formData.address_postal,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View>
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.email}
              disabled={loading}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.email && <HelperText type="error" style={styles.helperText}>{errors.email}</HelperText>}

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.password}
              disabled={loading}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.password && <HelperText type="error" style={styles.helperText}>{errors.password}</HelperText>}
          </View>
        );

      case 1:
        return (
          <View>
            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(value) => updateField('full_name', value)}
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.full_name}
              disabled={loading}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.full_name && <HelperText type="error" style={styles.helperText}>{errors.full_name}</HelperText>}

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.phone}
              disabled={loading}
              placeholder="+1-555-123-4567"
              placeholderTextColor={theme.colors.outline}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.phone && <HelperText type="error" style={styles.helperText}>{errors.phone}</HelperText>}
          </View>
        );

      case 2:
        return (
          <View>
            <TextInput
              label="Street Address"
              value={formData.address_street}
              onChangeText={(value) => updateField('address_street', value)}
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.address_street}
              disabled={loading}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.address_street && <HelperText type="error" style={styles.helperText}>{errors.address_street}</HelperText>}

            <TextInput
              label="City"
              value={formData.address_city}
              onChangeText={(value) => updateField('address_city', value)}
              style={[styles.input, { backgroundColor: 'transparent' }]}
              mode="outlined"
              error={!!errors.address_city}
              disabled={loading}
              textColor={theme.colors.onSurface}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            {errors.city && <HelperText type="error" style={styles.helperText}>{errors.city}</HelperText>}

            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <TextInput
                  label="State"
                  value={formData.address_state}
                  onChangeText={(value) => updateField('address_state', value)}
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  mode="outlined"
                  error={!!errors.address_state}
                  disabled={loading}
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
                  disabled={loading}
                  textColor={theme.colors.onSurface}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
              </View>
            </View>
            {(errors.address_state || errors.address_postal) && (
              <HelperText type="error" style={styles.helperText}>
                {errors.address_state || errors.address_postal}
              </HelperText>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.secondary }]}>
            Join our community today
          </Text>
        </View>

        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <View style={styles.progressContainer}>
            <Text variant="labelMedium" style={[styles.stepIndicator, { color: theme.colors.primary }]}>
              Step {currentStep + 1} of {steps.length}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              {steps[currentStep].title}
            </Text>
            <ProgressBar
              progress={(currentStep + 1) / steps.length}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          {submitError ? (
            <HelperText type="error" visible={!!submitError} style={styles.error}>
              {submitError}
            </HelperText>
          ) : null}

          {renderStep()}

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <Button
                mode="outlined"
                onPress={handleBack}
                disabled={loading}
                style={[styles.button, styles.backButton, { borderColor: theme.colors.outline }]}
                textColor={theme.colors.onSurface}
              >
                Back
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                mode="contained"
                onPress={handleNext}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            )}
          </View>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login' as never)}
            disabled={loading}
            style={styles.linkButton}
            textColor={theme.colors.primary}
          >
            Already have an account? Sign In
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 24,
    width: '100%',
  },
  progressContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    letterSpacing: 0.25,
  },
  stepIndicator: {
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    borderWidth: 1,
  },
  linkButton: {
    marginTop: 20,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default RegisterScreen;
