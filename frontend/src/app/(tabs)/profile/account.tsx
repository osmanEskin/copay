import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Input, Button, Avatar } from '../../../components';
import { colors, spacing, radius, shadow } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { getCurrentUser, updateProfile } from '../../../services/auth';

export default function AccountScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        return;
      }
      const nameParts = user.name.trim().split(/\s+/);
      const lastName = nameParts.length > 1 ? nameParts.pop()! : '';
      setFirstName(nameParts.join(' '));
      setLastName(lastName);
      setUsername(user.username ?? '');
      setPhone(user.phone ?? '');
      setEmail(user.email);
    });
  }, []);

  const handleSave = async () => {
    setErrorMessage(undefined);
    setIsSaving(true);
    try {
      const name = [firstName, lastName].filter(Boolean).join(' ');
      await updateProfile(name, username || null, phone || null);
      router.replace('/profile');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

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
        
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <Avatar initials={initials} size={100} />
        </View>

        {/* FORM */}
        <View style={styles.formSection}>
          <Input label="Ad" value={firstName} onChangeText={setFirstName} error={errorMessage} />
          <Input label="Soyad" value={lastName} onChangeText={setLastName} />
          <Input label="Kullanıcı Adı (Opsiyonel)" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Input label="Telefon (Opsiyonel)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Input
            label="E-posta"
            value={email}
            editable={false}
            autoCapitalize="none"
            keyboardType="email-address"
            // E-posta değişikliği doğrulama gerektirir, şimdilik sadece gösteriliyor
          />
        </View>
        
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ALT BUTONLAR */}
      <View style={styles.bottomBar}>
        <Button
          title="Değişiklikleri Kaydet"
          onPress={handleSave}
          isLoading={isSaving}
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
  formSection: {
    gap: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadow.lg,
  },
});
