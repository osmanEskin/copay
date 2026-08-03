import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Input, Button, Modal, Divider } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { getCurrentUser, setTwoFactorEnabled } from '../../../services/auth';

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabledState] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [pendingTwoFactorValue, setPendingTwoFactorValue] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | undefined>();
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setTwoFactorEnabledState(!!user.twoFactorEnabled);
      }
    });
  }, []);

  const handleToggleTwoFactor = (value: boolean) => {
    setPendingTwoFactorValue(value);
    setTwoFactorPassword('');
    setTwoFactorError(undefined);
    setTwoFactorModalVisible(true);
  };

  const handleConfirmTwoFactor = async () => {
    setTwoFactorError(undefined);
    setIsTwoFactorLoading(true);
    try {
      const result = await setTwoFactorEnabled(pendingTwoFactorValue, twoFactorPassword);
      setTwoFactorEnabledState(result.twoFactorEnabled);
      setTwoFactorModalVisible(false);
    } catch (error) {
      setTwoFactorError(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLogoutOtherDevices = () => {
    Alert.alert(
      "Diğer Cihazlardan Çık",
      "Mevcut cihazınız hariç tüm cihazlardaki oturumunuz kapatılacak. Emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: () => Alert.alert("Başarılı", "Tüm cihazlardan çıkış yapıldı.") }
      ]
    );
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(false);
    Alert.alert("Hesabınız Silindi", "Uygulamadan çıkış yapılıyor...", [
      { text: "Tamam", onPress: () => router.replace('/login') }
    ]);
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Güvenlik</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* ŞİFRE DEĞİŞTİR */}
        <Text variant="h2" style={styles.sectionTitle}>Şifre Değiştir</Text>
        <Card style={styles.card}>
          <Input 
            label="Mevcut Şifre" 
            value={currentPassword} 
            onChangeText={setCurrentPassword} 
            secureTextEntry 
          />
          <View style={{ height: spacing.sm }} />
          <Input 
            label="Yeni Şifre" 
            value={newPassword} 
            onChangeText={setNewPassword} 
            secureTextEntry 
          />
          <Button 
            title="Şifreyi Güncelle" 
            onPress={handleChangePassword} 
            disabled={!currentPassword || !newPassword}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* İKİ AŞAMALI DOĞRULAMA */}
        <Text variant="h2" style={styles.sectionTitle}>İki Aşamalı Doğrulama</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.text.primary} />
              <View style={styles.rowText}>
                <Text variant="body" weight="semibold">Email ile Doğrulama</Text>
                <Text variant="caption" color={colors.text.secondary}>
                  Açıkken giriş yaparken email'inize kod gönderilir
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              onValueChange={handleToggleTwoFactor}
              value={twoFactorEnabled}
            />
          </View>
        </Card>

        {/* OTURUM YÖNETİMİ */}
        <Text variant="h2" style={styles.sectionTitle}>Oturum Yönetimi</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={24} color={colors.text.primary} />
              <View style={styles.rowText}>
                <Text variant="body" weight="semibold">Diğer Cihazlardan Çık</Text>
                <Text variant="caption" color={colors.text.secondary}>Tüm aktif oturumlarınızı sonlandırın</Text>
              </View>
            </View>
            <Button title="Çıkış Yap" variant="outline" onPress={handleLogoutOtherDevices} />
          </View>
        </Card>

        {/* TEHLİKELİ ALAN */}
        <Text variant="h2" color={colors.danger} style={styles.sectionTitle}>Tehlikeli İşlemler</Text>
        <Card style={[styles.card, { borderColor: colors.danger, borderWidth: 1 }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="warning-outline" size={24} color={colors.danger} />
              <View style={styles.rowText}>
                <Text variant="body" weight="semibold" color={colors.danger}>Hesabı Sil</Text>
                <Text variant="caption" color={colors.text.secondary}>Tüm verileriniz kalıcı olarak silinir</Text>
              </View>
            </View>
            <Button title="Sil" variant="danger" onPress={() => setDeleteModalVisible(true)} />
          </View>
        </Card>

      </ScrollView>

      {/* HESABI SİL ONAY MODALI (Çift Onay) */}
      <Modal 
        visible={deleteModalVisible} 
        title="Hesabı Kalıcı Olarak Sil"
        onClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text variant="body" color={colors.danger} style={{ marginBottom: spacing.md }}>
            Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz (harcamalar, faturalar, gruplar) tamamen silinir.
          </Text>
          
          <Text variant="body" weight="semibold" style={{ marginBottom: spacing.xs }}>
            Onaylamak için "HESABI SİL" yazın:
          </Text>
          <Input 
            placeholder="HESABI SİL" 
            value={deleteConfirmText} 
            onChangeText={setDeleteConfirmText} 
            autoCapitalize="characters"
          />

          <View style={styles.modalActions}>
            <Button 
              title="Vazgeç" 
              variant="outline" 
              onPress={() => setDeleteModalVisible(false)} 
              style={{ flex: 1 }}
            />
            <Button 
              title="Kalıcı Olarak Sil" 
              variant="danger" 
              disabled={deleteConfirmText !== 'HESABI SİL'}
              onPress={handleDeleteAccount} 
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>

      {/* 2FA ONAY MODALI */}
      <Modal
        visible={twoFactorModalVisible}
        title={pendingTwoFactorValue ? 'İki Aşamalı Doğrulamayı Aç' : 'İki Aşamalı Doğrulamayı Kapat'}
        onClose={() => setTwoFactorModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.md }}>
            Onaylamak için şifrenizi girin.
          </Text>
          <Input
            label="Şifre"
            value={twoFactorPassword}
            onChangeText={setTwoFactorPassword}
            secureTextEntry
            error={twoFactorError}
          />
          <View style={styles.modalActions}>
            <Button
              title="Vazgeç"
              variant="outline"
              onPress={() => setTwoFactorModalVisible(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Onayla"
              onPress={handleConfirmTwoFactor}
              isLoading={isTwoFactorLoading}
              disabled={!twoFactorPassword}
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
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  rowText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  modalContent: {
    paddingTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  }
});
