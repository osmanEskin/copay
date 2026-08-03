import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Button({ title, onPress, variant = 'primary', isLoading, disabled, style }: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'danger': return colors.danger;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.secondary;
    if (variant === 'outline') return colors.primary;
    return colors.text.inverse;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.primary },
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
