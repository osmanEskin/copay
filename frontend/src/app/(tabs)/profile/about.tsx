import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Screen, Text } from "../../../components";
import { colors, spacing } from "../../../theme";

export default function AboutScreen() {
  const handlePress = (title: string) => {
    Alert.alert(title, `"${title}" metni yakında eklenecektir.`);
  };

  const AboutRow = ({ title }: { title: string }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => handlePress(title)}
      activeOpacity={0.7}
    >
      <Text variant="body" weight="medium">
        {title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.text.secondary}
      />
    </TouchableOpacity>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>
          Hakkında
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="wallet" size={48} color={colors.text.inverse} />
          </View>
          <Text variant="h1" style={styles.appName}>
            Copay
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            Sürüm 1.0.0 (Build 42)
          </Text>
          <Text
            variant="caption"
            color={colors.text.secondary}
            style={{ marginTop: spacing.xs }}
          >
            © 2026 Copay Inc. Tüm hakları saklıdır.
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <AboutRow title="Gizlilik Politikası" />
          <Divider style={styles.divider} />
          <AboutRow title="Kullanım Koşulları" />
          <Divider style={styles.divider} />
          <AboutRow title="Açık Kaynak Lisansları" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  appName: {
    marginBottom: spacing.xs,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    marginHorizontal: spacing.lg,
  },
});
