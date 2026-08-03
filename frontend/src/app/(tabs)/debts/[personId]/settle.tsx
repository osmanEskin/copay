import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Input, CurrencyInput, Chip, Modal } from '../../../../components';
import { colors, spacing, radius } from '../../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettleDebtScreen() {
  const { personId } = useLocalSearchParams();
  
  // Mock Data
  const [amount, setAmount] = useState('320');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Nakit');
  
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const paymentMethods = ['Nakit', 'Havale/EFT', 'Diğer'];

  const handleSave = () => {
    setConfirmModalVisible(false);
    // Settlement kaydetme işlemi burada API'ye gönderilecek
    setTimeout(() => {
      Alert.alert("Başarılı", "Hesaplaşma başarıyla kaydedildi.", [
        { text: "Tamam", onPress: () => router.dismissAll() }
      ]);
    }, 500);
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Hesaplaş</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* HESAPLAŞMA KARTI (Ödeyen -> Alan) */}
        <Card style={styles.transferCard}>
          <View style={styles.transferRow}>
            
            <View style={styles.transferPerson}>
              <Avatar initials="SE" size={48} />
              <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>Sen</Text>
              <Text variant="caption" color={colors.text.secondary}>Ödeyen</Text>
            </View>

            <View style={styles.transferArrow}>
              <View style={styles.dashedLine} />
              <Ionicons name="arrow-forward-circle" size={28} color={colors.primary} style={styles.arrowIcon} />
              <View style={styles.dashedLine} />
            </View>

            <View style={styles.transferPerson}>
              <Avatar initials="ME" size={48} />
              <Text variant="body" weight="semibold" style={{ marginTop: spacing.xs }}>Mehmet</Text>
              <Text variant="caption" color={colors.text.secondary}>Alıcı</Text>
            </View>

          </View>
        </Card>

        {/* FORM */}
        <View style={styles.formSection}>
          <CurrencyInput 
            label="Ödenecek Tutar" 
            value={amount} 
            onChangeText={setAmount} 
          />

          <View style={styles.dateSelector}>
            <Text variant="caption" color={colors.text.secondary}>Tarih</Text>
            <View style={styles.dateInner}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text variant="body" style={{ marginLeft: spacing.xs }}>24 Tem 2026</Text>
            </View>
          </View>

          <Text variant="body" weight="medium" style={styles.subTitle}>Ödeme Yöntemi</Text>
          <View style={styles.chipsRow}>
            {paymentMethods.map(method => (
              <Chip 
                key={method} 
                label={method} 
                active={paymentMethod === method} 
                onPress={() => setPaymentMethod(method)} 
              />
            ))}
          </View>

          <Input 
            label="Not (Opsiyonel)" 
            placeholder="Örn: Temmuz ayı elektrik borcu" 
            value={note} 
            onChangeText={setNote} 
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BUTON */}
      <View style={styles.bottomBar}>
        <Button 
          title="Kaydet" 
          onPress={() => setConfirmModalVisible(true)} 
          disabled={!amount}
        />
      </View>

      {/* ONAY MODALI */}
      <Modal 
        visible={confirmModalVisible} 
        title="Hesaplaşma Onayı"
        onClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text variant="body" align="center" style={{ marginBottom: spacing.xl, fontSize: 16 }}>
            Mehmet'e <Text weight="bold" color={colors.primary}>₺{amount}</Text> ödeme kaydedilsin mi?
          </Text>
          <View style={styles.modalActions}>
            <Button 
              title="İptal" 
              variant="outline" 
              onPress={() => setConfirmModalVisible(false)} 
              style={{ flex: 1 }}
            />
            <Button 
              title="Onayla" 
              onPress={handleSave} 
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

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
    marginBottom: spacing.md,
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
  transferCard: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transferPerson: {
    alignItems: 'center',
    flex: 1,
  },
  transferArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  arrowIcon: {
    marginHorizontal: spacing.xs,
  },
  formSection: {
    gap: spacing.md,
  },
  dateSelector: {
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
  subTitle: {
    marginBottom: -spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  },
  modalContent: {
    paddingTop: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  }
});
