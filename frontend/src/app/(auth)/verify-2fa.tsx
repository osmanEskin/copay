import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Input, Button, Text } from "../../components";
import { colors, spacing } from "../../theme";
import { ApiError } from "../../services/api";
import { verifyTwoFactor } from "../../services/auth";

export default function VerifyTwoFactorScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleVerify = async () => {
    setErrorMessage(undefined);
    setIsLoading(true);
    try {
      await verifyTwoFactor(email, code);
      router.replace("/home");
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
            Doğrulama Kodu
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {`${email} adresine gönderdiğimiz kodu girin.`}
          </Text>
        </View>

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

          <Button
            title="Giriş Yap"
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={!code}
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
