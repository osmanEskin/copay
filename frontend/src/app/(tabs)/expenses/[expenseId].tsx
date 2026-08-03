import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Button, Avatar, Divider, Section } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams();

  // Mock Data
  const expense = {
    title: 'Migros',
    amount: 1250,
    date: '12 Temmuz 2026',
    category: 'Market',
    description: 'Haftalık mutfak alışverişi.',
    payer: { name: 'Sen', initials: 'SE' },
    participants: [
      { name: 'Sen', amount: 312.5 },
      { name: 'Ahmet', amount: 312.5 },
      { name: 'Mehmet', amount: 312.5 },
      { name: 'Ayşe', amount: 312.5 },
    ]
  };

  const handleDelete = () => {
    Alert.alert(
      "Harcamayı Sil",
      "Bu harcamayı silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => router.back() }
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
        <Text variant="h2" color={colors.text.primary}>Harcama Detayı</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* ANA KART */}
        <Card style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="cart" size={32} color={colors.primary} />
          </View>
          <Text variant="h1" align="center" style={styles.title}>{expense.title}</Text>
          <Text variant="h1" color={colors.primary} align="center" style={styles.amount}>
            ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>{expense.date}</Text>
            <Text variant="caption" color={colors.text.secondary}> • </Text>
            <Ionicons name="pricetag-outline" size={16} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>{expense.category}</Text>
          </View>

          {expense.description && (
            <View style={styles.descriptionBox}>
              <Text variant="body" color={colors.text.secondary} align="center">
                "{expense.description}"
              </Text>
            </View>
          )}
        </Card>

        {/* ÖDEYEN */}
        <Section title="Kim Ödedi?">
          <Card style={styles.payerCard}>
            <Avatar initials={expense.payer.initials} size={40} />
            <View style={styles.payerInfo}>
              <Text variant="body" weight="semibold">{expense.payer.name}</Text>
              <Text variant="caption" color={colors.text.secondary}>Tüm tutarı ödedi</Text>
            </View>
            <Text variant="body" weight="bold" color={colors.primary}>
              ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
          </Card>
        </Section>

        {/* KATILIMCILAR */}
        <Section title="Nasıl Bölüşüldü? (Eşit)">
          <Card noPadding style={styles.participantsCard}>
            {expense.participants.map((p, index) => (
              <React.Fragment key={p.name}>
                <View style={styles.participantRow}>
                  <Avatar initials={p.name.substring(0, 2).toUpperCase()} size={36} />
                  <Text variant="body" style={styles.participantName}>{p.name}</Text>
                  <Text variant="body" weight="semibold">
                    ₺{p.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {index < expense.participants.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Section>

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
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mainCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    marginLeft: 4,
    marginRight: 8,
  },
  descriptionBox: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  payerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  participantsCard: {
    overflow: 'hidden',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  participantName: {
    flex: 1,
    marginLeft: spacing.md,
  }
});
