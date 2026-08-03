import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, Card, Avatar, Button, Input, Divider, Badge, Modal, Loading } from '../../../components';
import { colors, spacing, radius, shadow } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { confirmAsync } from '../../../utils/confirm';
import { ApiError } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import {
  createGroup,
  getGroup,
  getMyGroups,
  joinGroup,
  removeMember,
  updateMemberRole,
  type GroupDetail,
  type GroupMember,
} from '../../../services/groups';

export default function GroupScreen() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [addGroupModalVisible, setAddGroupModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [memberOptionsVisible, setMemberOptionsVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const loadData = async () => {
    setIsLoading(true);
    const [user, myGroups] = await Promise.all([getCurrentUser(), getMyGroups()]);
    setCurrentUserId(user?.id ?? null);
    if (myGroups.length > 0) {
      const detail = await getGroup(myGroups[0].id);
      setGroup(detail);
    } else {
      setGroup(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGroup = async () => {
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      const newGroup = await createGroup(groupName);
      setCreateModalVisible(false);
      setGroupName('');
      setGroup(await getGroup(newGroup.id));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    setErrorMessage(undefined);
    setIsSubmitting(true);
    try {
      const joinedGroup = await joinGroup(joinCode);
      setJoinModalVisible(false);
      setJoinCode('');
      setGroup(await getGroup(joinedGroup.id));
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Bir şeyler ters gitti, lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareInvite = () => {
    if (!group) return;
    Share.share({ message: `Copay grubuma katıl: ${group.inviteCode}` }).catch(() => {});
  };

  const handleLeaveGroup = async () => {
    if (!group || !currentUserId) return;
    const confirmed = await confirmAsync(
      'Gruptan Ayrıl',
      'Bu gruptan ayrılmak istediğinize emin misiniz?',
      'Ayrıl'
    );
    if (!confirmed) return;

    await removeMember(group.id, currentUserId);
    router.replace('/profile');
  };

  const handleMemberAction = (member: GroupMember) => {
    if (member.userId === currentUserId) return;
    setSelectedMember(member);
    setMemberOptionsVisible(true);
  };

  const handleToggleRole = async () => {
    if (!group || !selectedMember) return;
    const nextRole = selectedMember.role === 'admin' ? 'member' : 'admin';
    setMemberOptionsVisible(false);
    await updateMemberRole(group.id, selectedMember.userId, nextRole);
    await loadData();
  };

  const handleRemoveMember = async () => {
    if (!group || !selectedMember) return;
    setMemberOptionsVisible(false);
    const confirmed = await confirmAsync(
      'Üyeyi Çıkar',
      `${selectedMember.name} adlı kullanıcıyı gruptan çıkarmak istediğinize emin misiniz?`,
      'Çıkar'
    );
    if (!confirmed) return;

    await removeMember(group.id, selectedMember.userId);
    await loadData();
  };

  const myRole = group?.members.find((m) => m.userId === currentUserId)?.role;

  return (
    <Screen safeArea backgroundColor={colors.background}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" color={colors.text.primary}>Grup Yönetimi</Text>
        {group ? (
          <TouchableOpacity style={styles.backButton} onPress={() => setAddGroupModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {isLoading ? (
        <Loading />
      ) : !group ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.text.secondary} />
          <Text variant="h2" align="center" style={styles.emptyTitle}>Henüz bir grubun yok</Text>
          <Text variant="body" color={colors.text.secondary} align="center" style={styles.emptyDescription}>
            Yeni bir grup oluşturabilir veya bir davet koduyla mevcut bir gruba katılabilirsin.
          </Text>
          <Button title="Grup Oluştur" onPress={() => setCreateModalVisible(true)} style={styles.emptyBtn} />
          <Button title="Kod ile Katıl" variant="outline" onPress={() => setJoinModalVisible(true)} style={styles.emptyBtn} />
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

            {/* GRUP BİLGİLERİ KARTI */}
            <Card style={styles.groupCard}>
              <View style={styles.groupIconWrapper}>
                <Ionicons name="home" size={40} color={colors.primary} />
              </View>
              <Text variant="h1">{group.name}</Text>
              <Text variant="body" color={colors.text.secondary}>
                {group.members.length} Üye
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
              {group.members.map((member, index) => {
                const isSelf = member.userId === currentUserId;
                const initials = member.name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part.charAt(0))
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <React.Fragment key={member.userId}>
                    <TouchableOpacity
                      style={styles.memberRow}
                      onPress={() => handleMemberAction(member)}
                      activeOpacity={isSelf ? 1 : 0.7}
                    >
                      <Avatar initials={initials} size={44} />
                      <View style={styles.memberInfo}>
                        <Text variant="body" weight="semibold">
                          {member.name}{isSelf ? ' (Sen)' : ''}
                        </Text>
                      </View>

                      <Badge
                        label={member.role === 'admin' ? 'Admin' : 'Üye'}
                        variant={member.role === 'admin' ? 'primary' : 'default'}
                      />

                      {!isSelf && (
                        <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} style={{ marginLeft: spacing.sm }} />
                      )}
                    </TouchableOpacity>
                    {index < group.members.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </Card>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* ALT BUTON: GRUPTAN AYRIL */}
          <View style={styles.bottomBar}>
            <Button title="Gruptan Ayrıl" variant="danger" onPress={handleLeaveGroup} />
          </View>

          {/* YENİ GRUP MODALI (grup içindeyken) */}
          <Modal visible={addGroupModalVisible} title="Yeni Grup" onClose={() => setAddGroupModalVisible(false)}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setAddGroupModalVisible(false);
                  setCreateModalVisible(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
                <Text variant="body" weight="medium" style={styles.modalOptionText}>Grup Oluştur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setAddGroupModalVisible(false);
                  setJoinModalVisible(true);
                }}
              >
                <Ionicons name="key-outline" size={24} color={colors.text.primary} />
                <Text variant="body" weight="medium" style={styles.modalOptionText}>Kod ile Katıl</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* DAVET MODALI */}
          <Modal visible={inviteModalVisible} title="Davet Et" onClose={() => setInviteModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text variant="caption" color={colors.text.secondary}>Davet Kodu</Text>
              <Text variant="h1" color={colors.primary} style={styles.inviteCode}>{group.inviteCode}</Text>
              <Text variant="caption" color={colors.text.secondary} style={{ marginBottom: spacing.md }}>
                Bu kodu paylaştığın kişiler "Kod ile Katıl" diyerek gruba katılabilir.
              </Text>
              <Button title="Kodu Paylaş" onPress={handleShareInvite} />
            </View>
          </Modal>

          {/* ÜYE İŞLEM MODALI */}
          <Modal
            visible={memberOptionsVisible}
            title={selectedMember?.name}
            onClose={() => setMemberOptionsVisible(false)}
          >
            <View style={styles.modalContent}>
              {myRole === 'admin' && (
                <TouchableOpacity style={styles.modalOption} onPress={handleToggleRole}>
                  <Ionicons name="shield-outline" size={24} color={colors.text.primary} />
                  <Text variant="body" weight="medium" style={styles.modalOptionText}>
                    {selectedMember?.role === 'admin' ? 'Adminliği Kaldır' : 'Admin Yap'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalOption} onPress={handleRemoveMember}>
                <Ionicons name="person-remove-outline" size={24} color={colors.danger} />
                <Text variant="body" weight="medium" color={colors.danger} style={styles.modalOptionText}>Gruptan Çıkar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}

      {/* GRUP OLUŞTUR MODALI */}
      <Modal visible={createModalVisible} title="Grup Oluştur" onClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalContent}>
          <Input
            label="Grup Adı"
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Ev 3A"
            error={errorMessage}
          />
          <Button title="Oluştur" onPress={handleCreateGroup} isLoading={isSubmitting} disabled={!groupName} />
        </View>
      </Modal>

      {/* KOD İLE KATIL MODALI */}
      <Modal visible={joinModalVisible} title="Kod ile Katıl" onClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalContent}>
          <Input
            label="Davet Kodu"
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="ör. 62USRX"
            autoCapitalize="characters"
            error={errorMessage}
          />
          <Button title="Katıl" onPress={handleJoinGroup} isLoading={isSubmitting} disabled={!joinCode} />
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    width: '100%',
    marginBottom: spacing.sm,
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
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadow.lg,
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
  },
  inviteCode: {
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
});
