import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme/tokens';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leadingIcon?: string;
  trailingIcon?: string;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  leadingIcon,
  trailingIcon,
  disabled = false,
}: AppButtonProps) {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        size === 'sm' && styles.sizeSm,
        size === 'md' && styles.sizeMd,
        size === 'lg' && styles.sizeLg,
        fullWidth && styles.fullWidth,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {leadingIcon ? (
          <Text style={[styles.icon, !isPrimary && styles.secondaryLabel]}>{leadingIcon}</Text>
        ) : null}
        <Text
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            !isPrimary && styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
        {trailingIcon ? (
          <Text style={[styles.icon, !isPrimary && styles.secondaryLabel]}>{trailingIcon}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  sizeSm: {
    borderRadius: radius.md,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  sizeMd: {
    minHeight: 52,
  },
  sizeLg: {
    minHeight: 58,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  label: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontSize: 12,
    letterSpacing: 1,
  },
  icon: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
  },
  secondaryLabel: {
    color: colors.primary,
  },
});
