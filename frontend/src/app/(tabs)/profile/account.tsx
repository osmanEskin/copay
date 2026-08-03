import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Input, Button, Avatar, Modal } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const [firstName, setFirstName] = useState('Seyit Osman');
  const [lastName, setLastName] = useState('Eşkin');
  const [username, setUsername] = useState('seyitosman');
  const [phone, setPhone] = useState('+90 555 123 4567');
  const [email, setEmail] = useState('seyit@example.com');
  
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const handleSave = () => {
    // API request here
    router.replace('/profile');
  };

  const handleChangePhoto = (option: string) => {
    setAvatarModalVisible(false);
    // Kamera veya Galeri işlemleri
    Alert.alert("Fotoğraf", `${option} seçildi (Simülasyon)`);
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Hesap Bilgileri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* AVATAR DÜZENLEME */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar initials="SE" size={100} />
            <TouchableOpacity 
              style={styles.editAvatarBtn} 
              onPress={() => setAvatarModalVisible(true)}
            >
              <Ionicons name="camera" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.formSection}>
          <Input label="Ad" value={firstName} onChangeText={setFirstName} />
          <Input label="Soyad" value={lastName} onChangeText={setLastName} />
          <Input label="Kullanıcı Adı (Opsiyonel)" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Input label="Telefon (Opsiyonel)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          
          <Input 
            label="E-posta" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
            // E-posta genelde özel doğrulama gerektirir, şimdilik sadece gösteriliyor
          />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BUTONLAR */}
      <View style={styles.bottomBar}>
        <Button 
          title="Şifre Değiştir" 
          variant="outline" 
          onPress={() => router.push('/profile/security')}
          style={{ marginBottom: spacing.md }}
        />
        <Button 
          title="Değişiklikleri Kaydet" 
          onPress={handleSave} 
        />
      </View>

      {/* AVATAR MODALI */}
      <Modal 
        visible={avatarModalVisible} 
        title="Profil Fotoğrafı"
        onClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleChangePhoto('Kamera')}>
            <Ionicons name="camera-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Kamera ile Çek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleChangePhoto('Galeri')}>
            <Ionicons name="image-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Galeriden Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleChangePhoto('Kaldır')}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
            <Text variant="body" weight="medium" color={colors.danger} style={styles.modalOptionText}>Fotoğrafı Kaldır</Text>
          </TouchableOpacity>
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
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  formSection: {
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
    gap: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  modalOptionText: {
    marginLeft: spacing.md,
  }
});
