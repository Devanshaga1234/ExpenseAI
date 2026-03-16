import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { C, fmt, CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

const W = Dimensions.get('window').width;
const chartConfig = {
  backgroundColor: C.card, backgroundGradientFrom: C.card, backgroundGradientTo: C.card,
  decimalPlaces: 0, color: (opacity = 1) => `rgba(201,168,76,${opacity})`,
  labelColor: () => 'rgba(255,255,255,0.5)', propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.05)' },
};

export default function AnalyticsScreen() {
  const { state } = useApp();
  const { appData } = state;
  const { expenses, groups } = appData;
  const catSpend = {};
  expenses.forEach(e => { catSpend[e.category] = (catSpend[e.category] || 0) + e.amount; });
  const sortedCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]);
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const groupSpend = {};
  expenses.forEach(e => { groupSpend[e.groupId] = (groupSpend[e.groupId] || 0) + e.amount; });
  const dayLabels = [], dayAmounts = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2));
    dayAmounts.push(Math.round(expenses.filter(e => new Date(e.date).toDateString() === date.toDateString()).reduce((s, e) => s + e.amount, 0)));
  }
  const barData = { labels: dayLabels, datasets: [{ data: dayAmounts.map(v => Math.max(v, 0.01)) }] };
  const pieColors = ['#c9a84c','#ec4899','#3b82f6','#10b981','#f97316','#8b5cf6','#06b6d4','#6b7280'];
  const pieData = sortedCats.slice(0, 6).map(([cat, amt], i) => ({ name: cat, amount: amt, color: pieColors[i % pieColors.length], legendFontColor: 'rgba(255,255,255,0.6)', legendFontSize: 12 }));
  const avgPerExpense = expenses.length > 0 ? totalSpend / expenses.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Your spending insights</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}><Text style={styles.metricVal}>{fmt(totalSpend)}</Text><Text style={styles.metricLabel}>Total Spend</Text></View>
          <View style={styles.metricCard}><Text style={styles.metricVal}>{fmt(avgPerExpense)}</Text><Text style={styles.metricLabel}>Avg / Expense</Text></View>
          <View style={styles.metricCard}><Text style={styles.metricVal}>{expenses.length}</Text><Text style={styles.metricLabel}>Transactions</Text></View>
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Spending (Last 7 Days)</Text>
          {dayAmounts.some(v => v > 0) ? (
            <BarChart data={barData} width={W - 64} height={160} chartConfig={chartConfig} style={{ borderRadius: 12, marginTop: 8 }} fromZero />
          ) : (
            <Text style={styles.noData}>No recent spending data</Text>
          )}
        </View>
        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <PieChart data={pieData} width={W - 64} height={180} chartConfig={chartConfig} accessor="amount" backgroundColor="transparent" paddingLeft="8" absolute />
          </View>
        )}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          {sortedCats.map(([cat, amt]) => {
            const catInfo = CATEGORIES[cat] || { emoji: '📦', color: '#888' };
            const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catEmoji}>{catInfo.emoji}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{cat}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={styles.catPct}>{pct.toFixed(1)}%</Text>
                      <Text style={styles.catAmt}>{fmt(amt)}</Text>
                    </View>
                  </View>
                  <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: catInfo.color }]} /></View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spend by Group</Text>
          {Object.entries(groupSpend).map(([gId, amt]) => {
            const group = groups.find(g => g.id === gId);
            if (!group) return null;
            const pct = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
            return (
              <View key={gId} style={styles.catRow}>
                <Text style={styles.catEmoji}>{group.emoji}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{group.name}</Text>
                    <Text style={styles.catAmt}>{fmt(amt)}</Text>
                  </View>
                  <View style={styles.barBg}><View style={[styles.barFill, { width: `${pct}%`, backgroundColor: group.color || C.gold }]} /></View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 100 },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metricCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  metricVal: { fontSize: 16, fontWeight: '700', color: C.gold },
  metricLabel: { fontSize: 11, color: C.textMuted, marginTop: 4, textAlign: 'center' },
  chartCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  chartTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 },
  noData: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingVertical: 20 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  catEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  catInfo: { flex: 1 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, color: C.text },
  catPct: { fontSize: 12, color: C.textMuted },
  catAmt: { fontSize: 13, color: C.textSec, fontWeight: '600' },
  barBg: { height: 4, backgroundColor: C.elevated, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
});
