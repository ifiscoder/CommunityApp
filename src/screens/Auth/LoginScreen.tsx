import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { AppTheme } from '../../constants/theme';

const LoginScreen = () => {
  const theme = useTheme<AppTheme>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const { signIn } = useAuth();
  const navigation = useNavigation();

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardSlideAnim = useRef(new Animated.Value(50)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  // Button press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      // Logo/branding fade in and slide up
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Card fade in and slide up (delayed)
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cardSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    animateButton();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[theme.colors.background, '#1a2744', theme.colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
          >
            {/* Hero / Branding Section with Entrance Animation */}
            <Animated.View
              style={[
                styles.brandingContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialCommunityIcons
                  name="train"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>
              <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.onBackground }]}>
                Western Railway
              </Text>
              <Text variant="bodyMedium" style={[styles.tagline, { color: theme.colors.secondary }]}>
                Employee Identity Portal
              </Text>
            </Animated.View>

            {/* Login Card with Entrance Animation */}
            <Animated.View
              style={{
                opacity: cardFadeAnim,
                transform: [{ translateY: cardSlideAnim }]
              }}
            >
              <Surface style={[styles.card, { backgroundColor: theme.colors.surface + 'F5' }]} elevation={0}>
                <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Sign In
                </Text>
                <Text variant="bodySmall" style={[styles.cardSubtitle, { color: theme.colors.secondary }]}>
                  Enter your credentials to continue
                </Text>

                {error ? (
                  <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    mode="outlined"
                    textColor={theme.colors.onSurface}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={styles.inputOutline}
                    left={<TextInput.Icon icon="email-outline" color={theme.colors.secondary} />}
                    disabled={loading}
                    accessibilityLabel="Email address input"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                    style={styles.input}
                    mode="outlined"
                    textColor={theme.colors.onSurface}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    outlineStyle={styles.inputOutline}
                    left={<TextInput.Icon icon="lock-outline" color={theme.colors.secondary} />}
                    right={
                      <TextInput.Icon
                        icon={secureText ? "eye-off-outline" : "eye-outline"}
                        onPress={() => setSecureText(!secureText)}
                        color={theme.colors.secondary}
                      />
                    }
                    disabled={loading}
                    accessibilityLabel="Password input"
                  />
                </View>

                {/* Sign In Button with Animation */}
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.signInButton}
                    contentStyle={styles.signInButtonContent}
                    labelStyle={styles.signInButtonLabel}
                    icon={loading ? undefined : "login"}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                  <Text style={[styles.dividerText, { color: theme.colors.secondary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
                </View>

                {/* Register Link */}
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Register' as never)}
                  disabled={loading}
                  style={[styles.registerButton, { borderColor: theme.colors.outline }]}
                  contentStyle={styles.registerButtonContent}
                  labelStyle={styles.registerButtonLabel}
                  textColor={theme.colors.onSurface}
                  icon="account-plus-outline"
                >
                  Create New Account
                </Button>
              </Surface>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    letterSpacing: 0.25,
  },
  card: {
    padding: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotLabel: {
    fontSize: 13,
  },
  signInButton: {
    borderRadius: 14,
    marginTop: 8,
  },
  signInButtonContent: {
    paddingVertical: 8,
  },
  signInButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
  },
  registerButton: {
    borderRadius: 14,
  },
  registerButtonContent: {
    paddingVertical: 6,
  },
  registerButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
  },
});

export default LoginScreen;
