import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { useAuthStore } from './useAuthStore';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const requestSignupOtp = useAuthStore((state) => state.requestSignupOtp);
  const verifySignupOtp = useAuthStore((state) => state.verifySignupOtp);
  const devLogin = useAuthStore((state) => state.devLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const normalizedPhone = phone.replace(/\D/g, '');
  const normalizedName = name.trim();

  const onRequestOtp = async () => {
    if (mode === 'signup' && normalizedName.length < 2) {
      setInlineError('Enter your name to create an account.');
      return;
    }
    if (normalizedPhone.length !== 10) {
      setInlineError('Enter a valid 10-digit phone number.');
      return;
    }
    clearError();
    setInlineError(null);
    try {
      if (mode === 'signup') {
        await requestSignupOtp(normalizedName, normalizedPhone);
      } else {
        await requestOtp(normalizedPhone);
      }
      setStep('otp');
      setInlineError(null);
    } catch {
      setInlineError('Failed to send OTP. Try again.');
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      setInlineError('Enter the 6-digit OTP.');
      return;
    }
    clearError();
    setInlineError(null);
    try {
      if (mode === 'signup') {
        await verifySignupOtp(normalizedName, normalizedPhone, otp);
      } else {
        await verifyOtp(normalizedPhone, otp);
      }
      navigation.replace('SelectStore');
    } catch {
      setInlineError('Invalid or expired OTP.');
    }
  };

  const resetAuthForm = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setStep('phone');
    setOtp('');
    setInlineError(null);
    clearError();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative background blobs */}
        <View style={styles.blobTopLeft} />
        <View style={styles.blobBottomRight} />

        {/* Brand Identity */}
        <View style={styles.brandSection}>
          <View style={styles.brandIconWrapper}>
            <MaterialCommunityIcons name="basket-outline" size={34} color={colors.white} />
          </View>
          <Text style={styles.brandName}>Grab N Go</Text>
          <Text style={styles.tagline}>SCAN. PAY. GO.</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>

          {step === 'phone' ? (
            <>
              {mode === 'signup' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      autoComplete="name"
                      onChangeText={(value) => {
                        setName(value);
                        if (inlineError) setInlineError(null);
                      }}
                      placeholder="Your name"
                      placeholderTextColor={colors.placeholder}
                      style={styles.nameInput}
                      value={name}
                    />
                  </View>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <View style={styles.inputRow}>
                  <View style={styles.dialCode}>
                    <Text style={styles.dialCodeText}>+91</Text>
                  </View>
                  <TextInput
                    autoComplete="tel"
                    keyboardType="phone-pad"
                    maxLength={10}
                    onChangeText={(value) => {
                      setPhone(value);
                      if (inlineError) setInlineError(null);
                    }}
                    placeholder="98765 43210"
                    placeholderTextColor={colors.placeholder}
                    style={styles.phoneInput}
                    value={phone}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
              <View style={styles.inputRow}>
                <TextInput
                  keyboardType="numeric"
                  maxLength={6}
                  onChangeText={(value) => {
                    setOtp(value.replace(/\D/g, ''));
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={colors.placeholder}
                  style={styles.otpInput}
                  value={otp}
                />
              </View>
            </View>
          )}

          {inlineError ? (
            <Text style={styles.inlineError}>{inlineError}</Text>
          ) : null}

          {/* Primary CTA */}
          <Pressable
            accessibilityRole="button"
            onPress={step === 'phone' ? onRequestOtp : onVerifyOtp}
            style={styles.primaryBtn}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading
                ? 'Please wait...'
                : step === 'phone'
                  ? mode === 'signup'
                    ? 'Create Account'
                    : 'Get Verification Code'
                  : 'Verify & Continue'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.white} />
          </Pressable>

          {/* Sign Up */}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (step === 'otp') {
                setStep('phone');
                setOtp('');
                setInlineError(null);
                clearError();
                return;
              }
              resetAuthForm(mode === 'signup' ? 'login' : 'signup');
            }}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>
              {step === 'otp' ? 'Edit Phone Number' : mode === 'signup' ? 'Log In Instead' : 'Sign Up'}
            </Text>
            <MaterialCommunityIcons name="account-plus-outline" size={18} color={colors.primary} />
          </Pressable>

          {__DEV__ && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                devLogin();
                navigation.replace('SelectStore');
              }}
              style={styles.devBypassBtn}
            >
              <Text style={styles.devBypassBtnText}>Continue without OTP (Dev)</Text>
            </Pressable>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text
            onPress={() => Alert.alert('Terms of Service', 'Terms of Service content coming soon.')}
            style={styles.footerLink}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            onPress={() => Alert.alert('Privacy Policy', 'Privacy Policy content coming soon.')}
            style={styles.footerLink}
          >
            Privacy Policy
          </Text>.
        </Text>
      </ScrollView>

      {/* Bottom tagline */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomTagline}>Your cart, your pace, zero waiting.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: 64,
  },
  blobTopLeft: {
    backgroundColor: 'rgba(194,101,42,0.05)',
    borderRadius: 9999,
    height: 315,
    left: -39,
    position: 'absolute',
    top: -79,
    width: 156,
  },
  blobBottomRight: {
    backgroundColor: 'rgba(140,60,60,0.05)',
    borderRadius: 9999,
    bottom: '-5%',
    height: 236,
    position: 'absolute',
    right: '-5%',
    width: 117,
  },
  brandSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  brandIconWrapper: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.1)',
    borderRadius: radius.lg,
    height: 51,
    justifyContent: 'center',
    width: 64,
  },
  brandIcon: {
    height: 27,
    resizeMode: 'contain',
    width: 31,
  },
  brandName: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 48,
    letterSpacing: -1.2,
    lineHeight: 52,
    marginTop: 12,
    textAlign: 'center',
  },
  tagline: {
    color: colors.subtle,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    letterSpacing: 0.35,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(216,208,200,0.3)',
    borderRadius: radius.xxl,
    borderWidth: 1,
    gap: spacing.lg,
    paddingHorizontal: 33,
    paddingVertical: 49,
    width: '100%',
    ...shadow.card,
  },
  cardHeading: {
    color: colors.ink,
    fontFamily: fonts.serifMedium,
    fontSize: 30,
    lineHeight: 36,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputRow: {
    backgroundColor: colors.white,
    borderColor: 'rgba(216,208,200,0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    overflow: 'hidden',
  },
  dialCode: {
    alignItems: 'center',
    borderColor: 'rgba(216,208,200,0.6)',
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialCodeText: {
    color: '#605850',
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  phoneInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    paddingHorizontal: spacing.md,
  },
  nameInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    paddingHorizontal: spacing.md,
  },
  otpInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    letterSpacing: 6,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  inlineError: {
    color: '#B3261E',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
    ...shadow.cta,
  },
  primaryBtnText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  btnArrow: {
    height: 16,
    resizeMode: 'contain',
    width: 16,
  },
  secondaryBtn: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 17,
  },
  secondaryBtnText: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  signupIcon: {
    height: 16,
    resizeMode: 'contain',
    width: 22,
  },
  devBypassBtn: {
    alignItems: 'center',
    borderColor: 'rgba(120,112,106,0.4)',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  devBypassBtnText: {
    color: colors.subtle,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  footerText: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary,
    fontFamily: fonts.sansSemiBold,
    textDecorationLine: 'underline',
  },
  bottomBar: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  bottomTagline: {
    color: 'rgba(120,112,106,0.6)',
    fontFamily: fonts.serifMedium,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
