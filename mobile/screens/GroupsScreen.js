import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { C, computeBalances, simplifyDebts, fmt, GROUP_TYPES, GROUP_EMOJIS, uid } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function GroupsScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const { appData, currentUser } = state;
  const { groups, expenses, settlements, members } = appData;
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('Trip');
  const [groupEmoji, setGroupEmoji] = useState('🗼');
  const myId = 'm1';

  const handleCreate = () => {
    if (!groupName.trim()) return;
    dispatch({ type: 'CREATE_GROUP', group: { name: groupName, emoji: groupEmoji, type: groupType, color: C.gold, memberIds: [myId] } });
    setGroupName(''); setShowCreate(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {groups.map(group => {
          const groupExpenses = expenses.filter(e => e.groupId === group.id);
          const groupMembers = members.filter(m => group.memberIds.includes(m.id));
          const bals = computeBalances(groupExpenses, settlements.filter(s => s.groupId === group.id), groupMembers, group.id);
          const myBal = bals[myId] || 0;
          const total = groupExpenses.reduce((s, e) => s + e.amount, 0);
          return (
            <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })} activeOpacity={0.8}>
              <View style={styles.groupTop}>
                <View style={[styles.groupEmoji, { backgroundColor: group.color + '22', borderColor: group.color + '44' }]}>
                  <Text style={{ fontSize: 28 }}>{group.emoji}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>{group.type} · {groupMembers.length} members</Text>
                </View>
                <View style={styles.groupBalance}>
                  <Text style={[styles.groupBalAmt, { color: myBal >= 0 ? C.success : C.danger }]}>{myBal >= 0 ? '+' : ''}{fmt(myBal)}</Text>
                  <Text style={styles.groupBalLabel}>{myBal >= 0 ? 'you get back' : 'you owe'}</Text>
                </View>
              </View>
              <View style={styles.groupBottom}>
                <Text style={styles.groupTotalText}>{groupExpenses.length} expenses · {fmt(total)} total</Text>
                <View style={styles.memberAvatars}>
                  {groupMembers.slice(0, 4).map((m, i) => (
                    <View key={m.id} style={[styles.miniAvatar, { backgroundColor: m.color + '33', borderColor: m.color + '66', marginLeft: i > 0 ? -8 : 0 }]}>
                      <Text style={[styles.miniAvatarText, { color: m.color }]}>{m.avatar}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {groups.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySub}>Create a group to start splitting expenses</Text>
          </View>
        )}
      </ScrollView>
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Create Group</Text>
            <Text style={styles.label}>Group Name</Text>
            <TextInput style={styles.input} value={groupName} onChangeText={setGroupName} placeholder="Tokyo Trip, Apartment..." placeholderTextColor={C.textMuted} autoFocus />
            <Text style={styles.label}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {GROUP_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, groupType === t && styles.typeChipActive]} onPress={() => setGroupType(t)}>
                  <Text style={[styles.typeChipText, groupType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Emoji</Text>
            <View style={styles.emojiGrid}>
              {GROUP_EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiBtn, groupEmoji === e && styles.emojiBtnActive]} onPress={() => setGroupEmoji(e)}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createBtnText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: C.text },
  addBtn: { backgroundColor: C.goldTint, borderWidth: 1, borderColor: C.gold + '44', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { color: C.gold, fontWeight: '600', fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 100 },
  groupCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  groupTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  groupEmoji: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '700', color: C.text },
  groupMeta: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  groupBalance: { alignItems: 'flex-end' },
  groupBalAmt: { fontSize: 16, fontWeight: '700' },
  groupBalLabel: { fontSize: 11, color: C.textMuted },
  groupBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  groupTotalText: { fontSize: 12, color: C.textMuted },
  memberAvatars: { flexDirection: 'row' },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  miniAvatarText: { fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: C.text, marginTop: 12 },
  emptySub: { fontSize: 14, color: C.textMuted, marginTop: 6, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 20 },
  label: { fontSize: 12, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border },
  typeRow: { marginBottom: 4 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginRight: 8 },
  typeChipActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  typeChipText: { fontSize: 13, color: C.textSec },
  typeChipTextActive: { color: C.gold, fontWeight: '600' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  emojiBtnActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  createBtn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  createBtnText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: C.textSec, fontSize: 15 },
});
