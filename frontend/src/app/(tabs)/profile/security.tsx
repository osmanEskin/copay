import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Input, Button, Modal, Divider } from '../../../components';
import { colors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
