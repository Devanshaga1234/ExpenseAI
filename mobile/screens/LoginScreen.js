import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C, ACCOUNTS, pickColor } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { dispatch } = useApp();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = () => {
    const acc = ACCOUNTS.find(a => a.email === email && a.password === password);
    if (acc) dispatch({ type: 'LOGIN', account: acc });
    else Alert.alert('Invalid credentials', 'Try devansh@expenseai.com / demo123');
  };

  const handleSignup = () => {
    if (!name || !email || !password) { Alert.alert('Missing fields', 'Please fill in all required fields.'); return; }
    dispatch({ type: 'SIGNUP', name, email, password, phone });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>✦</Text></View>
          <Text style={styles.appName}>ExpenseAI</Text>
          <Text style={styles.tagline}>Split smarter with AI</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, mode === 'signup' && styles.tabActive]} onPress={() => setMode('signup')}>
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.textMuted} autoCapitalize="words" />
              <Text style={styles.label}>Phone (optional)</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" placeholderTextColor={C.textMuted} keyboardType="phone-pad" />
            </>
          )}
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={C.textMuted} autoCapitalize="none" keyboardType="email-address" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={C.textMuted} secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={mode === 'login' ? handleLogin : handleSignup} activeOpacity={0.85}>
            <Text style={styles.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoBtn} onPress={() => dispatch({ type: 'LOGIN', account: ACCOUNTS[0] })} activeOpacity={0.8}>
            <Text style={styles.demoBtnText}>Try demo account →</Text>
          </TouchableOpacity>
          {mode === 'login' && <Text style={styles.hint}>Demo: devansh@expenseai.com / demo123</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.goldTint, borderWidth: 1, borderColor: C.gold + '44', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, color: C.gold },
  appName: { fontSize: 32, fontWeight: '700', color: C.gold, letterSpacing: 1 },
  tagline: { fontSize: 14, color: C.textSec, marginTop: 6 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border },
  tabs: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: C.gold + '22', borderWidth: 1, borderColor: C.gold + '44' },
  tabText: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  tabTextActive: { color: C.gold, fontWeight: '600' },
  label: { fontSize: 12, color: C.textMuted, marginBottom: 6, marginTop: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 15, borderWidth: 1, borderColor: C.border },
  btn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#080808', fontWeight: '700', fontSize: 16 },
  demoBtn: { alignItems: 'center', marginTop: 14, paddingVertical: 8 },
  demoBtnText: { color: C.gold, fontSize: 14 },
  hint: { textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 8 },
});
