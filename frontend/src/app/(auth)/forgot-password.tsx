import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, Input, Button, Text } from "../../components";
import { colors, spacing } from "../../theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendResetLink = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <Screen scrollable safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1" color={colors.primary} style={styles.title}>
            Şifremi Unuttum
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {isSent 
              ? "E-posta adresinize bir şifre sıfırlama bağlantısı gönderdik."
              : "Hesabınıza bağlı e-posta adresini girin, size sıfırlama bağlantısı gönderelim."
            }
          </Text>
        </View>

        <View style={styles.form}>
          {!isSent && (
            <Input
              label="E-posta Adresi"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          
          <Button 
            title={isSent ? "Giriş Ekranına Dön" : "Sıfırlama Bağlantısı Gönder"} 
            onPress={() => isSent ? router.replace("/login") : handleSendResetLink()} 
            isLoading={isLoading} 
            disabled={!isSent && !email}
          />
        </View>
        
        {!isSent && (
          <View style={styles.footer}>
            <Text 
              variant="caption" 
              color={colors.primary} 
              weight="bold"
              align="center"
              onPress={() => router.back()}
            >
              Geri Dön
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: 500,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
