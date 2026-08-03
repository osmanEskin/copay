import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { Text } from '../Text';

interface CurrencyInputProps extends TextInputProps {
  label?: string;
  currencySymbol?: string;
  error?: string;
}

export function CurrencyInput({ 
  label, 
  currencySymbol = '₺', 
  error, 
  style, 
  ...props 
}: CurrencyInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text variant="caption" style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <Text variant="h2" style={styles.symbol}>{currencySymbol}</Text>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.secondary}
          keyboardType="decimal-pad"
          {...props}
        />
      </View>
      {error && <Text variant="caption" color={colors.danger} style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.danger,
  },
  symbol: {
    marginRight: spacing.xs,
    color: colors.text.secondary,
  },
  input: {
    flex: 1,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    padding: 0,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
