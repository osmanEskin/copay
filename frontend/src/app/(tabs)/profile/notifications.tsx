import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Divider } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import {
  getNotificationPreferences,
  NotificationPreferences,
  updateNotificationPreferences,
} from '../../../services/auth';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationPreferences | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    getNotificationPreferences().then(setSettings);
  }, []);

  const toggleSwitch = (key: keyof NotificationPreferences) => {
    if (!settings) {
      return;
    }
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setErrorMessage(undefined);
    updateNotificationPreferences(next).catch((error) => {
      setSettings(settings);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    });
  };

  const SettingRow = ({ title, field }: { title: string, field: keyof NotificationPreferences }) => (
    <View style={styles.settingRow}>
      <Text variant="body" weight="medium">{title}</Text>
      <Switch
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        onValueChange={() => toggleSwitch(field)}
        value={settings ? settings[field] : false}
        disabled={!settings}
      />
    </View>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Bildirim Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>
          Hangi durumlarda bildirim almak istediğinizi seçin.
        </Text>
        {errorMessage && (
          <Text variant="caption" color={colors.danger} style={styles.infoText}>
            {errorMessage}
          </Text>
        )}

        <Card noPadding style={styles.card}>
          <SettingRow title="Yeni Harcama Eklendiğinde" field="notifyNewExpense" />
          <Divider />
          <SettingRow title="Yeni Fatura Eklendiğinde" field="notifyNewBill" />
          <Divider />
          <SettingRow title="Son Ödeme Tarihi Yaklaştığında" field="notifyUpcomingBills" />
          <Divider />
          <SettingRow title="Borç Durumu Güncellendiğinde" field="notifyDebtUpdates" />
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
