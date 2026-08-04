import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Card, Avatar, Button, Divider, Loading } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getPersonDebt, type PersonDebtDetail } from '../../../services/debts';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DebtDetailScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const [person, setPerson] = useState<PersonDebtDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      getPersonDebt(personId).then((detail) => {
        setPerson(detail);
        setIsLoading(false);
      });
    }, [personId])
  );

  if (isLoading || !person) {
    return (
      <Screen safeArea backgroundColor={colors.background}>
        <Loading />
      </Screen>
    );
  }

  const getStatusColor = () => {
    if (person.type === 'owe_me') return colors.success;
    if (person.type === 'i_owe') return colors.danger;
    return colors.text.secondary;
  };

  const getStatusText = () => {
    if (person.type === 'owe_me') return `${person.personName} sana borçlu.`;
    if (person.type === 'i_owe') return `Sen ${person.personName} kişisine borçlusun.`;
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
            <Avatar initials={initialsOf(person.personName)} size={64} />
            <View style={styles.statusInfo}>
              <Text variant="body" color={colors.text.secondary}>Net Durum</Text>
              <Text variant="h1" color={getStatusColor()}>
                {person.type === 'owe_me' ? '+' : person.type === 'i_owe' ? '-' : ''}₺{person.amount.toLocaleString('tr-TR')}
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
              <Text variant="h3">₺{person.amount.toLocaleString('tr-TR')}</Text>
              <Text variant="caption" color={colors.text.secondary}>Toplam Tutar</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text variant="body" weight="semibold">
                {person.lastDate ? new Date(person.lastDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '-'}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>Son İşlem</Text>
            </View>
          </View>
        </Card>

        {/* AÇIK İŞLEMLER LİSTESİ */}
        <Text variant="h2" style={styles.sectionTitle}>İşlemler</Text>

        {person.transactions.length === 0 ? (
          <Text variant="body" color={colors.text.secondary} align="center" style={{ marginTop: spacing.md }}>
            Aranızda henüz bir işlem yok.
          </Text>
        ) : (
          <Card noPadding style={styles.txCard}>
            {person.transactions.map((tx, index) => (
              <React.Fragment key={tx.id}>
                <TouchableOpacity
                  style={styles.txRow}
                  activeOpacity={0.7}
                  onPress={() => router.push(tx.kind === 'expense' ? `/expenses/${tx.id}` : `/bills/${tx.id}`)}
                >
                  <View style={styles.txLeft}>
                    <View style={[styles.txIconBox, { backgroundColor: tx.direction === 'owe_me' ? colors.success + '15' : colors.danger + '15' }]}>
                      <Ionicons
                        name={tx.direction === 'owe_me' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={tx.direction === 'owe_me' ? colors.success : colors.danger}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text variant="body" weight="semibold">{tx.title}</Text>
                      <Text variant="caption" color={colors.text.secondary}>
                        {new Date(tx.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} • {tx.direction === 'owe_me' ? 'Sen Ödedin' : `${person.personName} Ödedi`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    <Text variant="body" weight="bold" color={tx.direction === 'owe_me' ? colors.success : colors.danger}>
                      {tx.direction === 'owe_me' ? '+' : '-'}₺{tx.shareAmount.toLocaleString('tr-TR')}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>Toplam: ₺{tx.totalAmount.toLocaleString('tr-TR')}</Text>
                  </View>
                </TouchableOpacity>
                {index < person.transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ALT BUTON */}
      {person.type !== 'settled' && (
        <View style={styles.bottomBar}>
          <Button
            title="Hesaplaş"
            onPress={() => router.push(`/debts/${personId}/settle`)}
          />
        </View>
      )}

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
