import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, Button, Text } from "../../components";
import { colors, spacing } from "../../theme";
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  return (
    <Screen safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread-outline" size={80} color={colors.primary} />
        </View>

        <Text variant="h2" color={colors.text.primary} align="center" style={styles.title}>
          E-postanızı Doğrulayın
        </Text>
        
        <Text variant="body" color={colors.text.secondary} align="center" style={styles.description}>
          Kayıt işlemini tamamlamak için e-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Giriş Ekranına Git" 
            onPress={() => router.replace("/login")} 
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  }
});
