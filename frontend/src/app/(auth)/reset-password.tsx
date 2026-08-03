import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Input, Button, Text } from "../../components";
import { colors, spacing } from "../../theme";
import { ApiError } from "../../services/api";
import { resetPassword } from "../../services/auth";

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleReset = async () => {
    setErrorMessage(undefined);
    setIsLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setIsDone(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Bir şeyler ters gitti, lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1" color={colors.primary} style={styles.title}>
            Yeni Şifre Belirle
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {isDone
              ? "Şifreniz başarıyla güncellendi."
              : `${email} adresine gönderdiğimiz kodu ve yeni şifrenizi girin.`}
          </Text>
        </View>

        {!isDone && (
          <View style={styles.form}>
            <Input
              label="Doğrulama Kodu"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              error={errorMessage}
            />

            <Input
              label="Yeni Şifre"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Button
              title="Şifreyi Güncelle"
              onPress={handleReset}
              isLoading={isLoading}
              disabled={!code || !newPassword}
            />
          </View>
        )}

        {isDone && (
          <Button title="Giriş Ekranına Dön" onPress={() => router.replace("/login")} />
        )}
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
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
});
