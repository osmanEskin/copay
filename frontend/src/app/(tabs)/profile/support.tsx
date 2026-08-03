import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Divider } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SupportScreen() {
  
  const handlePress = (title: string) => {
    Alert.alert(title, `"${title}" sayfasına yönlendiriliyorsunuz (Simülasyon)`);
  };

  const SupportRow = ({ icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <TouchableOpacity style={styles.row} onPress={() => handlePress(title)} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="body" weight="medium">{title}</Text>
        {subtitle && <Text variant="caption" color={colors.text.secondary}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.infoBox}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
          <Text variant="body" align="center" style={{ marginTop: spacing.md }}>
            Size nasıl yardımcı olabiliriz? Lütfen aşağıdaki seçeneklerden birini seçin.
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <SupportRow icon="library-outline" title="Yardım Merkezi" subtitle="Kullanım kılavuzları ve makaleler" />
          <Divider style={styles.divider} />
          <SupportRow icon="help-circle-outline" title="Sıkça Sorulan Sorular" subtitle="En çok merak edilenler" />
          <Divider style={styles.divider} />
          <SupportRow icon="paper-plane-outline" title="Geri Bildirim Gönder" subtitle="Fikirlerinizi bizimle paylaşın" />
          <Divider style={styles.divider} />
          <SupportRow icon="bug-outline" title="Hata Bildir" subtitle="Uygulamada bir sorun mu var?" />
        </View>

      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  infoBox: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    marginHorizontal: spacing.lg,
  }
});
