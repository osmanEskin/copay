import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export function IconButton({ 
  icon, 
  onPress, 
  size = 24, 
  color, 
  variant = 'ghost',
  style 
}: IconButtonProps) {
  const getColors = () => {
    const iconColor = color || colors.primary;
    if (variant === 'solid') return { bg: colors.primary, icon: colors.text.inverse };
    if (variant === 'outline') return { bg: 'transparent', icon: iconColor, border: colors.border };
    return { bg: 'transparent', icon: iconColor };
  };

  const { bg, icon: iColor, border } = getColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: bg, width: size + 16, height: size + 16, borderRadius: (size + 16) / 2 },
        border && { borderWidth: 1, borderColor: border },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size} color={iColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
