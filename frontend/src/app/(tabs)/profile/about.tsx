import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Modal, Screen, Text } from "../../../components";
import { colors, spacing } from "../../../theme";

const PRIVACY_POLICY = `Copay, grup içi harcama ve fatura paylaşımını kolaylaştırmak için minimum düzeyde veri toplar.

Ne topluyoruz: Adınız, e-posta adresiniz, isteğe bağlı kullanıcı adı ve telefon numaranız; oluşturduğunuz veya üyesi olduğunuz gruplar, girdiğiniz harcama/fatura kayıtları ve hesaplaşma geçmişiniz.

Nasıl kullanıyoruz: Bu bilgiler yalnızca uygulamanın temel işlevi olan grup içi harcama takibi ve borç hesaplaması için kullanılır.

Kimlerle paylaşıyoruz: Şifre sıfırlama, iki aşamalı doğrulama ve destek e-postaları Brevo üzerinden gönderilir. Verileriniz Neon (PostgreSQL) altyapısında saklanır. Verileriniz reklam amacıyla üçüncü taraflara satılmaz veya paylaşılmaz.

Kontrolünüz: Hesap Bilgileri sayfasından bilgilerinizi güncelleyebilir, Güvenlik sayfasından hesabınızı kalıcı olarak silebilirsiniz. Paylaşılan grup geçmişiniz (harcama, fatura veya hesaplaşma) varsa, diğer üyelerin kayıtlarının bozulmaması için önce bu kayıtların temizlenmesi istenir.`;

const TERMS_OF_USE = `Copay, aranızdaki grup harcamalarını takip etmenize ve kimin kime ne kadar borçlu olduğunu hesaplamanıza yardımcı olan bir araçtır. Uygulama gerçek para transferi yapmaz; hesaplaşmaları siz kendi aranızda (nakit, banka transferi vb.) gerçekleştirir, uygulamaya sadece "ödendi" olarak işlersiniz.

Girdiğiniz harcama ve fatura tutarlarının doğruluğundan siz sorumlusunuz. Hesabınızın güvenliğinden (şifrenizin gizliliği, e-posta erişiminiz) siz sorumlusunuz.

Uygulama "olduğu gibi" sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez.`;

const OSS_LICENSES: { name: string; license: string }[] = [
  { name: "React / React Native", license: "MIT" },
  { name: "Expo (SDK)", license: "MIT" },
  { name: "React Native Web", license: "MIT" },
  { name: "React Navigation", license: "MIT" },
  { name: "Hono", license: "MIT" },
  { name: "Drizzle ORM", license: "Apache-2.0" },
  { name: "Zod", license: "MIT" },
  { name: "node-postgres (pg)", license: "MIT" },
  { name: "bcryptjs", license: "BSD-3-Clause" },
];

export default function AboutScreen() {
  const [modalKey, setModalKey] = useState<"privacy" | "terms" | "licenses" | null>(null);

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const AboutRow = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
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

  const modalTitle =
    modalKey === "privacy"
      ? "Gizlilik Politikası"
      : modalKey === "terms"
      ? "Kullanım Koşulları"
      : modalKey === "licenses"
      ? "Açık Kaynak Lisansları"
      : "";

  return (
    <Screen safeArea backgroundColor={colors.background}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/profile')}
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
            Sürüm {version}
          </Text>
          <Text
            variant="caption"
            color={colors.text.secondary}
            style={{ marginTop: spacing.xs }}
          >
            © 2026 Copay
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <AboutRow title="Gizlilik Politikası" onPress={() => setModalKey("privacy")} />
          <Divider style={styles.divider} />
          <AboutRow title="Kullanım Koşulları" onPress={() => setModalKey("terms")} />
          <Divider style={styles.divider} />
          <AboutRow title="Açık Kaynak Lisansları" onPress={() => setModalKey("licenses")} />
        </View>
      </ScrollView>

      <Modal
        visible={modalKey !== null}
        title={modalTitle}
        onClose={() => setModalKey(null)}
      >
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {modalKey === "licenses" ? (
            <View>
              {OSS_LICENSES.map((item, index) => (
                <View key={item.name}>
                  <View style={styles.licenseRow}>
                    <Text variant="body" weight="medium">{item.name}</Text>
                    <Text variant="caption" color={colors.text.secondary}>{item.license}</Text>
                  </View>
                  {index < OSS_LICENSES.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          ) : (
            <Text variant="body" color={colors.text.secondary} style={styles.modalText}>
              {modalKey === "privacy" ? PRIVACY_POLICY : TERMS_OF_USE}
            </Text>
          )}
        </ScrollView>
      </Modal>
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
  modalScroll: {
    maxHeight: 400,
  },
  modalText: {
    lineHeight: 20,
  },
  licenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
