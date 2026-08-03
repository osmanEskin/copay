import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../../theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Container({ children, style }: ContainerProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    width: '100%',
  },
});
