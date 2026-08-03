import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { colors, typography } from '../../theme';

interface AvatarProps {
  source?: ImageSourcePropType;
  initials?: string;
  size?: number;
  style?: any;
}

export function Avatar({ source, initials, size = 48, style }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source) {
    return <Image source={source} style={[styles.container, containerStyle, style]} />;
  }

  return (
    <View style={[styles.container, styles.placeholder, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials?.substring(0, 2).toUpperCase() || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '20', // %20 opacity
  },
  initials: {
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
});
