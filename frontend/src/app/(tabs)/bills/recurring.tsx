import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Divider } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

const MOCK_RECURRING = [
  { id: '20', title: 'Elektrik', interval: 'Her Ay', day: '28', status: 'Aktif', amount: 1240, icon: 'flash' as const },
  { id: '21', title: 'İnternet', interval: 'Her Ay', day: '30', status: 'Aktif', amount: 350, icon: 'wifi' as const },
  { id: '22', title: 'Aidat', interval: 'Her Ay', day: '05', status: 'Pasif', amount: 1500, icon: 'home' as const },
];

export default function RecurringBillsScreen() {
  
  const handleAction = (title: string) => {
    Alert.alert(
      `${title} Ayarları`,
      "Bu tekrarlayan fatura için ne yapmak istersiniz?",
      [
        { text: "Düzenle", onPress: () => {} },
        { text: "Pasif Yap", style: "destructive", onPress: () => {} },
        { text: "Sil", style: "destructive", onPress: () => {} },
        { text: "İptal", style: "cancel" }
      ]
    );
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Otomatik Faturalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text variant="caption" color={colors.primary} style={{ marginLeft: spacing.sm, flex: 1 }}>
          Sistemin otomatik oluşturduğu periyodik faturalar.
        </Text>
      </View>

      {/* LISTE */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {MOCK_RECURRING.map((bill) => (
          <Card key={bill.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: bill.status === 'Aktif' ? colors.primary + '15' : colors.text.secondary + '15' }]}>
                <Ionicons name={bill.icon} size={24} color={bill.status === 'Aktif' ? colors.primary : colors.text.secondary} />
              </View>
              <View style={styles.titleSection}>
                <Text variant="body" weight="semibold">{bill.title}</Text>
                <Text variant="caption" color={colors.text.secondary}>{bill.interval} • Ayın {bill.day}. günü</Text>
              </View>
              <View style={styles.amountSection}>
                <Text variant="body" weight="bold">~₺{bill.amount}</Text>
                <Text variant="caption" color={bill.status === 'Aktif' ? colors.success : colors.danger}>
                  {bill.status}
                </Text>
              </View>
            </View>

            <Divider style={{ marginVertical: spacing.md }} />

            <View style={styles.cardBottom}>
              <Button 
                title="Yönet" 
                variant="secondary" 
                onPress={() => handleAction(bill.title)}
                style={styles.actionBtn}
              />
            </View>
          </Card>
        ))}
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: spacing.xl,
  }
});
