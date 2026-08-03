import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { colors } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
}

export function Screen({ 
  children, 
  scrollable = false, 
  safeArea = true,
  backgroundColor = colors.background 
}: ScreenProps) {
  const content = (
    <View style={[styles.container, { backgroundColor }]}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );

  const wrapper = safeArea ? (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {content}
    </SafeAreaView>
  ) : content;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {wrapper}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
