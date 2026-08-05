import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  marginVertical?: number;
  style?: ViewStyle;
}

export function Divider({ 
  orientation = 'horizontal', 
  marginVertical = spacing.md,
  style 
}: DividerProps) {
  return (
    <View 
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        orientation === 'horizontal' && { marginVertical },
        style
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  vertical: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
