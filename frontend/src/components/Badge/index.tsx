import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface BadgeProps {
  count?: number;
  label?: string;
  max?: number;
  variant?: 'danger' | 'primary' | 'success' | 'warning' | 'default';
  style?: any;
}

export function Badge({ count, label, max = 99, variant = 'danger', style }: BadgeProps) {
  if (count === undefined && label === undefined) return null;
  if (count !== undefined && count <= 0) return null;
  
  const displayContent = label !== undefined ? label : (count! > max ? `${max}+` : count!.toString());
  
  const getBackgroundColor = () => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'success') return colors.success;
    if (variant === 'warning') return '#FF9500';
    if (variant === 'default') return colors.text.secondary;
    return colors.danger;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={styles.text}>{displayContent}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
});
