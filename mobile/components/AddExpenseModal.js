import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { C, CATEGORIES, CURRENCIES } from '../data/mockData';

const SPLIT_MODES = [{ id: 'equal', label: 'Equal' }, { id: 'percentage', label: 'Percent' }, { id: 'exact', label: 'Exact' }];

export default function AddExpenseModal({ visible, onClose, groups, members, currentUserId, defaultGroupId, onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [currency, setCurrency] = useState('USD');
  const [groupId, setGroupId] = useState(defaultGroupId || groups[0]?.id || '');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitMode, setSplitMode] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (visible) { setGroupId(defaultGroupId || groups[0]?.id || ''); setPaidBy(currentUserId); }
  }, [visible, defaultGroupId]);

  useEffect(() => {
    const group = groups.find(g => g.id === groupId);
    if (group) setSelectedMembers(group.memberIds);
  }, [groupId, groups]);

  const handleSubmit = () => {
    if (!title.trim() || !amount || !groupId) return;
    onAdd({ groupId, title: title.trim(), amount: parseFloat(amount), currency, category, paidBy, splitAmong: selectedMembers, splitMode, splitValues: {}, date: new Date().toISOString(), notes: '' });
    setTitle(''); setAmount(''); setCategory('Food'); setSplitMode('equal');
  };

  const groupMembers = members.filter(m => { const group = groups.find(g => g.id === groupId); return group?.memberIds.includes(m.id); });
  const toggleMember = (mid) => setSelectedMembers(prev => prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Expense</Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Dinner, Uber, Hotel..." placeholderTextColor={C.textMuted} autoFocus />
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amtRow}>
              <TextInput style={[styles.input, styles.amtInput]} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={C.textMuted} keyboardType="decimal-pad" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.currencyChip, currency === c && styles.currencyChipActive]} onPress={() => setCurrency(c)}>
                    <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {!defaultGroupId && (
              <>
                <Text style={styles.label}>Group</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {groups.map(g => (
                    <TouchableOpacity key={g.id} style={[styles.chip, groupId === g.id && styles.chipActive]} onPress={() => setGroupId(g.id)}>
                      <Text style={styles.chipText}>{g.emoji} {g.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Object.entries(CATEGORIES).map(([cat, info]) => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
                  <Text style={styles.chipText}>{info.emoji} {cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Paid By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {groupMembers.map(m => (
                <TouchableOpacity key={m.id} style={[styles.chip, paidBy === m.id && styles.chipActive]} onPress={() => setPaidBy(m.id)}>
                  <Text style={styles.chipText}>{m.avatar} {m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Split</Text>
            <View style={styles.splitRow}>
              {SPLIT_MODES.map(m => (
                <TouchableOpacity key={m.id} style={[styles.splitChip, splitMode === m.id && styles.splitChipActive]} onPress={() => setSplitMode(m.id)}>
                  <Text style={[styles.splitChipText, splitMode === m.id && styles.splitChipTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Split Among</Text>
            <View style={styles.memberRow}>
              {groupMembers.map(m => (
                <TouchableOpacity key={m.id} style={[styles.memberChip, selectedMembers.includes(m.id) && styles.memberChipActive]} onPress={() => toggleMember(m.id)}>
                  <View style={[styles.memberDot, { backgroundColor: m.color }]} />
                  <Text style={[styles.memberChipText, selectedMembers.includes(m.id) && styles.memberChipTextActive]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {amount && selectedMembers.length > 0 && splitMode === 'equal' && (
              <View style={styles.perPersonRow}>
                <Text style={styles.perPersonText}>{selectedMembers.length} people · ${(parseFloat(amount || 0) / selectedMembers.length).toFixed(2)} each</Text>
              </View>
            )}
            <TouchableOpacity style={styles.addBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%', paddingBottom: 40 },
  handle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 12, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border },
  amtRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amtInput: { flex: 1 },
  currencyRow: { flexGrow: 0 },
  currencyChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginRight: 6 },
  currencyChipActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  currencyText: { fontSize: 13, color: C.textSec, fontWeight: '500' },
  currencyTextActive: { color: C.gold },
  chipRow: { marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginRight: 8 },
  chipActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  chipText: { fontSize: 13, color: C.textSec },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitChip: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  splitChipActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  splitChipText: { fontSize: 13, color: C.textSec },
  splitChipTextActive: { color: C.gold, fontWeight: '600' },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  memberChipActive: { backgroundColor: C.goldTint, borderColor: C.gold + '44' },
  memberDot: { width: 8, height: 8, borderRadius: 4 },
  memberChipText: { fontSize: 13, color: C.textSec },
  memberChipTextActive: { color: C.gold },
  perPersonRow: { marginTop: 12, backgroundColor: C.elevated, borderRadius: 8, padding: 10, alignItems: 'center' },
  perPersonText: { fontSize: 13, color: C.textSec },
  addBtn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  addBtnText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelBtnText: { color: C.textSec, fontSize: 15 },
});
