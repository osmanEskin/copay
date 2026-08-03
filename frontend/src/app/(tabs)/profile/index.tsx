import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Avatar, Divider, Button } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { confirmAsync } from '../../../utils/confirm';
import { getCurrentUser, logout } from '../../../services/auth';

// Yardımcı Bileşen: Menü Satırı
const MenuRow = ({ 
  icon, 
  title, 
  route, 
  color = colors.text.primary 
}: { 
  icon: keyof typeof Ionicons.glyphMap, 
  title: string, 
  route?: string,
  color?: string
}) => (
  <TouchableOpacity 
    style={styles.menuRow} 
    onPress={() => route ? router.push(route as any) : null}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text variant="body" weight="medium" style={{ color, marginLeft: spacing.md }}>
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
  </TouchableOpacity>
);

export default function ProfileIndexScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      getCurrentUser().then((user) => {
        if (user) {
          setName(user.name);
          setEmail(user.email);
        }
      });
    }, [])
  );

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const handleLogout = async () => {
    const confirmed = await confirmAsync(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      "Çıkış Yap"
    );
    if (!confirmed) {
      return;
    }
    await logout();
    router.replace("/login");
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      <View style={styles.header}>
        <Text variant="h1" color={colors.text.primary}>Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* KULLANICI BİLGİLERİ */}
        <View style={styles.userInfoSection}>
          <Avatar initials={initials} size={80} style={styles.avatar} />
          <Text variant="h2">{name}</Text>
          <Text variant="body" color={colors.text.secondary}>{email}</Text>
          <Text variant="caption" color={colors.text.secondary} style={styles.joinDate}>
            Katılım: Ocak 2026
          </Text>
        </View>

        {/* İSTATİSTİK KARTI */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h2" color={colors.primary} numberOfLines={1} adjustsFontSizeToFit>142</Text>
              <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1} adjustsFontSizeToFit>Harcama</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h2" color={colors.primary} numberOfLines={1} adjustsFontSizeToFit>12</Text>
              <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1} adjustsFontSizeToFit>Fatura</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h2" color={colors.primary} numberOfLines={1} adjustsFontSizeToFit>₺12.4K</Text>
              <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1} adjustsFontSizeToFit>Ödenen</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h2" color={colors.primary} numberOfLines={1} adjustsFontSizeToFit>3</Text>
              <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1} adjustsFontSizeToFit>Grup</Text>
            </View>
          </View>
        </Card>

        {/* MENÜ LİSTESİ */}
        <View style={styles.menuContainer}>
          <Text variant="caption" weight="bold" color={colors.text.secondary} style={styles.menuHeader}>
            AYARLAR
          </Text>
          <MenuRow icon="person-outline" title="Hesap Bilgileri" route="/profile/account" />
          <Divider style={styles.divider} />
          <MenuRow icon="people-outline" title="Grup Yönetimi" route="/profile/group" />
          <Divider style={styles.divider} />
          <MenuRow icon="notifications-outline" title="Bildirim Ayarları" route="/profile/notifications" />
          <Divider style={styles.divider} />
          <MenuRow icon="settings-outline" title="Uygulama Ayarları" route="/profile/settings" />
          <Divider style={styles.divider} />
          <MenuRow icon="shield-checkmark-outline" title="Güvenlik" route="/profile/security" />
        </View>

        <View style={styles.menuContainer}>
          <Text variant="caption" weight="bold" color={colors.text.secondary} style={styles.menuHeader}>
            DİĞER
          </Text>
          <MenuRow icon="help-buoy-outline" title="Destek" route="/profile/support" />
          <Divider style={styles.divider} />
          <MenuRow icon="information-circle-outline" title="Hakkında" route="/profile/about" />
        </View>

        {/* ÇIKIŞ BUTONU */}
        <Button 
          title="Çıkış Yap" 
          variant="outline" 
          onPress={handleLogout} 
          style={styles.logoutBtn}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  joinDate: {
    marginTop: spacing.xs,
  },
  statsCard: {
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    marginHorizontal: spacing.lg,
  },
  logoutBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  }
});
