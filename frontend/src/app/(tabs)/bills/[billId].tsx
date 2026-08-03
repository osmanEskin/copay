import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Button, Avatar, Divider, Section, Badge } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { BillStatus } from '../../../components/BillCard';

export default function BillDetailScreen() {
  const { billId } = useLocalSearchParams();
  const [isPaid, setIsPaid] = useState(false);

  // Mock Veri
  const bill = {
    title: 'Elektrik',
    amount: 1240,
    dueDate: '28 Temmuz 2026',
    payer: 'Mehmet',
    status: (isPaid ? 'Ödendi' : 'Bekliyor') as BillStatus,
    participants: ['Ahmet', 'Mehmet', 'Ayşe']
  };

  const handleDelete = () => {
    Alert.alert(
      "Faturayı Sil",
      "Bu faturayı tamamen silmek istediğinize emin misiniz?",
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
        <Text variant="h2" color={colors.text.primary}>Fatura Detayı</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push(`/bills/${billId}/edit`)}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* ANA BİLGİ KARTI */}
        <Card style={styles.mainCard}>
          <View style={[styles.iconCircle, { backgroundColor: isPaid ? colors.success + '15' : colors.primary + '15' }]}>
            <Ionicons name="flash" size={32} color={isPaid ? colors.success : colors.primary} />
          </View>
          <Text variant="h1" align="center" style={styles.title}>{bill.title}</Text>
          <Text variant="h1" color={isPaid ? colors.success : colors.primary} align="center" style={styles.amount}>
            ₺{bill.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Text>
          
          <Badge 
            label={bill.status} 
            variant={isPaid ? 'success' : 'default'} 
            style={{ marginBottom: spacing.md }}
          />

          <View style={styles.infoRowContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.text.secondary} />
              <Text variant="caption" color={colors.text.secondary} style={styles.infoText}>Son Ödeme: {bill.dueDate}</Text>
            </View>
          </View>
        </Card>

        {/* SORUMLU KİŞİ */}
        <Section title="Sorumlu Kişi">
          <Card style={styles.payerCard}>
            <Avatar initials={bill.payer.substring(0, 2).toUpperCase()} size={40} />
            <View style={styles.payerInfo}>
              <Text variant="body" weight="semibold">{bill.payer}</Text>
              <Text variant="caption" color={colors.text.secondary}>Ödemeyi yapacak olan kişi</Text>
            </View>
          </Card>
        </Section>

        {/* KATILIMCILAR */}
        <Section title="Katılımcılar">
          <Card noPadding style={styles.participantsCard}>
            {bill.participants.map((name, index) => (
              <React.Fragment key={name}>
                <View style={styles.participantRow}>
                  <Avatar initials={name.substring(0, 2).toUpperCase()} size={36} />
                  <Text variant="body" style={styles.participantName}>{name}</Text>
                </View>
                {index < bill.participants.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Section>

        {/* ÖDEME DURUMU KARTI */}
        <Section title="Ödeme Durumu">
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text variant="body" weight="semibold">Ödendi mi?</Text>
              <Text variant="body" color={isPaid ? colors.success : colors.danger} weight="bold">
                {isPaid ? 'Evet' : 'Hayır'}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              {!isPaid && (
                <Button 
                  title="Ödendi Olarak İşaretle" 
                  onPress={() => setIsPaid(true)} 
                  style={styles.actionBtn}
                />
              )}
              <Button 
                title="Faturayı Sil" 
                variant="outline" 
                onPress={handleDelete} 
                style={styles.actionBtn}
              />
            </View>
          </Card>
        </Section>

        <View style={{ height: spacing.xxl }} />
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  infoRowContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
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
  },
  statusCard: {
    // marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionBtn: {
    width: '100%',
  }
});
