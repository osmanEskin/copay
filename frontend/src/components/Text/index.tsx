import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  weight?: keyof typeof typography.weight;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Text({ 
  children, 
  variant = 'body', 
  color = colors.text.primary, 
  weight,
  align = 'left',
  style, 
  ...props 
}: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        { color, textAlign: align },
        weight && { fontWeight: typography.weight[weight] },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  h2: { fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  h3: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  body: { fontSize: typography.size.md, fontWeight: typography.weight.regular },
  caption: { fontSize: typography.size.sm, fontWeight: typography.weight.regular, color: colors.text.secondary },
});
