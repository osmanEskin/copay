import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Divider, Modal, Input, Button } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../../services/api';
import { sendSupportFeedback } from '../../../services/auth';

export default function SupportScreen() {
  const [modalType, setModalType] = useState<'feedback' | 'bug' | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const openModal = (type: 'feedback' | 'bug') => {
    setModalType(type);
    setMessage('');
    setError(undefined);
    setSuccessMessage(undefined);
  };

  const handleSend = async () => {
    if (!modalType) {
      return;
    }
    setError(undefined);
    setIsSending(true);
    try {
      await sendSupportFeedback(modalType, message);
      setSuccessMessage('Mesajınız iletildi, teşekkürler!');
      setMessage('');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const SupportRow = ({ icon, title, subtitle, onPress }: { icon: any, title: string, subtitle?: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="body" weight="medium">{title}</Text>
        {subtitle && <Text variant="caption" color={colors.text.secondary}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.infoBox}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
          <Text variant="body" align="center" style={{ marginTop: spacing.md }}>
            Size nasıl yardımcı olabiliriz? Lütfen aşağıdaki seçeneklerden birini seçin.
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <SupportRow
            icon="paper-plane-outline"
            title="Geri Bildirim Gönder"
            subtitle="Fikirlerinizi bizimle paylaşın"
            onPress={() => openModal('feedback')}
          />
          <Divider style={styles.divider} />
          <SupportRow
            icon="bug-outline"
            title="Hata Bildir"
            subtitle="Uygulamada bir sorun mu var?"
            onPress={() => openModal('bug')}
          />
        </View>

      </ScrollView>

      <Modal
        visible={modalType !== null}
        title={modalType === 'bug' ? 'Hata Bildir' : 'Geri Bildirim Gönder'}
        onClose={() => setModalType(null)}
      >
        <View style={styles.modalContent}>
          {successMessage ? (
            <Text variant="body" color={colors.primary} style={{ marginBottom: spacing.md }}>
              {successMessage}
            </Text>
          ) : (
            <>
              <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.md }}>
                {modalType === 'bug'
                  ? 'Karşılaştığınız sorunu detaylıca anlatın, en kısa sürede inceleyeceğiz.'
                  : 'Aklınıza gelen her türlü öneri ve fikri bizimle paylaşabilirsiniz.'}
              </Text>
              <Input
                placeholder="Mesajınız..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                error={error}
              />
              <Button
                title="Gönder"
                onPress={handleSend}
                isLoading={isSending}
                disabled={!message.trim()}
                style={{ marginTop: spacing.md }}
              />
            </>
          )}
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
  infoBox: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary + '10',
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    marginHorizontal: spacing.lg,
  },
  modalContent: {
    paddingTop: spacing.sm,
  },
});
