import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { C, fmt, timeAgo, CATEGORIES, computeBalances, simplifyDebts } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import AddExpenseModal from '../components/AddExpenseModal';

export default function DashboardScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const { appData, currentUser } = state;
  const { expenses, settlements, members, groups, notifications } = appData;
  const [showAdd, setShowAdd] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const myId = 'm1';
  const balances = computeBalances(expenses, settlements, members);
  const myBalance = balances[myId] || 0;
  const debts = simplifyDebts(balances);
  const myDebts = debts.filter(d => d.from === myId);
  const myCredits = debts.filter(d => d.to === myId);
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  const unread = notifications.filter(n => !n.read).length;
  const catSpend = {};
  expenses.forEach(e => { catSpend[e.category] = (catSpend[e.category] || 0) + e.amount; });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{currentUser.name} ✦</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifs(true)}>
            <Text style={styles.notifIcon}>🔔</Text>
            {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
          </TouchableOpacity>
          <Avatar name={currentUser.name} color={currentUser.color} size={36} />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>NET BALANCE</Text>
          <Text style={[styles.balanceAmount, { color: myBalance >= 0 ? C.success : C.danger }]}>
            {myBalance >= 0 ? '+' : '-'}{fmt(Math.abs(myBalance))}
          </Text>
          <Text style={styles.balanceSub}>{myBalance >= 0 ? `${myCredits.length} people owe you` : `You owe ${myDebts.length} people`}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statVal}>{fmt(totalSpend)}</Text><Text style={styles.statLabel}>Total Spend</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statVal}>{groups.length}</Text><Text style={styles.statLabel}>Groups</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statVal}>{expenses.length}</Text><Text style={styles.statLabel}>Expenses</Text></View>
          </View>
        </View>
        {(myDebts.length > 0 || myCredits.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Balances</Text>
            {myDebts.map((d, i) => {
              const toMember = members.find(m => m.id === d.to);
              return (
                <View key={i} style={styles.debtRow}>
                  <Avatar name={toMember?.name || '?'} color={toMember?.color || '#888'} size={32} />
                  <View style={styles.debtInfo}><Text style={styles.debtName}>You owe {toMember?.name}</Text></View>
                  <Text style={[styles.debtAmt, { color: C.danger }]}>-{fmt(d.amount)}</Text>
                </View>
              );
            })}
            {myCredits.map((d, i) => {
              const fromMember = members.find(m => m.id === d.from);
              return (
                <View key={i} style={styles.debtRow}>
                  <Avatar name={fromMember?.name || '?'} color={fromMember?.color || '#888'} size={32} />
                  <View style={styles.debtInfo}><Text style={styles.debtName}>{fromMember?.name} owes you</Text></View>
                  <Text style={[styles.debtAmt, { color: C.success }]}>+{fmt(d.amount)}</Text>
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {topCats.map(([cat, amt]) => {
            const catInfo = CATEGORIES[cat] || { emoji: '📦', color: '#888' };
            const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catEmoji}>{catInfo.emoji}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catAmt}>{fmt(amt)}</Text>
                  </View>
                  <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: catInfo.color }]} /></View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {recent.map(exp => {
            const catInfo = CATEGORIES[exp.category] || { emoji: '📦', color: '#888' };
            const paidByMember = members.find(m => m.id === exp.paidBy);
            const myShare = exp.splitAmong.includes(myId) ? exp.amount / exp.splitAmong.length : 0;
            return (
              <View key={exp.id} style={styles.expenseRow}>
                <View style={[styles.catIcon, { backgroundColor: catInfo.color + '22' }]}><Text style={styles.catIconText}>{catInfo.emoji}</Text></View>
                <View style={styles.expInfo}>
                  <Text style={styles.expTitle} numberOfLines={1}>{exp.title}</Text>
                  <Text style={styles.expSub}>{paidByMember?.name} · {timeAgo(exp.date)}</Text>
                </View>
                <View style={styles.expAmounts}>
                  <Text style={styles.expTotal}>{fmt(exp.amount, exp.currency)}</Text>
                  {myShare > 0 && (
                    <Text style={[styles.expShare, { color: exp.paidBy === myId ? C.success : C.danger }]}>
                      {exp.paidBy === myId ? `+${fmt(exp.amount - myShare, exp.currency)}` : `-${fmt(myShare, exp.currency)}`}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <AddExpenseModal visible={showAdd} onClose={() => setShowAdd(false)} groups={groups} members={members} currentUserId={myId}
        onAdd={(expense) => { dispatch({ type: 'ADD_EXPENSE', expense }); setShowAdd(false); }} />
      <Modal visible={showNotifs} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.notifsSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => { dispatch({ type: 'MARK_NOTIFICATIONS_READ' }); setShowNotifs(false); }}>
                <Text style={styles.markRead}>Mark all read</Text>
              </TouchableOpacity>
            </View>
            <FlatList data={notifications} keyExtractor={n => n.id} renderItem={({ item: n }) => (
              <View style={[styles.notifItem, !n.read && styles.notifUnread]}>
                <Text style={styles.notifItemIcon}>{n.icon}</Text>
                <View style={styles.notifItemBody}>
                  <Text style={styles.notifItemMsg}>{n.message}</Text>
                  <Text style={styles.notifItemTime}>{timeAgo(n.time)}</Text>
                </View>
                {!n.read && <View style={styles.unreadDot} />}
              </View>
            )} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 13, color: C.textMuted },
  userName: { fontSize: 20, fontWeight: '700', color: C.gold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 22 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: C.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  scroll: { paddingBottom: 100 },
  balanceCard: { margin: 16, backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.gold + '22', alignItems: 'center' },
  balanceLabel: { fontSize: 11, color: C.textMuted, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  balanceAmount: { fontSize: 40, fontWeight: '700', letterSpacing: -1 },
  balanceSub: { fontSize: 13, color: C.textSec, marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: C.border },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: C.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  debtRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: C.border },
  debtInfo: { flex: 1 },
  debtName: { fontSize: 14, color: C.text },
  debtAmt: { fontSize: 15, fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  catEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  catInfo: { flex: 1 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, color: C.text },
  catAmt: { fontSize: 13, color: C.textSec },
  barBg: { height: 4, backgroundColor: C.elevated, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: C.border },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catIconText: { fontSize: 18 },
  expInfo: { flex: 1 },
  expTitle: { fontSize: 14, color: C.text, fontWeight: '500' },
  expSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  expAmounts: { alignItems: 'flex-end' },
  expTotal: { fontSize: 15, fontWeight: '700', color: C.text },
  expShare: { fontSize: 12, marginTop: 2 },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { fontSize: 28, color: '#080808', fontWeight: '300', lineHeight: 34 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  notifsSheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 40 },
  sheetHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  notifTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  markRead: { fontSize: 13, color: C.gold },
  notifItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  notifUnread: { backgroundColor: C.goldTint },
  notifItemIcon: { fontSize: 22 },
  notifItemBody: { flex: 1 },
  notifItemMsg: { fontSize: 14, color: C.text, lineHeight: 20 },
  notifItemTime: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold },
});
