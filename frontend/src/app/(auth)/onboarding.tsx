import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Button, Section } from '../../components';
import { colors, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  return (
    <Screen safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={80} color={colors.primary} />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text variant="h1" color={colors.primary} align="center" style={styles.title}>
            Copay'e Hoş Geldiniz
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.description}>
            Tüm harcamalarınızı, borçlarınızı ve ortak giderlerinizi tek bir yerden kolayca yönetin.
          </Text>
        </View>

        <Section noMargin>
          <View style={styles.buttonContainer}>
            <Button 
              title="Kayıt Ol" 
              onPress={() => router.push('/register')} 
            />
            <Button 
              title="Giriş Yap" 
              variant="outline"
              onPress={() => router.push('/login')} 
            />
          </View>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  }
});
