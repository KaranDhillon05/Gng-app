import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { updateCustomerProfile } from '../../core/api/customerService';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { useAuthStore } from '../auth/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInfo'>;

export function PersonalInfoScreen({ navigation }: Props) {
  const customer = useAuthStore((state) => state.customer);
  const setCustomerName = useAuthStore((state) => state.setCustomerName);
  const [name, setName] = useState(customer?.name ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== (customer?.name ?? '').trim();

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateCustomerProfile(trimmed);
      setCustomerName(trimmed);
      Alert.alert('Profile updated');
    } catch {
      Alert.alert('Could not update profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.muted} />
          <Text style={styles.backText}>Back to Profile</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Personal Information</Text>
        <Text style={styles.pageSub}>Update your name and view your account details.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.disabledText}>{customer?.phone ?? '—'}</Text>
          </View>
          <Text style={styles.helper}>Phone number cannot be changed.</Text>
        </View>

        <Pressable
          style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
          disabled={!dirty || saving}
          onPress={onSave}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  backRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: spacing.xs },
  backText: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 14 },
  pageTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, marginTop: spacing.sm },
  pageSub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.borderSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputDisabled: {
    backgroundColor: colors.imageAccent,
    justifyContent: 'center',
  },
  disabledText: {
    color: colors.muted,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
  helper: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 56,
    ...shadow.cta,
  },
  saveBtnDisabled: {
    backgroundColor: colors.borderSolid,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
