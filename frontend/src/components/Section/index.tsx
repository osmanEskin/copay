import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noMargin?: boolean;
}

export function Section({ title, action, children, noMargin = false }: SectionProps) {
  return (
    <View style={[styles.container, !noMargin && styles.margin]}>
      {(title || action) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {action && <View>{action}</View>}
        </View>
      )}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  margin: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
});
