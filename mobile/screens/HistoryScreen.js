import React from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { C, fmt, CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

function groupByDate(expenses) {
  const groups = {};
  [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(e => {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default function HistoryScreen() {
  const { state } = useApp();
  const { appData } = state;
  const { expenses, members, groups, settlements } = appData;
  const myId = 'm1';
  const sections = groupByDate(expenses);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSub}>{expenses.length} transactions</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.dateHeader}>{title}</Text>}
        renderItem={({ item: exp }) => {
          const catInfo = CATEGORIES[exp.category] || { emoji: '📦', color: '#888' };
          const paidByMember = members.find(m => m.id === exp.paidBy);
          const group = groups.find(g => g.id === exp.groupId);
          const myShare = exp.splitAmong.includes(myId) ? exp.amount / exp.splitAmong.length : 0;
          const isMyExpense = exp.paidBy === myId;
          return (
            <View style={styles.expRow}>
              <View style={[styles.expIcon, { backgroundColor: catInfo.color + '22' }]}>
                <Text style={{ fontSize: 18 }}>{catInfo.emoji}</Text>
              </View>
              <View style={styles.expInfo}>
                <Text style={styles.expTitle} numberOfLines={1}>{exp.title}</Text>
                <Text style={styles.expSub}>{group?.emoji} {group?.name} · {paidByMember?.name} paid</Text>
              </View>
              <View style={styles.expAmts}>
                <Text style={styles.expTotal}>{fmt(exp.amount, exp.currency)}</Text>
                {myShare > 0 && (
                  <Text style={[styles.expShare, { color: isMyExpense ? C.success : C.danger }]}>
                    {isMyExpense ? `+${fmt(exp.amount - myShare, exp.currency)}` : `-${fmt(myShare, exp.currency)}`}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📋</Text><Text style={styles.emptyText}>No expenses yet</Text></View>}
        ListFooterComponent={
          settlements.length > 0 ? (
            <View style={styles.settlementsSection}>
              <Text style={styles.sectionHeader}>Settlements</Text>
              {[...settlements].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => {
                const from = members.find(m => m.id === s.fromId);
                const to = members.find(m => m.id === s.toId);
                return (
                  <View key={s.id} style={styles.settlementRow}>
                    <Text style={styles.settlementIcon}>✅</Text>
                    <View style={styles.settlementInfo}>
                      <Text style={styles.settlementText}>
                        <Text style={{ color: C.text }}>{from?.name}</Text>
                        <Text style={{ color: C.textMuted }}> paid </Text>
                        <Text style={{ color: C.text }}>{to?.name}</Text>
                      </Text>
                    </View>
                    <Text style={styles.settlementAmt}>{fmt(s.amount, s.currency)}</Text>
                  </View>
                );
              })}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  dateHeader: { fontSize: 12, color: C.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 10, paddingTop: 16 },
  expRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: C.border },
  expIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expTitle: { fontSize: 14, color: C.text, fontWeight: '500' },
  expSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  expAmts: { alignItems: 'flex-end' },
  expTotal: { fontSize: 15, fontWeight: '700', color: C.text },
  expShare: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.textMuted, marginTop: 12 },
  settlementsSection: { marginTop: 16 },
  sectionHeader: { fontSize: 13, color: C.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 10 },
  settlementRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: C.success + '22' },
  settlementIcon: { fontSize: 20 },
  settlementInfo: { flex: 1 },
  settlementText: { fontSize: 14 },
  settlementAmt: { fontSize: 14, fontWeight: '700', color: C.success },
});
