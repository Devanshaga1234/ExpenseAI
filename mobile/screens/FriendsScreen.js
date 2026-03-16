import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { C, computeBalances, simplifyDebts, fmt } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';

export default function FriendsScreen() {
  const { state } = useApp();
  const { appData } = state;
  const { friends, expenses, settlements, members, groups } = appData;
  const myId = 'm1';
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const balances = computeBalances(expenses, settlements, members);
  const debts = simplifyDebts(balances);
  const getFriendBalance = (fmid) => {
    const owe = debts.find(d => d.from === myId && d.to === fmid);
    const owed = debts.find(d => d.from === fmid && d.to === myId);
    if (owe) return -owe.amount;
    if (owed) return owed.amount;
    return 0;
  };
  const sharedGroups = (fmid) => groups.filter(g => g.memberIds.includes(myId) && g.memberIds.includes(fmid));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowInvite(true)}>
          <Text style={styles.inviteBtnText}>+ Invite</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>YOUR FRIENDS · {friends.length}</Text>
        {friends.map(friend => {
          const bal = getFriendBalance(friend.memberId);
          const grps = sharedGroups(friend.memberId);
          return (
            <View key={friend.id} style={styles.friendCard}>
              <Avatar name={friend.name} color={friend.color} size={48} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendSub}>{grps.length} shared group{grps.length !== 1 ? 's' : ''}</Text>
                <View style={styles.groupTagsRow}>
                  {grps.slice(0, 3).map(g => (
                    <View key={g.id} style={styles.groupTag}>
                      <Text style={styles.groupTagText}>{g.emoji} {g.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.friendBalance}>
                <Text style={[styles.friendBalAmt, { color: bal === 0 ? C.textMuted : bal > 0 ? C.success : C.danger }]}>
                  {bal === 0 ? 'Even' : bal > 0 ? `+${fmt(bal)}` : fmt(bal)}
                </Text>
                <Text style={styles.friendBalLabel}>{bal === 0 ? 'settled' : bal > 0 ? 'owes you' : 'you owe'}</Text>
              </View>
            </View>
          );
        })}
        {friends.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySub}>Invite friends to split expenses together</Text>
          </View>
        )}
        {friends.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryVal, { color: C.success }]}>+{fmt(debts.filter(d => d.to === myId).reduce((s, d) => s + d.amount, 0))}</Text>
                <Text style={styles.summaryLabel}>You get back</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryVal, { color: C.danger }]}>-{fmt(debts.filter(d => d.from === myId).reduce((s, d) => s + d.amount, 0))}</Text>
                <Text style={styles.summaryLabel}>You owe total</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <Modal visible={showInvite} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Invite a Friend</Text>
            <Text style={styles.sheetSub}>Send them an invite to join ExpenseAI</Text>
            <Text style={styles.label}>Email or Phone</Text>
            <TextInput style={styles.input} value={inviteEmail} onChangeText={setInviteEmail} placeholder="friend@example.com" placeholderTextColor={C.textMuted} autoCapitalize="none" keyboardType="email-address" autoFocus />
            <TouchableOpacity style={styles.sendBtn} onPress={() => { Alert.alert('Invite Sent!', `Invite sent to ${inviteEmail}`); setInviteEmail(''); setShowInvite(false); }}>
              <Text style={styles.sendBtnText}>Send Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelTap} onPress={() => setShowInvite(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
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
  inviteBtn: { backgroundColor: C.goldTint, borderWidth: 1, borderColor: C.gold + '44', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  inviteBtnText: { color: C.gold, fontWeight: '600', fontSize: 14 },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  friendCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: C.border },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: C.text },
  friendSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  groupTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  groupTag: { backgroundColor: C.elevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  groupTagText: { fontSize: 11, color: C.textSec },
  friendBalance: { alignItems: 'flex-end' },
  friendBalAmt: { fontSize: 16, fontWeight: '700' },
  friendBalLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: C.text, marginTop: 12 },
  emptySub: { fontSize: 14, color: C.textMuted, marginTop: 6, textAlign: 'center' },
  summaryCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginTop: 4, borderWidth: 1, borderColor: C.gold + '22' },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 20, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: C.border },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
  sheetSub: { fontSize: 14, color: C.textSec, marginBottom: 20 },
  label: { fontSize: 12, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border },
  sendBtn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  sendBtnText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  cancelTap: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: C.textSec, fontSize: 15 },
});
