import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { C, fmt, timeAgo, CATEGORIES, computeBalances, simplifyDebts } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import AddExpenseModal from '../components/AddExpenseModal';

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { state, dispatch } = useApp();
  const { appData, currentUser } = state;
  const { expenses, settlements, members, groups } = appData;
  const group = groups.find(g => g.id === groupId);
  const groupExpenses = expenses.filter(e => e.groupId === groupId).sort((a, b) => new Date(b.date) - new Date(a.date));
  const groupSettlements = settlements.filter(s => s.groupId === groupId);
  const groupMembers = members.filter(m => group?.memberIds.includes(m.id));
  const myId = 'm1';
  const balances = computeBalances(groupExpenses, groupSettlements, groupMembers, groupId);
  const debts = simplifyDebts(balances);
  const myDebts = debts.filter(d => d.from === myId);
  const myCredits = debts.filter(d => d.to === myId);
  const myBal = balances[myId] || 0;
  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [settleTarget, setSettleTarget] = useState(null);
  const [settleAmt, setSettleAmt] = useState('');

  if (!group) return null;

  const handleSettle = () => {
    if (!settleTarget || !settleAmt) return;
    dispatch({ type: 'SETTLE_UP', settlement: { groupId, fromId: myId, toId: settleTarget.to, amount: parseFloat(settleAmt), currency: 'USD', method: 'Cash' } });
    setShowSettle(false); setSettleTarget(null); setSettleAmt('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{group.emoji}</Text>
          <View>
            <Text style={styles.headerTitle}>{group.name}</Text>
            <Text style={styles.headerSub}>{group.type} · {groupMembers.length} members</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.balCard}>
          <Text style={styles.balLabel}>Your Balance</Text>
          <Text style={[styles.balAmt, { color: myBal >= 0 ? C.success : C.danger }]}>{myBal >= 0 ? '+' : ''}{fmt(myBal)}</Text>
        </View>
        {(myDebts.length > 0 || myCredits.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settle Up</Text>
            {myDebts.map((d, i) => {
              const toMember = members.find(m => m.id === d.to);
              return (
                <View key={i} style={styles.debtRow}>
                  <Avatar name={toMember?.name || '?'} color={toMember?.color || '#888'} size={36} />
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>You owe {toMember?.name}</Text>
                    <Text style={[styles.debtAmt, { color: C.danger }]}>{fmt(d.amount)}</Text>
                  </View>
                  <TouchableOpacity style={styles.settleBtn} onPress={() => { setSettleTarget(d); setSettleAmt(d.amount.toFixed(2)); setShowSettle(true); }}>
                    <Text style={styles.settleBtnText}>Settle</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            {myCredits.map((d, i) => {
              const fromMember = members.find(m => m.id === d.from);
              return (
                <View key={i} style={styles.debtRow}>
                  <Avatar name={fromMember?.name || '?'} color={fromMember?.color || '#888'} size={36} />
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{fromMember?.name} owes you</Text>
                    <Text style={[styles.debtAmt, { color: C.success }]}>{fmt(d.amount)}</Text>
                  </View>
                  <View style={styles.owesYouBadge}><Text style={styles.owesYouText}>Awaiting</Text></View>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          <View style={styles.membersRow}>
            {groupMembers.map(m => (
              <View key={m.id} style={styles.memberItem}>
                <Avatar name={m.name} color={m.color} size={40} />
                <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                <Text style={[styles.memberBal, { color: (balances[m.id] || 0) >= 0 ? C.success : C.danger }]}>
                  {(balances[m.id] || 0) >= 0 ? '+' : ''}{fmt(Math.abs(balances[m.id] || 0))}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{groupExpenses.length} Expenses</Text>
          {groupExpenses.map(exp => {
            const catInfo = CATEGORIES[exp.category] || { emoji: '📦', color: '#888' };
            const paidByMember = members.find(m => m.id === exp.paidBy);
            const myShare = exp.splitAmong.includes(myId) ? exp.amount / exp.splitAmong.length : 0;
            return (
              <View key={exp.id} style={styles.expRow}>
                <View style={[styles.expIcon, { backgroundColor: catInfo.color + '22' }]}><Text style={{ fontSize: 18 }}>{catInfo.emoji}</Text></View>
                <View style={styles.expInfo}>
                  <Text style={styles.expTitle} numberOfLines={1}>{exp.title}</Text>
                  <Text style={styles.expSub}>{paidByMember?.name} paid · {timeAgo(exp.date)}</Text>
                </View>
                <View style={styles.expAmts}>
                  <Text style={styles.expTotal}>{fmt(exp.amount, exp.currency)}</Text>
                  {myShare > 0 && (
                    <Text style={[styles.expShare, { color: exp.paidBy === myId ? C.success : C.danger }]}>
                      {exp.paidBy === myId ? `+${fmt(exp.amount - myShare, exp.currency)}` : `-${fmt(myShare, exp.currency)}`}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => Alert.alert('Delete', `Delete "${exp.title}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'DELETE_EXPENSE', id: exp.id }) }
                ])}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {groupExpenses.length === 0 && <Text style={styles.emptyText}>No expenses yet. Add one!</Text>}
        </View>
      </ScrollView>
      <AddExpenseModal visible={showAdd} onClose={() => setShowAdd(false)} groups={groups} members={groupMembers} currentUserId={myId} defaultGroupId={groupId}
        onAdd={(expense) => { dispatch({ type: 'ADD_EXPENSE', expense }); setShowAdd(false); }} />
      <Modal visible={showSettle} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.settleSheet}>
            <Text style={styles.settleTitle}>Settle Up</Text>
            {settleTarget && <Text style={styles.settleDesc}>Paying {members.find(m => m.id === settleTarget.to)?.name}</Text>}
            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} value={settleAmt} onChangeText={setSettleAmt} keyboardType="decimal-pad" placeholderTextColor={C.textMuted} />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSettle}><Text style={styles.confirmBtnText}>Confirm Settlement</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettle(false)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 },
  backBtn: { padding: 8 },
  backText: { fontSize: 22, color: C.gold },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerEmoji: { fontSize: 28 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 22, color: '#080808', fontWeight: '300', lineHeight: 28 },
  scroll: { paddingBottom: 40 },
  balCard: { margin: 16, backgroundColor: C.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  balLabel: { fontSize: 12, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  balAmt: { fontSize: 32, fontWeight: '700' },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: C.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  debtRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: C.border },
  debtInfo: { flex: 1 },
  debtName: { fontSize: 14, color: C.text },
  debtAmt: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  settleBtn: { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  settleBtnText: { color: '#080808', fontWeight: '700', fontSize: 13 },
  owesYouBadge: { backgroundColor: C.success + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: C.success + '44' },
  owesYouText: { color: C.success, fontSize: 12 },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memberItem: { alignItems: 'center', width: 64 },
  memberName: { fontSize: 11, color: C.textSec, marginTop: 4, textAlign: 'center' },
  memberBal: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  expRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: C.border },
  expIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expTitle: { fontSize: 13, color: C.text, fontWeight: '500' },
  expSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  expAmts: { alignItems: 'flex-end' },
  expTotal: { fontSize: 14, fontWeight: '700', color: C.text },
  expShare: { fontSize: 11, marginTop: 2 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: C.textMuted, fontSize: 14 },
  emptyText: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingVertical: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  settleSheet: { backgroundColor: C.surface, borderRadius: 20, padding: 24 },
  settleTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  settleDesc: { fontSize: 14, color: C.textSec, marginBottom: 20 },
  label: { fontSize: 12, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  confirmBtn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  confirmBtnText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: C.textSec, fontSize: 15 },
});
