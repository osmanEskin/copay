import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, radius, shadow } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, noPadding = false, style, ...props }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        !noPadding && styles.padding,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.sm,
    marginBottom: spacing.md,
  },
  padding: {
    padding: spacing.lg,
  },
});
