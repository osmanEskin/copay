import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Chip, Divider, Avatar } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

const MOCK_SETTLEMENTS = [
  { id: '1', person: 'Mehmet', initials: 'ME', date: '22 Tem', amount: 420, type: 'paid', desc: 'ödendi' },
  { id: '2', person: 'Ahmet', initials: 'AH', date: '18 Tem', amount: 150, type: 'received', desc: 'alındı' },
  { id: '3', person: 'Ayşe', initials: 'AY', date: '10 Haz', amount: 200, type: 'paid', desc: 'ödendi' },
];

export default function DebtHistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('Bu Ay');
  const filters = ['Bu Ay', 'Geçen Ay', 'Bu Yıl'];

  const filteredHistory = MOCK_SETTLEMENTS.filter(tx => {
    if (activeFilter === 'Bu Ay') return tx.date.includes('Tem');
    if (activeFilter === 'Geçen Ay') return tx.date.includes('Haz');
    return true; // Bu Yıl için hepsi gelsin (Mock)
  });

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>İşlem Geçmişi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* FILTERS */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {filters.map(f => (
            <Chip 
              key={f} 
              label={f} 
              active={activeFilter === f} 
              onPress={() => setActiveFilter(f)} 
            />
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filteredHistory.length > 0 ? (
          <Card noPadding style={styles.txCard}>
            {filteredHistory.map((tx, index) => (
              <React.Fragment key={tx.id}>
                <View style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Avatar initials={tx.initials} size={40} />
                    <View style={styles.txInfo}>
                      <Text variant="body" weight="semibold">
                        {tx.type === 'paid' ? `${tx.person}'e` : `${tx.person}'den`}
                      </Text>
                      <Text variant="caption" color={colors.text.secondary}>{tx.date}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.txRight}>
                    <Text variant="body" weight="bold" color={tx.type === 'paid' ? colors.text.primary : colors.success}>
                      {tx.type === 'paid' ? '-' : '+'}₺{tx.amount}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>{tx.desc}</Text>
                  </View>
                </View>
                {index < filteredHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        ) : (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.text.secondary} align="center">
              Bu döneme ait işlem geçmişi bulunamadı.
            </Text>
          </View>
        )}
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
  chipsContainer: {
    marginBottom: spacing.lg,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  txInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  }
});
