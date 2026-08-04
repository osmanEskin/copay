import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../Text';
import { Chip } from '../Chip';
import { Input } from '../Input';
import { colors, spacing, radius } from '../../theme';
import type { GroupMember } from '../../services/groups';
import type { SplitMethod } from '../../hooks/useParticipantSplit';

const SPLIT_METHOD_LABELS: Record<SplitMethod, string> = {
  equal: 'Eşit',
  percentage: 'Yüzdelik',
  amount: 'Tutar',
};

interface ParticipantSplitPickerProps {
  members: GroupMember[];
  currentUserId: string | null;
  splitMethod: SplitMethod;
  onSplitMethodChange: (method: SplitMethod) => void;
  includedUserIds: Set<string>;
  onToggleParticipant: (userId: string) => void;
  participantValues: Record<string, string>;
  onParticipantValueChange: (userId: string, text: string) => void;
}

export function ParticipantSplitPicker({
  members,
  currentUserId,
  splitMethod,
  onSplitMethodChange,
  includedUserIds,
  onToggleParticipant,
  participantValues,
  onParticipantValueChange,
}: ParticipantSplitPickerProps) {
  return (
    <View>
      <Text variant="body" weight="semibold" style={styles.sectionTitle}>Nasıl Bölüşülecek?</Text>
      <View style={styles.chipsRow}>
        {(Object.keys(SPLIT_METHOD_LABELS) as SplitMethod[]).map((m) => (
          <Chip
            key={m}
            label={SPLIT_METHOD_LABELS[m]}
            active={splitMethod === m}
            onPress={() => onSplitMethodChange(m)}
          />
        ))}
      </View>

      <View style={styles.participantsContainer}>
        {members.map((m) => {
          const included = includedUserIds.has(m.userId);
          return (
            <View key={m.userId} style={styles.participantRow}>
              <TouchableOpacity
                style={styles.participantCheckRow}
                onPress={() => onToggleParticipant(m.userId)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={included ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={included ? colors.primary : colors.text.secondary}
                />
                <Text variant="body" style={styles.participantName}>
                  {m.userId === currentUserId ? 'Sen' : m.name}
                </Text>
              </TouchableOpacity>
              {included && splitMethod !== 'equal' && (
                <Input
                  value={participantValues[m.userId] ?? ''}
                  onChangeText={(text) => onParticipantValueChange(m.userId, text)}
                  keyboardType="decimal-pad"
                  style={styles.participantValueInput}
                  placeholder={splitMethod === 'percentage' ? '%' : '₺'}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  participantsContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantName: {
    marginLeft: spacing.sm,
  },
  participantValueInput: {
    width: 70,
    marginBottom: 0,
    textAlign: 'right',
  },
});
