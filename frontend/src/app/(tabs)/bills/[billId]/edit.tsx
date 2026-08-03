import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Input, Button, Chip, CurrencyInput } from '../../../../components';
import { colors, spacing, radius } from '../../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditBillScreen() {
  const { billId } = useLocalSearchParams();

  // Temel Bilgiler (Mock Prefilled)
  const [title, setTitle] = useState('Elektrik');
  const [category, setCategory] = useState('Fatura');
  const [description, setDescription] = useState('Haziran ayı tüketimi.');
  
  // Finansal Bilgiler
  const [amount, setAmount] = useState('1240');
  
  // Tekrarlama
  const recurrenceOptions = ['Tek Sefer', 'Haftalık', 'Aylık', '3 Aylık', '6 Aylık', 'Yıllık'];
  const [recurrence, setRecurrence] = useState('Aylık');
  
  // Ödeyecek Kişi
  const payerOptions = ['Sen', 'Ahmet', 'Mehmet', 'Ayşe'];
  const [payer, setPayer] = useState('Mehmet');

  // Katılımcılar
  const [participants, setParticipants] = useState<string[]>(['Ahmet', 'Mehmet', 'Ayşe']);
  
  // Bölüştürme & Hatırlatma
  const splitOptions = ['Eşit', 'Yüzdelik', 'Özel Tutar'];
  const [splitMethod, setSplitMethod] = useState('Eşit');

  const reminderOptions = ['Yok', '1 gün önce', '3 gün önce', '1 hafta önce'];
  const [reminder, setReminder] = useState('3 gün önce');

  const categories = ['Fatura', 'Abonelik', 'Kira', 'Aidat', 'Diğer'];

  const toggleParticipant = (person: string) => {
    if (participants.includes(person)) {
      setParticipants(prev => prev.filter(p => p !== person));
    } else {
      setParticipants(prev => [...prev, person]);
    }
  };

  const handleSave = () => {
    setTimeout(() => {
      router.back();
    }, 500);
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Faturayı Düzenle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* TEMEL BİLGİLER */}
        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Temel Bilgiler</Text>
          <Input 
            label="Fatura Adı" 
            placeholder="Örn: Elektrik, İnternet" 
            value={title} 
            onChangeText={setTitle} 
          />
          
          <Text variant="body" weight="medium" style={styles.subTitle}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRowHorizontal}>
            {categories.map(c => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>
        </View>

        {/* FİNANSAL BİLGİLER & TARİH */}
        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Finansal Bilgiler</Text>
          <CurrencyInput label="Tutar" value={amount} onChangeText={setAmount} />

          <View style={styles.dateSelectorRow}>
            <View style={styles.dateSelector}>
              <Text variant="caption" color={colors.text.secondary}>Fatura Tarihi</Text>
              <View style={styles.dateInner}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text variant="body" style={{ marginLeft: spacing.xs }}>15 Tem 2026</Text>
              </View>
            </View>
            <View style={styles.dateSelector}>
              <Text variant="caption" color={colors.text.secondary}>Son Ödeme</Text>
              <View style={styles.dateInner}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text variant="body" style={{ marginLeft: spacing.xs }}>28 Tem 2026</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEKRARLAMA */}
        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Tekrarlama</Text>
          <View style={styles.chipsRow}>
            {recurrenceOptions.map(r => (
              <Chip key={r} label={r} active={recurrence === r} onPress={() => setRecurrence(r)} />
            ))}
          </View>
        </View>

        {/* KİŞİLER & BÖLÜŞTÜRME */}
        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Kişiler</Text>
          
          <Text variant="body" weight="medium" style={styles.subTitle}>Ödeyecek Kişi (Sorumlu)</Text>
          <View style={styles.chipsRow}>
            {payerOptions.map(p => (
              <Chip key={p} label={p} active={payer === p} onPress={() => setPayer(p)} />
            ))}
          </View>

          <Text variant="body" weight="medium" style={[styles.subTitle, { marginTop: spacing.md }]}>Katılımcılar</Text>
          <View style={styles.chipsRow}>
            {payerOptions.map(p => (
              <Chip key={p} label={p} active={participants.includes(p)} onPress={() => toggleParticipant(p)} />
            ))}
          </View>

          <Text variant="body" weight="medium" style={[styles.subTitle, { marginTop: spacing.md }]}>Bölüştürme Yöntemi</Text>
          <View style={styles.chipsRow}>
            {splitOptions.map(s => (
              <Chip key={s} label={s} active={splitMethod === s} onPress={() => setSplitMethod(s)} />
            ))}
          </View>
        </View>

        {/* EK DETAYLAR */}
        <View style={styles.section}>
          <Text variant="body" weight="bold" style={styles.sectionTitle}>Ek Detaylar</Text>
          
          <Text variant="body" weight="medium" style={styles.subTitle}>Hatırlatma</Text>
          <View style={styles.chipsRow}>
            {reminderOptions.map(r => (
              <Chip key={r} label={r} active={reminder === r} onPress={() => setReminder(r)} />
            ))}
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Input label="Not" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* KAYDET BUTONU - FIXED BOTTOM */}
      <View style={styles.bottomBar}>
        <Button title="Değişiklikleri Kaydet" onPress={handleSave} disabled={!title || !amount} />
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
    marginBottom: spacing.lg,
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
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: 18,
    color: colors.primary,
  },
  subTitle: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipsRowHorizontal: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  dateSelector: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
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
