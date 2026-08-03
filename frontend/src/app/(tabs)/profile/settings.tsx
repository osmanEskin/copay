import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Chip, Divider } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function AppSettingsScreen() {
  const [theme, setTheme] = useState('Sistem');
  const [language, setLanguage] = useState('Türkçe');
  const [currency, setCurrency] = useState('₺ (TRY)');
  const [dateFormat, setDateFormat] = useState('24.07.2026');

  const SettingGroup = ({ title, options, selected, onSelect }: any) => (
    <View style={styles.settingGroup}>
      <Text variant="body" weight="semibold" style={styles.settingTitle}>{title}</Text>
      <View style={styles.chipsRow}>
        {options.map((opt: string) => (
          <Chip 
            key={opt} 
            label={opt} 
            active={selected === opt} 
            onPress={() => onSelect(opt)} 
          />
        ))}
      </View>
    </View>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Uygulama Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Card noPadding style={styles.card}>
          <SettingGroup 
            title="Görünüm Teması" 
            options={['Açık', 'Koyu', 'Sistem']} 
            selected={theme} 
            onSelect={setTheme} 
          />
          <Divider />
          <SettingGroup 
            title="Uygulama Dili" 
            options={['Türkçe', 'English']} 
            selected={language} 
            onSelect={setLanguage} 
          />
          <Divider />
          <SettingGroup 
            title="Para Birimi" 
            options={['₺ (TRY)', '$ (USD)', '€ (EUR)', '£ (GBP)']} 
            selected={currency} 
            onSelect={setCurrency} 
          />
          <Divider />
          <SettingGroup 
            title="Tarih Formatı" 
            options={['24.07.2026', '24 Tem 2026', '2026-07-24']} 
            selected={dateFormat} 
            onSelect={setDateFormat} 
          />
        </Card>

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
  card: {
    overflow: 'hidden',
  },
  settingGroup: {
    padding: spacing.lg,
  },
  settingTitle: {
    marginBottom: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  }
});
