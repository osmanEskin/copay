import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Divider } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { DebtType } from '../../../components/PersonDebtCard';

const MOCK_TRANSACTIONS = [
  { id: 't1', title: 'Migros', date: '12 Temmuz', totalAmount: 1200, myShare: 600, payer: 'Sen Ödedin', status: 'owe_me' },
  { id: 't2', title: 'İnternet', date: '20 Temmuz', totalAmount: 360, myShare: 180, payer: 'Ahmet Ödedi', status: 'i_owe' },
];

export default function DebtDetailScreen() {
  const { personId } = useLocalSearchParams();

  // Mock Kişi Verisi
  const person = {
    name: 'Ahmet Yılmaz',
    initials: 'AH',
    netStatus: 'owe_me' as DebtType,
    netAmount: 540,
    openTxCount: 3,
    lastTxDate: '18 Temmuz',
  };

  const handleReminder = () => {
    Alert.alert(
      "Hatırlatma Gönder",
      `${person.name} kişisine ödeme hatırlatması gönderilsin mi?`,
      [
        { text: "İptal", style: "cancel" },
        { text: "Gönder", onPress: () => Alert.alert("Başarılı", "Hatırlatma gönderildi.") }
      ]
    );
  };

  const getStatusColor = () => {
    if (person.netStatus === 'owe_me') return colors.success;
    if (person.netStatus === 'i_owe') return colors.danger;
    return colors.text.secondary;
  };

  const getStatusText = () => {
    if (person.netStatus === 'owe_me') return `${person.name} sana borçlu.`;
    if (person.netStatus === 'i_owe') return `Sen ${person.name} kişisine borçlusun.`;
    return 'Hesaplar dengede.';
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Borç Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* NET DURUM KARTI */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Avatar initials={person.initials} size={64} />
            <View style={styles.statusInfo}>
              <Text variant="body" color={colors.text.secondary}>Net Durum</Text>
              <Text variant="h1" color={getStatusColor()}>
                {person.netStatus === 'owe_me' ? '+' : person.netStatus === 'i_owe' ? '-' : ''}₺{person.netAmount}
              </Text>
              <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="h3">{person.openTxCount}</Text>
              <Text variant="caption" color={colors.text.secondary}>Açık İşlem</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text variant="h3">₺{person.netAmount}</Text>
              <Text variant="caption" color={colors.text.secondary}>Toplam Tutar</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text variant="body" weight="semibold">{person.lastTxDate}</Text>
              <Text variant="caption" color={colors.text.secondary}>Son İşlem</Text>
            </View>
          </View>
        </Card>

        {/* AÇIK İŞLEMLER LİSTESİ */}
        <Text variant="h2" style={styles.sectionTitle}>Açık İşlemler</Text>
        
        <Card noPadding style={styles.txCard}>
          {MOCK_TRANSACTIONS.map((tx, index) => (
            <React.Fragment key={tx.id}>
              <TouchableOpacity 
                style={styles.txRow}
                activeOpacity={0.7}
                onPress={() => router.push(`/expenses/${tx.id}`)}
              >
                <View style={styles.txLeft}>
                  <View style={[styles.txIconBox, { backgroundColor: tx.status === 'owe_me' ? colors.success + '15' : colors.danger + '15' }]}>
                    <Ionicons 
                      name={tx.status === 'owe_me' ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={tx.status === 'owe_me' ? colors.success : colors.danger} 
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text variant="body" weight="semibold">{tx.title}</Text>
                    <Text variant="caption" color={colors.text.secondary}>{tx.date} • {tx.payer}</Text>
                  </View>
                </View>
                
                <View style={styles.txRight}>
                  <Text variant="body" weight="bold" color={tx.status === 'owe_me' ? colors.success : colors.danger}>
                    {tx.status === 'owe_me' ? '+' : '-'}₺{tx.myShare}
                  </Text>
                  <Text variant="caption" color={colors.text.secondary}>Toplam: ₺{tx.totalAmount}</Text>
                </View>
              </TouchableOpacity>
              {index < MOCK_TRANSACTIONS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ALT BUTONLAR */}
      <View style={styles.bottomBar}>
        {person.netStatus === 'owe_me' && (
          <Button 
            title="Hatırlatma Gönder" 
            variant="outline" 
            onPress={handleReminder} 
            style={{ marginBottom: spacing.md }}
          />
        )}
        <Button 
          title="Hesaplaş" 
          onPress={() => router.push(`/debts/${personId}/settle`)} 
        />
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
  statusCard: {
    marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  txCard: {
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  txInfo: {
    flex: 1,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.xxl,
  }
});
