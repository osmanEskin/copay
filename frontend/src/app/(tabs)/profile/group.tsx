import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Divider, Badge, Modal } from '../../../components';
import { colors, spacing, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

// Mock Veri
const MOCK_GROUP = {
  name: 'Ev 3A',
  createdAt: 'Ocak 2026',
  memberCount: 4,
};

const MOCK_MEMBERS = [
  { id: '1', name: 'Seyit Osman (Sen)', initials: 'SE', role: 'Admin' },
  { id: '2', name: 'Ahmet Yılmaz', initials: 'AH', role: 'Admin' },
  { id: '3', name: 'Mehmet Demir', initials: 'ME', role: 'Üye' },
  { id: '4', name: 'Ayşe Kaya', initials: 'AY', role: 'Üye' },
];

export default function GroupScreen() {
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [memberOptionsVisible, setMemberOptionsVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const handleLeaveGroup = () => {
    Alert.alert(
      "Gruptan Ayrıl",
      "Bu gruptan ayrılmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Ayrıl", style: "destructive", onPress: () => router.replace('/profile') }
      ]
    );
  };

  const handleMemberAction = (member: any) => {
    if (member.name.includes('(Sen)')) return; // Kendisine işlem yapamaz
    setSelectedMember(member);
    setMemberOptionsVisible(true);
  };

  const removeMember = () => {
    setMemberOptionsVisible(false);
    Alert.alert(
      "Üyeyi Çıkar",
      `${selectedMember?.name} adlı kullanıcıyı gruptan çıkarmak istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkar", style: "destructive", onPress: () => {} }
      ]
    );
  };

  return (
    <Screen safeArea backgroundColor={colors.background}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Grup Yönetimi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* GRUP BİLGİLERİ KARTI */}
        <Card style={styles.groupCard}>
          <View style={styles.groupIconWrapper}>
            <Ionicons name="home" size={40} color={colors.primary} />
          </View>
          <Text variant="h1">{MOCK_GROUP.name}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {MOCK_GROUP.memberCount} Üye • {MOCK_GROUP.createdAt}'den beri
          </Text>
        </Card>

        {/* DAVET ET BUTONLARI */}
        <View style={styles.inviteSection}>
          <Button 
            title="Yeni Üye Davet Et" 
            onPress={() => setInviteModalVisible(true)} 
            style={styles.inviteBtn}
          />
        </View>

        {/* ÜYELER LİSTESİ */}
        <View style={styles.membersHeader}>
          <Text variant="h2">Üyeler</Text>
        </View>

        <Card noPadding style={styles.membersCard}>
          {MOCK_MEMBERS.map((member, index) => (
            <React.Fragment key={member.id}>
              <TouchableOpacity 
                style={styles.memberRow} 
                onPress={() => handleMemberAction(member)}
                activeOpacity={member.name.includes('(Sen)') ? 1 : 0.7}
              >
                <Avatar initials={member.initials} size={44} />
                <View style={styles.memberInfo}>
                  <Text variant="body" weight="semibold">{member.name}</Text>
                </View>
                
                <Badge 
                  label={member.role} 
                  variant={member.role === 'Admin' ? 'primary' : 'default'} 
                />
                
                {!member.name.includes('(Sen)') && (
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} style={{ marginLeft: spacing.sm }} />
                )}
              </TouchableOpacity>
              {index < MOCK_MEMBERS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ALT BUTON: GRUPTAN AYRIL */}
      <View style={styles.bottomBar}>
        <Button 
          title="Gruptan Ayrıl" 
          variant="danger" 
          onPress={handleLeaveGroup} 
        />
      </View>

      {/* DAVET MODALI */}
      <Modal 
        visible={inviteModalVisible} 
        title="Davet Et"
        onClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Ionicons name="link-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Davet Linki Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Ionicons name="qr-code-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>QR Kod Göster</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Ionicons name="keypad-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Davet Kodu Oluştur</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ÜYE İŞLEM MODALI */}
      <Modal 
        visible={memberOptionsVisible} 
        title={selectedMember?.name}
        onClose={() => setMemberOptionsVisible(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
            <Ionicons name="create-outline" size={24} color={colors.text.primary} />
            <Text variant="body" weight="medium" style={styles.modalOptionText}>Rolü Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={removeMember}>
            <Ionicons name="person-remove-outline" size={24} color={colors.danger} />
            <Text variant="body" weight="medium" color={colors.danger} style={styles.modalOptionText}>Gruptan Çıkar</Text>
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
  groupCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  groupIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inviteSection: {
    marginBottom: spacing.xl,
  },
  inviteBtn: {
    width: '100%',
  },
  membersHeader: {
    marginBottom: spacing.md,
  },
  membersCard: {
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
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
