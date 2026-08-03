import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Input, Screen, Text } from "../../components";
import { colors, spacing } from "../../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/home");
    }, 1000);
  };

  return (
    <Screen scrollable safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1" color={colors.primary} style={styles.title}>
            Copay
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            Hesabınıza giriş yaparak devam edin.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-posta Adresi"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <View style={styles.forgotPassword}>
            <Text
              variant="caption"
              color={colors.primary}
              weight="semibold"
              onPress={() => router.push("/forgot-password")}
            >
              Şifremi Unuttum
            </Text>
          </View>

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={!email || !password}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" align="center">
            Hesabınız yok mu?{" "}
            <Text
              variant="caption"
              color={colors.primary}
              weight="bold"
              onPress={() => router.replace("/register")}
            >
              Kayıt Ol
            </Text>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    minHeight: 500,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
