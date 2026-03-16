import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { C } from '../data/mockData';
import { useApp } from '../context/AppContext';

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

export default function AiScreen() {
  const { state, dispatch } = useApp();
  const { appData, currentUser } = state;
  const { aiMessages, expenses, groups } = appData;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    dispatch({ type: 'ADD_AI_MESSAGE', message: userMsg });
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const context = `User: ${currentUser.name}. Groups: ${groups.map(g => g.name).join(', ')}. Total spend: $${totalSpend.toFixed(0)}. Recent: ${expenses.slice(0, 3).map(e => e.title).join(', ')}.`;
    setLoading(true);
    try {
      let assistantContent = '';
      if (ANTHROPIC_KEY && ANTHROPIC_KEY !== 'your_api_key_here') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, system: `You are Ace, an AI assistant for ExpenseAI. Be concise. Context: ${context}`, messages: [...aiMessages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
        });
        const data = await response.json();
        assistantContent = data.content?.[0]?.text || 'Sorry, I had trouble responding.';
      } else {
        const lower = text.toLowerCase();
        if (lower.includes('spend') || lower.includes('total')) assistantContent = `Your total spend across all groups is $${totalSpend.toFixed(2)}. Biggest group: ${groups[0]?.name || 'none'}.`;
        else if (lower.includes('group')) assistantContent = `You have ${groups.length} active groups: ${groups.map(g => `${g.emoji} ${g.name}`).join(', ')}.`;
        else if (lower.includes('owe') || lower.includes('balance')) assistantContent = `Check the Dashboard for your full balance breakdown. Visit each group to see individual debts.`;
        else if (lower.includes('add') || lower.includes('expense')) assistantContent = `Tap the + button on Dashboard or inside a group to add an expense. You can split equally, by percentage, exact amounts, or shares.`;
        else if (lower.includes('settle')) assistantContent = `Go to a group and tap "Settle" next to the debt you want to clear.`;
        else assistantContent = `I'm Ace, your expense AI! I can help you understand your spending, add expenses, or explain balances. What would you like to know? 💰`;
      }
      dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'assistant', content: assistantContent } });
    } catch (e) {
      dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' } });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['How much have I spent total?', 'What groups am I in?', 'Who do I owe money to?', 'How do I settle up?'];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <View style={styles.aceAvatar}><Text style={styles.aceIcon}>✦</Text></View>
        <View>
          <Text style={styles.headerTitle}>Ace</Text>
          <Text style={styles.headerSub}>AI Expense Assistant</Text>
        </View>
      </View>
      <FlatList
        ref={listRef}
        data={aiMessages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          <>
            {loading && <View style={styles.typingBubble}><ActivityIndicator size="small" color={C.gold} /><Text style={styles.typingText}>Ace is thinking...</Text></View>}
            {aiMessages.length === 1 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Try asking:</Text>
                {suggestions.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.suggestion} onPress={() => setInput(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item: msg }) => (
          <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {msg.role === 'assistant' && <View style={styles.aiDot}><Text style={styles.aiDotText}>✦</Text></View>}
            <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>{msg.content}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask Ace anything..." placeholderTextColor={C.textMuted} multiline maxLength={500} />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading}>
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  aceAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.goldTint, borderWidth: 1, borderColor: C.gold + '44', alignItems: 'center', justifyContent: 'center' },
  aceIcon: { fontSize: 18, color: C.gold },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted },
  messages: { padding: 16, paddingBottom: 8 },
  bubble: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.goldTint, borderWidth: 1, borderColor: C.gold + '44', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  aiDotText: { fontSize: 12, color: C.gold },
  bubbleContent: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  aiBubbleContent: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 4 },
  userBubbleContent: { backgroundColor: C.gold, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: C.text, lineHeight: 20 },
  userBubbleText: { color: '#080808' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  typingText: { fontSize: 13, color: C.textMuted },
  suggestionsContainer: { marginTop: 8 },
  suggestionsLabel: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  suggestion: { backgroundColor: C.card, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  suggestionText: { fontSize: 14, color: C.textSec },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, borderTopWidth: 1, borderTopColor: C.border, gap: 8 },
  input: { flex: 1, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: C.elevated },
  sendBtnText: { color: '#080808', fontSize: 18, fontWeight: '700' },
});
