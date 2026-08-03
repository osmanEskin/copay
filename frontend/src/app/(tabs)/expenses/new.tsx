import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Input, Button, Chip, CurrencyInput } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function NewExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [category, setCategory] = useState('Market');
  const [payer, setPayer] = useState('Sen');
  const [splitMethod, setSplitMethod] = useState('Eşit');
  
  const categories = ['Market', 'Restoran', 'Abonelik', 'Ulaşım', 'Kafe', 'Diğer'];
  const members = ['Sen', 'Ahmet', 'Mehmet', 'Ayşe'];
  const splitMethods = ['Eşit', 'Yüzdelik', 'Tutar'];

  const handleSave = () => {
    // Burada API kaydetme işlemi yapılacak
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
        <Text variant="h2" color={colors.text.primary}>Yeni Harcama</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* TEMEL BİLGİLER */}
        <View style={styles.section}>
          <Input 
            label="Başlık" 
            placeholder="Ne için harcadınız?" 
            value={title} 
            onChangeText={setTitle} 
          />
          
          <CurrencyInput 
            label="Tutar" 
            value={amount} 
            onChangeText={setAmount} 
          />

          <View style={styles.dateSelector}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text variant="body" style={{ marginLeft: spacing.sm }}>Bugün, 24 Temmuz 2026</Text>
          </View>
        </View>

        {/* KATEGORİ */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kategori</Text>
          <View style={styles.chipsRow}>
            {categories.map(c => (
              <Chip 
                key={c} 
                label={c} 
                active={category === c} 
                onPress={() => setCategory(c)} 
              />
            ))}
          </View>
        </View>

        {/* KİM ÖDEDİ? */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Kim Ödedi?</Text>
          <View style={styles.chipsRow}>
            {members.map(m => (
              <Chip 
                key={m} 
                label={m} 
                active={payer === m} 
                onPress={() => setPayer(m)} 
              />
            ))}
          </View>
        </View>

        {/* BÖLÜŞTÜRME YÖNTEMİ & KİMLER PAYLAŞACAK */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Nasıl Bölüşülecek?</Text>
          <View style={styles.chipsRow}>
            {splitMethods.map(m => (
              <Chip 
                key={m} 
                label={m} 
                active={splitMethod === m} 
                onPress={() => setSplitMethod(m)} 
              />
            ))}
          </View>
          
          {/* Kimler Paylaşacak - Mock UI */}
          <View style={styles.participantsContainer}>
            <Text variant="caption" color={colors.text.secondary} style={{ marginBottom: spacing.sm }}>
              Paylaşanlar: Tüm Üyeler (4 kişi)
            </Text>
            {/* Gerçek uygulamada burada Checkbox'lu üye listesi çıkar */}
            <Button title="Üyeleri Düzenle" variant="outline" onPress={() => {}} />
          </View>
        </View>

        {/* EK DETAYLAR */}
        <View style={styles.section}>
          <Input 
            label="Açıklama (İsteğe bağlı)" 
            placeholder="Harcama ile ilgili notlar..." 
            value={description} 
            onChangeText={setDescription} 
            multiline
            numberOfLines={3}
          />
          
          <TouchableOpacity style={styles.photoButton} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text variant="body" color={colors.primary} style={{ marginLeft: spacing.sm }}>Fiş / Fatura Fotoğrafı Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {/* BOŞLUK */}
        <View style={{ height: 100 }} />

      </ScrollView>

      {/* KAYDET BUTONU - FIXED BOTTOM */}
      <View style={styles.bottomBar}>
        <Button 
          title="Kaydet" 
          onPress={handleSave} 
          disabled={!title || !amount}
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
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  participantsContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    backgroundColor: colors.primary + '05',
    marginTop: spacing.md,
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
    paddingBottom: spacing.xxl, // Safe area for iPhone
  }
});
