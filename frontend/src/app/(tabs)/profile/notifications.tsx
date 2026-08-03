import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Divider } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    newExpense: true,
    newBill: true,
    dueDate: true,
    debtUpdate: false,
    reminders: true,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ title, field }: { title: string, field: keyof typeof settings }) => (
    <View style={styles.settingRow}>
      <Text variant="body" weight="medium">{title}</Text>
      <Switch
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        onValueChange={() => toggleSwitch(field)}
        value={settings[field]}
      />
    </View>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Bildirim Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
          Hangi durumlarda anlık bildirim (push notification) almak istediğinizi seçin.
        </Text>

        <Card noPadding style={styles.card}>
          <SettingRow title="Yeni Harcama Eklendiğinde" field="newExpense" />
          <Divider />
          <SettingRow title="Yeni Fatura Eklendiğinde" field="newBill" />
          <Divider />
          <SettingRow title="Son Ödeme Tarihi Yaklaştığında" field="dueDate" />
          <Divider />
          <SettingRow title="Borç Durumu Güncellendiğinde" field="debtUpdate" />
          <Divider />
          <SettingRow title="Özel Hatırlatmalar" field="reminders" />
        </Card>
      </View>

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
  infoText: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  }
});
