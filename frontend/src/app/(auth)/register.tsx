import React, { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen, Input, Button, Text } from "../../components";
import { colors, spacing } from "../../theme";
import { ApiError } from "../../services/api";
import { register } from "../../services/auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(name, email, password);
      router.push("/verify-email");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Kayıt oluşturulamadı, lütfen tekrar deneyin.";
      Alert.alert("Kayıt Başarısız", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen scrollable safeArea backgroundColor={colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1" color={colors.primary} style={styles.title}>
            Hesap Oluştur
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            Copay'in avantajlarından yararlanmak için hemen kayıt olun.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Ad Soyad"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            autoCapitalize="words"
          />

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
          
          <Button 
            title="Kayıt Ol" 
            onPress={handleRegister} 
            isLoading={isLoading} 
            disabled={!email || !password || !name}
          />
        </View>
        
        <View style={styles.footer}>
          <Text variant="caption" align="center">
            Zaten hesabınız var mı?{' '}
            <Text 
              variant="caption" 
              color={colors.primary} 
              weight="bold"
              onPress={() => router.push("/login")}
            >
              Giriş Yap
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
    justifyContent: 'center',
    minHeight: 600,
  },
  header: {
    marginBottom: spacing.xxl,
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
