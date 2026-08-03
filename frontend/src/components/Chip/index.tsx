import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active ? styles.chipSelected : styles.chipUnselected
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.label,
        active ? styles.labelSelected : styles.labelUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  labelSelected: {
    color: colors.text.inverse,
  },
  labelUnselected: {
    color: colors.text.primary,
  },
});
