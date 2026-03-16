import React, { useState, useReducer, useRef, useEffect, useCallback } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, TrendingUp, Bell, Search, Plus, Mic, MicOff, X, Upload, Send, ArrowRight, Filter, Download, Trash2, Edit2, Check, ChevronDown, Calendar, Receipt, Clock, Wallet, DollarSign, TrendingDown, Sparkles, Camera, ArrowLeft, CreditCard, LogOut, UserPlus, LogIn, Percent, Hash, Equal, Sliders, Phone, Link, Copy, UserCheck, Users, MessageCircle, QrCode, Mail, ChevronRight } from 'lucide-react';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: '#080808', surface: '#0f0f0f', card: '#161616', elevated: '#1c1c1c',
  gold: '#c9a84c', goldHover: '#e8c46a', goldTint: 'rgba(201,168,76,0.12)',
  text: '#f5f0eb', textSec: 'rgba(255,255,255,0.6)', textMuted: 'rgba(255,255,255,0.3)',
  success: '#4ade80', danger: '#f87171', border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.1)',
};
const FONT = { serif: '"Cormorant Garamond", Georgia, serif', mono: '"DM Mono", "Courier New", monospace' };

const CATEGORIES = {
  Food: { emoji: '🍜', color: '#f97316' }, Housing: { emoji: '🏠', color: '#8b5cf6' },
  Transport: { emoji: '🚗', color: '#3b82f6' }, Entertainment: { emoji: '🎭', color: '#ec4899' },
  Travel: { emoji: '✈️', color: '#06b6d4' }, Health: { emoji: '💊', color: '#10b981' },
  Shopping: { emoji: '🛍️', color: '#f59e0b' }, Other: { emoji: '📦', color: '#6b7280' },
};
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
const GROUP_TYPES = ['Trip', 'Home', 'Couple', 'Work', 'Event', 'Friends'];
const GROUP_EMOJIS = ['🗼', '🏠', '🌊', '🎉', '💼', '🍻', '🎭', '🏔️', '🌴', '🎸'];
const SPLIT_MODES = [
  { id: 'equal', label: 'Equal', icon: Equal },
  { id: 'percentage', label: 'Percentage', icon: Percent },
  { id: 'exact', label: 'Exact', icon: DollarSign },
  { id: 'shares', label: 'By Shares', icon: Hash },
];

// ─── AUTH ACCOUNTS ────────────────────────────────────────────────────────────
const ACCOUNTS = [
  { id: 'acc_devansh', name: 'Devansh', email: 'devansh@expenseai.com', phone: '+1 (555) 000-0001', password: 'demo123', memberId: 'm1', avatar: 'D', color: '#c9a84c' },
];

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#c9a84c','#ec4899','#3b82f6','#10b981','#f97316','#8b5cf6','#06b6d4','#ef4444'];
const pickColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── MOCK DATA (only for Devansh) ─────────────────────────────────────────────
const d = (n) => new Date(Date.now() - n * 86400000).toISOString();

const MOCK_MEMBERS = [
  { id: 'm1', name: 'Devansh', avatar: 'D', color: '#c9a84c', phone: '+1 (555) 000-0001', email: 'devansh@expenseai.com' },
  { id: 'm2', name: 'Sarah', avatar: 'S', color: '#ec4899', phone: '+1 (555) 000-0002', email: 'sarah@example.com' },
  { id: 'm3', name: 'Alex', avatar: 'A', color: '#3b82f6', phone: '+1 (555) 000-0003', email: 'alex@example.com' },
  { id: 'm4', name: 'Jake', avatar: 'J', color: '#10b981', phone: '+1 (555) 000-0004', email: 'jake@example.com' },
];
const MOCK_GROUPS = [
  { id: 'g1', name: 'Tokyo Trip', emoji: '🗼', color: '#c9a84c', type: 'Trip', memberIds: ['m1','m2','m3','m4'], createdAt: d(30) },
  { id: 'g2', name: 'Apartment', emoji: '🏠', color: '#8b5cf6', type: 'Home', memberIds: ['m1','m4'], createdAt: d(90) },
  { id: 'g3', name: 'Barcelona 2025', emoji: '🌊', color: '#3b82f6', type: 'Trip', memberIds: ['m1','m2','m3'], createdAt: d(15) },
];
const MOCK_EXPENSES = [
  { id: 'e1', groupId: 'g1', title: 'Shinjuku Ramen Dinner', amount: 180, currency: 'USD', category: 'Food', paidBy: 'm1', splitAmong: ['m1','m2','m3','m4'], splitMode: 'equal', splitValues: {}, date: d(2), notes: '' },
  { id: 'e2', groupId: 'g1', title: 'Bullet Train Tickets', amount: 320, currency: 'USD', category: 'Transport', paidBy: 'm2', splitAmong: ['m1','m2','m3','m4'], splitMode: 'equal', splitValues: {}, date: d(3), notes: '' },
  { id: 'e3', groupId: 'g1', title: 'Shibuya Hotel (2 nights)', amount: 540, currency: 'USD', category: 'Housing', paidBy: 'm1', splitAmong: ['m1','m2','m3','m4'], splitMode: 'equal', splitValues: {}, date: d(5), notes: '' },
  { id: 'e4', groupId: 'g1', title: 'TeamLab Borderless Tickets', amount: 96, currency: 'USD', category: 'Entertainment', paidBy: 'm3', splitAmong: ['m1','m2','m3','m4'], splitMode: 'equal', splitValues: {}, date: d(4), notes: '' },
  { id: 'e5', groupId: 'g1', title: 'Tsukiji Market Breakfast', amount: 64, currency: 'USD', category: 'Food', paidBy: 'm4', splitAmong: ['m1','m2','m3','m4'], splitMode: 'equal', splitValues: {}, date: d(4), notes: '' },
  { id: 'e6', groupId: 'g2', title: 'Monthly Rent Share', amount: 2400, currency: 'USD', category: 'Housing', paidBy: 'm4', splitAmong: ['m1','m4'], splitMode: 'equal', splitValues: {}, date: d(10), notes: '' },
  { id: 'e7', groupId: 'g2', title: 'Groceries & Supplies', amount: 134, currency: 'USD', category: 'Food', paidBy: 'm1', splitAmong: ['m1','m4'], splitMode: 'equal', splitValues: {}, date: d(7), notes: '' },
  { id: 'e8', groupId: 'g2', title: 'Internet Bill', amount: 80, currency: 'USD', category: 'Housing', paidBy: 'm4', splitAmong: ['m1','m4'], splitMode: 'equal', splitValues: {}, date: d(14), notes: '' },
  { id: 'e9', groupId: 'g3', title: 'Sagrada Família Tickets', amount: 90, currency: 'EUR', category: 'Entertainment', paidBy: 'm1', splitAmong: ['m1','m2','m3'], splitMode: 'equal', splitValues: {}, date: d(1), notes: '' },
  { id: 'e10', groupId: 'g3', title: 'Tapas Bar El Born', amount: 145, currency: 'EUR', category: 'Food', paidBy: 'm2', splitAmong: ['m1','m2','m3'], splitMode: 'equal', splitValues: {}, date: d(1), notes: '' },
  { id: 'e11', groupId: 'g3', title: 'Barcelona Airbnb (3 nights)', amount: 480, currency: 'EUR', category: 'Housing', paidBy: 'm1', splitAmong: ['m1','m2','m3'], splitMode: 'equal', splitValues: {}, date: d(6), notes: '' },
  { id: 'e12', groupId: 'g3', title: 'Camp Nou Tour', amount: 75, currency: 'EUR', category: 'Entertainment', paidBy: 'm3', splitAmong: ['m1','m2','m3'], splitMode: 'equal', splitValues: {}, date: d(2), notes: '' },
  { id: 'e13', groupId: 'g1', title: 'Harajuku Shopping', amount: 220, currency: 'USD', category: 'Shopping', paidBy: 'm2', splitAmong: ['m1','m2'], splitMode: 'equal', splitValues: {}, date: d(3), notes: '' },
  { id: 'e14', groupId: 'g1', title: 'Akihabara Electronics', amount: 180, currency: 'USD', category: 'Shopping', paidBy: 'm1', splitAmong: ['m1','m3'], splitMode: 'equal', splitValues: {}, date: d(3), notes: '' },
  { id: 'e15', groupId: 'g3', title: 'Flamenco Show Tickets', amount: 120, currency: 'EUR', category: 'Entertainment', paidBy: 'm2', splitAmong: ['m1','m2','m3'], splitMode: 'equal', splitValues: {}, date: d(2), notes: '' },
];
const MOCK_SETTLEMENTS = [
  { id: 's1', groupId: 'g1', fromId: 'm3', toId: 'm1', amount: 50, currency: 'USD', date: d(8), method: 'Venmo' },
];
const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'DEBT_REMINDER', message: "You owe Jake $67 · Apartment · 7 days overdue", time: d(0), read: false, icon: '⏰' },
  { id: 'n2', type: 'NEW_EXPENSE', message: "Sarah added $145 Tapas Bar El Born · Barcelona 2025", time: d(1), read: false, icon: '🍜' },
  { id: 'n3', type: 'ACE_INSIGHT', message: "Your food spend is up 60% vs last month", time: d(1), read: true, icon: '✨' },
  { id: 'n4', type: 'SETTLED', message: "Alex paid you $50 · Tokyo Trip", time: d(8), read: true, icon: '✅' },
];

function buildInitialAppState(account) {
  const isMock = account?.id === 'acc_devansh';
  return {
    view: 'dashboard', activeGroupId: null,
    members: isMock ? MOCK_MEMBERS : [{ id: account.memberId, name: account.name, avatar: account.avatar, color: account.color }],
    groups: isMock ? MOCK_GROUPS : [],
    expenses: isMock ? MOCK_EXPENSES : [],
    settlements: isMock ? MOCK_SETTLEMENTS : [],
    notifications: isMock ? MOCK_NOTIFICATIONS : [],
    aiPanelOpen: true,
    aiMessages: [{ role: 'assistant', content: `Hi${account ? ` ${account.name}` : ''}! I'm **Ace**, your AI expense assistant. I can add expenses, create groups, settle debts, and parse receipts. What can I help you with today? 💰` }],
    isListening: false, showAddExpense: false, showCreateGroup: false, showSettleUp: false,
    showNotifications: false, editingExpense: null, settleTarget: null, toasts: [], dragOver: false,
    pendingReceipt: null,
    friends: isMock ? [
      { id: 'f2', memberId: 'm2', name: 'Sarah', avatar: 'S', color: '#ec4899', phone: '+1 (555) 000-0002', email: 'sarah@example.com', status: 'accepted' },
      { id: 'f3', memberId: 'm3', name: 'Alex', avatar: 'A', color: '#3b82f6', phone: '+1 (555) 000-0003', email: 'alex@example.com', status: 'accepted' },
      { id: 'f4', memberId: 'm4', name: 'Jake', avatar: 'J', color: '#10b981', phone: '+1 (555) 000-0004', email: 'jake@example.com', status: 'accepted' },
    ] : [],
    showInvite: false, inviteGroupId: null,
  };
}

const BASE_STATE = { currentUser: null, appData: null };

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmt = (amount, currency = 'USD') => `${CURRENCY_SYMBOLS[currency] || '$'}${Math.abs(amount).toFixed(2)}`;
const timeAgo = (iso) => { const m = Math.floor((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m/60); if (h < 24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };
const detectCategory = (t) => { t = t.toLowerCase(); if (/ramen|sushi|dinner|lunch|breakfast|food|restaurant|cafe|coffee|pizza|burger|tapas|groceries|market/.test(t)) return 'Food'; if (/hotel|airbnb|rent|apartment|hostel/.test(t)) return 'Housing'; if (/uber|lyft|taxi|train|bus|flight|airport|transport|metro|bullet/.test(t)) return 'Transport'; if (/movie|concert|show|theatre|museum|tour|tickets|entertainment|flamenco|teamlab/.test(t)) return 'Entertainment'; if (/pharmacy|doctor|hospital|health|medicine/.test(t)) return 'Health'; if (/shopping|mall|store|amazon|electronics|clothes/.test(t)) return 'Shopping'; return 'Other'; };

function getShareForMember(exp, memberId) {
  const amt = exp.amount;
  if (!exp.splitAmong.includes(memberId)) return 0;
  switch (exp.splitMode) {
    case 'equal': return amt / exp.splitAmong.length;
    case 'percentage': return amt * ((exp.splitValues?.[memberId] || 0) / 100);
    case 'exact': return exp.splitValues?.[memberId] || 0;
    case 'shares': {
      const total = exp.splitAmong.reduce((s, id) => s + (exp.splitValues?.[id] || 1), 0);
      return amt * ((exp.splitValues?.[memberId] || 1) / total);
    }
    default: return amt / exp.splitAmong.length;
  }
}

function computeBalances(expenses, settlements, members, groupId = null) {
  const bal = {}; members.forEach(m => { bal[m.id] = 0; });
  const exps = groupId ? expenses.filter(e => e.groupId === groupId) : expenses;
  const setts = groupId ? settlements.filter(s => s.groupId === groupId) : settlements;
  exps.forEach(exp => {
    exp.splitAmong.forEach(mid => { bal[mid] = (bal[mid] || 0) - getShareForMember(exp, mid); });
    bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
  });
  setts.forEach(s => { bal[s.fromId] = (bal[s.fromId]||0) - s.amount; bal[s.toId] = (bal[s.toId]||0) + s.amount; });
  return bal;
}

function simplifyDebts(balances) {
  const creds = [], debs = [];
  Object.entries(balances).forEach(([id, b]) => { if (b > 0.01) creds.push({id,amount:b}); else if (b < -0.01) debs.push({id,amount:-b}); });
  creds.sort((a,b)=>b.amount-a.amount); debs.sort((a,b)=>b.amount-a.amount);
  const debts = []; let ci=0, di=0;
  while (ci < creds.length && di < debs.length) {
    const settle = Math.min(creds[ci].amount, debs[di].amount);
    if (settle > 0.01) debts.push({from:debs[di].id, to:creds[ci].id, amount:settle});
    creds[ci].amount -= settle; debs[di].amount -= settle;
    if (creds[ci].amount < 0.01) ci++; if (debs[di].amount < 0.01) di++;
  }
  return debts;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useCountUp(target, dur = 600) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current, diff = target - start;
    if (Math.abs(diff) < 0.01) return;
    const t0 = performance.now();
    const frame = (now) => { const p = Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,3); setVal(start+diff*e); if(p<1) requestAnimationFrame(frame); else prev.current=target; };
    requestAnimationFrame(frame);
  }, [target]);
  return val;
}

// ─── REDUCER ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  const app = state.appData;
  const setApp = (patch) => ({ ...state, appData: { ...app, ...patch } });

  switch (action.type) {
    case 'LOGIN': {
      const appData = buildInitialAppState(action.account);
      return { currentUser: action.account, appData };
    }
    case 'LOGOUT': return BASE_STATE;
    case 'SIGNUP': {
      const newAccount = { id: uid(), name: action.name, email: action.email, phone: action.phone||'', password: action.password, memberId: 'm_'+uid(), avatar: action.name[0].toUpperCase(), color: pickColor(action.name) };
      const appData = buildInitialAppState(newAccount);
      return { currentUser: newAccount, appData };
    }
    case 'SET_VIEW': return setApp({ view: action.view, activeGroupId: action.groupId ?? app.activeGroupId });
    case 'SET_ACTIVE_GROUP': return setApp({ activeGroupId: action.id, view: 'group' });
    case 'ADD_EXPENSE': {
      const exp = { id: uid(), ...action.expense };
      const notif = { id: uid(), type: 'NEW_EXPENSE', message: `Added ${fmt(exp.amount,exp.currency)} ${exp.title}`, time: new Date().toISOString(), read: false, icon: CATEGORIES[exp.category]?.emoji || '📦' };
      return setApp({ expenses: [exp,...app.expenses], notifications: [notif,...app.notifications], showAddExpense: false, toasts: [{id:uid(),msg:`Expense added: ${exp.title}`,type:'success'},...app.toasts] });
    }
    case 'EDIT_EXPENSE': return setApp({ expenses: app.expenses.map(e => e.id===action.expense.id ? action.expense : e), editingExpense: null, showAddExpense: false });
    case 'DELETE_EXPENSE': return setApp({ expenses: app.expenses.filter(e=>e.id!==action.id), toasts: [{id:uid(),msg:'Expense deleted',type:'danger'},...app.toasts] });
    case 'CREATE_GROUP': {
      const g = { id: uid(), ...action.group, createdAt: new Date().toISOString() };
      return setApp({ groups: [g,...app.groups], showCreateGroup: false, toasts: [{id:uid(),msg:`Group "${g.name}" created`,type:'success'},...app.toasts] });
    }
    case 'SETTLE_UP': {
      const s = { id: uid(), ...action.settlement, date: new Date().toISOString() };
      const notif = { id: uid(), type: 'SETTLED', message: `Settled ${fmt(s.amount,s.currency)} with ${app.members.find(m=>m.id===s.toId)?.name}`, time: new Date().toISOString(), read: false, icon: '✅' };
      return setApp({ settlements: [s,...app.settlements], showSettleUp: false, settleTarget: null, notifications: [notif,...app.notifications], toasts: [{id:uid(),msg:'Settlement recorded!',type:'success'},...app.toasts] });
    }
    case 'ADD_AI_MESSAGE': return setApp({ aiMessages: [...app.aiMessages, action.message] });
    case 'TOGGLE_AI_PANEL': return setApp({ aiPanelOpen: !app.aiPanelOpen });
    case 'SET_LISTENING': return setApp({ isListening: action.value });
    case 'SET_PENDING_RECEIPT': return setApp({ pendingReceipt: action.data });
    case 'CLEAR_PENDING_RECEIPT': return setApp({ pendingReceipt: null });
    case 'MARK_ALL_READ': return setApp({ notifications: app.notifications.map(n=>({...n,read:true})) });
    case 'MARK_READ': return setApp({ notifications: app.notifications.map(n=>n.id===action.id?{...n,read:true}:n) });
    case 'TOGGLE_NOTIFICATIONS': return setApp({ showNotifications: !app.showNotifications });
    case 'SHOW_ADD_EXPENSE': return setApp({ showAddExpense: true, editingExpense: action.expense||null });
    case 'HIDE_ADD_EXPENSE': return setApp({ showAddExpense: false, editingExpense: null });
    case 'SHOW_CREATE_GROUP': return setApp({ showCreateGroup: true });
    case 'HIDE_CREATE_GROUP': return setApp({ showCreateGroup: false });
    case 'SHOW_SETTLE': return setApp({ showSettleUp: true, settleTarget: action.target||null });
    case 'HIDE_SETTLE': return setApp({ showSettleUp: false, settleTarget: null });
    case 'DISMISS_TOAST': return setApp({ toasts: app.toasts.filter(t=>t.id!==action.id) });
    case 'SET_DRAG': return setApp({ dragOver: action.value });
    case 'SHOW_INVITE': return setApp({ showInvite: true, inviteGroupId: action.groupId||null });
    case 'HIDE_INVITE': return setApp({ showInvite: false, inviteGroupId: null });
    case 'INVITE_FRIEND': {
      const existing = app.friends.find(f => f.phone===action.friend.phone || f.email===action.friend.email);
      if (existing) return setApp({ toasts:[{id:uid(),msg:`${existing.name} is already your friend`,type:'danger'},...app.toasts] });
      const friend = { id: uid(), memberId: 'm_'+uid(), ...action.friend, status: 'pending' };
      const newMember = { id: friend.memberId, name: friend.name, avatar: friend.name[0].toUpperCase(), color: pickColor(friend.name), phone: friend.phone||'', email: friend.email||'' };
      const notif = { id:uid(), type:'NEW_EXPENSE', message:`Invite sent to ${friend.name}`, time:new Date().toISOString(), read:false, icon:'👋' };
      return setApp({ friends:[...app.friends, friend], members:[...app.members, newMember], notifications:[notif,...app.notifications], toasts:[{id:uid(),msg:`Invite sent to ${friend.name}!`,type:'success'},...app.toasts] });
    }
    case 'ACCEPT_FRIEND': return setApp({ friends: app.friends.map(f=>f.id===action.id?{...f,status:'accepted'}:f) });
    case 'REMOVE_FRIEND': return setApp({ friends: app.friends.filter(f=>f.id!==action.id), members: app.members.filter(m=>m.id!==app.friends.find(f=>f.id===action.id)?.memberId), toasts:[{id:uid(),msg:'Friend removed',type:'danger'},...app.toasts] });
    default: return state;
  }
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function Avatar({ member, size = 32 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:member?.color||C.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.4, fontWeight:700, color:'#000', flexShrink:0, fontFamily:FONT.serif }}>{member?.avatar||'?'}</div>;
}

function MetricCard({ label, value, currency='USD', sub, color, icon:Icon }) {
  const display = useCountUp(value);
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'20px 24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, right:0, width:120, height:120, background:`radial-gradient(circle at top right, ${color||C.goldTint}, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ color:C.textMuted, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</span>
        {Icon && <Icon size={16} color={color||C.gold} />}
      </div>
      <div style={{ fontFamily:FONT.mono, fontSize:28, fontWeight:500, color:color||C.text }}>{CURRENCY_SYMBOLS[currency]}{Math.abs(display).toFixed(2)}</div>
      {sub && <div style={{ color:C.textMuted, fontSize:12, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => { const t = setTimeout(()=>onDismiss(toast.id),3500); return ()=>clearTimeout(t); }, []);
  const bg = toast.type==='success' ? 'rgba(74,222,128,0.15)' : toast.type==='danger' ? 'rgba(248,113,113,0.15)' : C.elevated;
  const border = toast.type==='success' ? 'rgba(74,222,128,0.3)' : toast.type==='danger' ? 'rgba(248,113,113,0.3)' : C.border;
  return (
    <div className="slide-in-up" style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, minWidth:260 }}>
      <div style={{ width:7, height:7, borderRadius:'50%', background:toast.type==='success'?C.success:toast.type==='danger'?C.danger:C.gold, flexShrink:0 }} />
      <span style={{ color:C.text, fontSize:13, flex:1 }}>{toast.msg}</span>
      <button onClick={()=>onDismiss(toast.id)} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}><X size={13} /></button>
    </div>
  );
}

function Modal({ title, onClose, children, width=520 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bounce-in" style={{ background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:16, width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto', boxShadow:`0 25px 80px rgba(0,0,0,0.8)` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${C.border}` }}>
          <h2 style={{ fontFamily:FONT.serif, fontSize:22, color:C.text }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer' }}><X size={18}/></button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>}
      <input {...props} style={{ background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:8, padding:'10px 14px', color:C.text, fontSize:14, outline:'none', transition:'border-color 0.2s', fontFamily:'inherit', width:'100%', ...props.style }}
        onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight} />
    </div>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>}
      <select {...props} style={{ background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:8, padding:'10px 14px', color:C.text, fontSize:14, outline:'none', fontFamily:'inherit', width:'100%', cursor:'pointer', ...props.style }}
        onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant='gold', onClick, disabled, style:s, size='md', icon:Icon }) {
  const base = { border:'none', borderRadius:8, cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, justifyContent:'center', fontWeight:600, transition:'all 0.2s', opacity:disabled?0.5:1, fontFamily:'inherit' };
  const sizes = { sm:{padding:'7px 14px',fontSize:12}, md:{padding:'10px 20px',fontSize:14}, lg:{padding:'13px 28px',fontSize:15} };
  const variants = { gold:{background:C.gold,color:'#000'}, ghost:{background:'transparent',color:C.textSec,border:`1px solid ${C.border}`}, danger:{background:'rgba(248,113,113,0.12)',color:C.danger,border:`1px solid rgba(248,113,113,0.2)`} };
  return (
    <button onClick={onClick} disabled={disabled} style={{...base,...sizes[size],...variants[variant],...s}}
      onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.transform='scale(1.02)'; if(variant==='gold')e.currentTarget.style.background=C.goldHover; }}}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; if(variant==='gold')e.currentTarget.style.background=C.gold; }}>
      {Icon && <Icon size={size==='sm'?12:14}/>}{children}
    </button>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ dispatch }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    setError(''); setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    if (mode === 'login') {
      const acc = ACCOUNTS.find(a => (a.email===form.email || a.phone===form.email) && a.password===form.password);
      if (!acc) { setError('Invalid email/phone or password.'); setLoading(false); return; }
      dispatch({ type:'LOGIN', account:acc });
    } else {
      if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      dispatch({ type:'SIGNUP', name:form.name, email:form.email, phone:form.phone, password:form.password });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflowY:'auto' }}>
      <div style={{ position:'fixed', inset:0, background:`radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.05) 0%, transparent 60%)`, pointerEvents:'none' }} />
      <div className="bounce-in" style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${C.gold},${C.goldHover})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <DollarSign size={26} color="#000" strokeWidth={2.5}/>
          </div>
          <h1 style={{ fontFamily:FONT.serif, fontSize:42, color:C.text, marginBottom:6 }}>ExpenseAI</h1>
          <p style={{ color:C.textMuted, fontSize:14 }}>Luxury expense splitting, powered by AI</p>
        </div>

        <div style={{ background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:16, padding:32, boxShadow:`0 25px 80px rgba(0,0,0,0.5)` }}>
          <div style={{ display:'flex', gap:4, marginBottom:28, background:C.card, borderRadius:10, padding:4 }}>
            {['login','signup'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError('');}} style={{ flex:1, padding:'8px 0', borderRadius:7, border:'none', background:mode===m?C.elevated:'transparent', color:mode===m?C.text:C.textMuted, cursor:'pointer', fontSize:13, fontWeight:mode===m?600:400, transition:'all 0.2s', fontFamily:'inherit' }}>
                {m==='login'?'Sign In':'Create Account'}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode==='signup' && (
              <Input label="Full Name" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your name" />
            )}
            <Input label={mode==='login'?'Email or Phone':'Email'} type={mode==='login'?'text':'email'} value={form.email} onChange={e=>set('email',e.target.value)} placeholder={mode==='login'?'email or +1 (555) 000-0000':'you@example.com'} />
            {mode==='signup' && (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}><Phone size={11}/> Phone Number <span style={{ color:C.textMuted, fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:13 }}>+</span>
                  <input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="1 (555) 000-0000" type="tel" style={{ background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:8, padding:'10px 14px 10px 22px', color:C.text, fontSize:14, outline:'none', transition:'border-color 0.2s', fontFamily:'inherit', width:'100%' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight}/>
                </div>
                <p style={{ color:C.textMuted, fontSize:11 }}>Used for friend invites via SMS</p>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} type={showPass?'text':'password'} placeholder="••••••••" style={{ background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:8, padding:'10px 40px 10px 14px', color:C.text, fontSize:14, outline:'none', transition:'border-color 0.2s', fontFamily:'inherit', width:'100%' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight}/>
                <button onClick={()=>setShowPass(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:11 }}>{showPass?'hide':'show'}</button>
              </div>
            </div>

            {error && <div style={{ color:C.danger, fontSize:12, padding:'8px 12px', background:'rgba(248,113,113,0.08)', borderRadius:7, border:'1px solid rgba(248,113,113,0.2)' }}>{error}</div>}

            <Btn onClick={submit} disabled={loading} size="lg" style={{ marginTop:4 }} icon={mode==='login'?LogIn:UserPlus}>
              {loading ? (mode==='login'?'Signing in…':'Creating account…') : mode==='login' ? 'Sign In' : 'Create Account'}
            </Btn>
          </div>

          {mode==='login' && (
            <div style={{ marginTop:20, padding:14, background:C.card, borderRadius:10, border:`1px solid ${C.border}` }}>
              <p style={{ color:C.textMuted, fontSize:11, marginBottom:6 }}>Demo account — loads sample data:</p>
              <button onClick={()=>{ set('email','devansh@expenseai.com'); set('password','demo123'); }} style={{ background:'none', border:'none', color:C.gold, fontSize:12, cursor:'pointer', padding:0, fontFamily:'inherit' }}>
                devansh@expenseai.com · demo123 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INVITE FRIENDS MODAL ────────────────────────────────────────────────────
function InviteFriendsModal({ state, dispatch, currentUser }) {
  const [tab, setTab] = useState('phone'); // 'phone' | 'link' | 'contacts'
  const [phoneForm, setPhoneForm] = useState({ name:'', phone:'', email:'' });
  const [linkCopied, setLinkCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sending, setSending] = useState(false);

  const inviteLink = `https://expenseai.app/join/${btoa(currentUser.id).slice(0,8)}${state.inviteGroupId ? `?group=${state.inviteGroupId}` : ''}`;
  const groupName = state.groups.find(g=>g.id===state.inviteGroupId)?.name;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).catch(()=>{});
    setLinkCopied(true);
    setTimeout(()=>setLinkCopied(false), 2500);
    dispatch({ type:'DISMISS_TOAST', id:'_' }); // trigger a toast
    dispatch({ type:'ADD_AI_MESSAGE', message:{role:'assistant', content:`Link copied! Share it with your friends to join${groupName?` "${groupName}"`:''}. 🔗`} });
  };

  const sendSMS = async () => {
    if (!phoneForm.phone && !phoneForm.email) return;
    if (!phoneForm.name) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,900));
    dispatch({ type:'INVITE_FRIEND', friend:{ name:phoneForm.name, phone:phoneForm.phone, email:phoneForm.email } });
    setPhoneForm({ name:'', phone:'', email:'' });
    setSmsSent(true);
    setSending(false);
    setTimeout(()=>setSmsSent(false), 3000);
  };

  const tabs = [
    { id:'phone', label:'By Phone', icon:Phone },
    { id:'link', label:'Share Link', icon:Link },
    { id:'contacts', label:'My Friends', icon:UserCheck },
  ];

  return (
    <Modal title={`Invite Friends${groupName?` to ${groupName}`:''}`} onClose={()=>dispatch({type:'HIDE_INVITE'})} width={480}>
      <div style={{ display:'flex', gap:4, marginBottom:24, background:C.card, borderRadius:10, padding:4 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'8px 0', borderRadius:7, border:'none', background:tab===t.id?C.elevated:'transparent', color:tab===t.id?C.gold:C.textMuted, cursor:'pointer', fontSize:12, fontWeight:tab===t.id?600:400, transition:'all 0.2s', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <t.icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {tab==='phone' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <p style={{ color:C.textMuted, fontSize:13 }}>Add a friend by their phone number or email. They'll get an invite to join ExpenseAI{groupName?` and be added to "${groupName}"`:''}.
          </p>
          <Input label="Name" value={phoneForm.name} onChange={e=>setPhoneForm(f=>({...f,name:e.target.value}))} placeholder="Friend's name"/>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:5 }}><Phone size={11}/>Phone Number</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.textMuted, fontSize:13 }}>+</span>
              <input value={phoneForm.phone} onChange={e=>setPhoneForm(f=>({...f,phone:e.target.value}))} placeholder="1 (555) 000-0000" type="tel" style={{ background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:8, padding:'10px 14px 10px 22px', color:C.text, fontSize:14, outline:'none', transition:'border-color 0.2s', fontFamily:'inherit', width:'100%' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight}/>
            </div>
          </div>
          <Input label="Or Email (optional)" type="email" value={phoneForm.email} onChange={e=>setPhoneForm(f=>({...f,email:e.target.value}))} placeholder="friend@example.com"/>
          {smsSent && <div style={{ color:C.success, fontSize:13, padding:'8px 12px', background:'rgba(74,222,128,0.08)', borderRadius:7, border:'1px solid rgba(74,222,128,0.2)', display:'flex', alignItems:'center', gap:8 }}><Check size={14}/>Invite sent!</div>}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Btn onClick={()=>dispatch({type:'HIDE_INVITE'})} variant="ghost">Cancel</Btn>
            <Btn onClick={sendSMS} disabled={sending||(!phoneForm.phone&&!phoneForm.email)||!phoneForm.name} icon={sending?null:MessageCircle}>{sending?'Sending…':'Send Invite'}</Btn>
          </div>
        </div>
      )}

      {tab==='link' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <p style={{ color:C.textMuted, fontSize:13 }}>Share this link with anyone. When they sign up, they'll be connected to you{groupName?` and added to "${groupName}"`:''}.
          </p>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, fontFamily:FONT.mono, fontSize:12, color:C.gold, wordBreak:'break-all' }}>{inviteLink}</div>
            <button onClick={copyLink} style={{ background:linkCopied?'rgba(74,222,128,0.12)':C.elevated, border:`1px solid ${linkCopied?'rgba(74,222,128,0.3)':C.border}`, borderRadius:8, padding:'8px 14px', color:linkCopied?C.success:C.textSec, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:6, transition:'all 0.2s', flexShrink:0 }}>
              {linkCopied?<><Check size={13}/>Copied!</>:<><Copy size={13}/>Copy</>}
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[{icon:MessageCircle,label:'iMessage',color:'#4ade80'},{icon:Mail,label:'Email',color:'#3b82f6'},{icon:QrCode,label:'QR Code',color:'#c9a84c'},{icon:Copy,label:'Copy Link',color:'#ec4899'}].map((item,i)=>(
              <button key={i} onClick={()=>{if(item.label==='Copy Link')copyLink(); else {copyLink(); dispatch({type:'ADD_AI_MESSAGE',message:{role:'assistant',content:`Opening ${item.label} — link ready to paste! 📤`}});}}} style={{ padding:'12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.card, cursor:'pointer', display:'flex', alignItems:'center', gap:10, transition:'all 0.2s', color:C.textSec }} onMouseEnter={e=>{e.currentTarget.style.borderColor=item.color;e.currentTarget.style.color=item.color;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSec;}}>
                <item.icon size={16} color={item.color}/><span style={{ fontSize:13 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab==='contacts' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.friends.length===0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:C.textMuted }}>
              <Users size={32} style={{ margin:'0 auto 10px', opacity:0.3 }}/>
              <p style={{ fontSize:13 }}>No friends yet. Invite some!</p>
            </div>
          ) : state.friends.map(f=>(
            <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:C.card, borderRadius:10, border:`1px solid ${C.border}` }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#000', fontSize:15 }}>{f.avatar||f.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{f.name}</div>
                <div style={{ color:C.textMuted, fontSize:11 }}>{f.phone||f.email||'No contact info'}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {f.status==='pending' ? (
                  <span style={{ fontSize:11, color:C.gold, background:C.goldTint, padding:'3px 8px', borderRadius:20, border:`1px solid rgba(201,168,76,0.2)` }}>Pending</span>
                ) : (
                  <span style={{ fontSize:11, color:C.success, background:'rgba(74,222,128,0.1)', padding:'3px 8px', borderRadius:20, border:'1px solid rgba(74,222,128,0.2)' }}>✓ Friend</span>
                )}
                <button onClick={()=>dispatch({type:'REMOVE_FRIEND',id:f.id})} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', padding:4 }} onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}><X size={13}/></button>
              </div>
            </div>
          ))}
          <div style={{ paddingTop:8, borderTop:`1px solid ${C.border}` }}>
            <Btn onClick={()=>setTab('phone')} variant="ghost" icon={Plus} size="sm">Add More Friends</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── FRIENDS VIEW ─────────────────────────────────────────────────────────────
function FriendsView({ state, dispatch, currentUser }) {
  const [tab, setTab] = useState('friends');
  return (
    <div style={{ padding:24, overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h1 style={{ fontFamily:FONT.serif, fontSize:32, color:C.text }}>Friends</h1>
        <Btn onClick={()=>dispatch({type:'SHOW_INVITE'})} icon={UserPlus} size="sm">Invite Friends</Btn>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:24, background:C.card, borderRadius:10, padding:4, maxWidth:300 }}>
        {[{id:'friends',label:'Friends'},{id:'pending',label:'Pending'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:'7px 0', borderRadius:7, border:'none', background:tab===t.id?C.elevated:'transparent', color:tab===t.id?C.text:C.textMuted, cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'all 0.2s' }}>{t.label}</button>
        ))}
      </div>

      {tab==='friends' && (
        <>
          {state.friends.filter(f=>f.status==='accepted').length===0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:C.textMuted }}>
              <Users size={48} style={{ margin:'0 auto 16px', opacity:0.2 }}/>
              <h3 style={{ fontFamily:FONT.serif, fontSize:20, color:C.text, marginBottom:8 }}>No friends yet</h3>
              <p style={{ fontSize:13, marginBottom:20 }}>Invite your friends to start splitting expenses together.</p>
              <Btn onClick={()=>dispatch({type:'SHOW_INVITE'})} icon={UserPlus}>Invite Your First Friend</Btn>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
              {state.friends.filter(f=>f.status==='accepted').map(f=>{
                const sharedGroups = state.groups.filter(g=>g.memberIds.includes(f.memberId));
                const bal = sharedGroups.reduce((sum,g)=>{ const b=computeBalances(state.expenses,state.settlements,state.members,g.id); return sum+(b[f.memberId]||0); },0);
                return (
                  <div key={f.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#000', fontSize:18, fontFamily:FONT.serif }}>{f.avatar||f.name[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{f.name}</div>
                        <div style={{ color:C.textMuted, fontSize:11 }}>{f.phone||f.email}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div>
                        <div style={{ color:C.textMuted, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Balance</div>
                        <div style={{ fontFamily:FONT.mono, fontSize:14, color:bal>0?C.danger:bal<0?C.success:C.textMuted }}>{bal===0?'Settled up':bal>0?`Owes you ${fmt(bal)}`:`You owe ${fmt(Math.abs(bal))}`}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ color:C.textMuted, fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Groups</div>
                        <div style={{ color:C.textSec, fontSize:13 }}>{sharedGroups.length} shared</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      {sharedGroups.slice(0,3).map(g=><span key={g.id} style={{ fontSize:10, color:C.textSec, background:C.elevated, padding:'2px 7px', borderRadius:20 }}>{g.emoji} {g.name}</span>)}
                    </div>
                    <div style={{ display:'flex', gap:6, marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                      {bal!==0 && <Btn onClick={()=>dispatch({type:'SHOW_SETTLE',target:{from:bal>0?f.memberId:currentUser.memberId,to:bal>0?currentUser.memberId:f.memberId,amount:Math.abs(bal)}})} variant="ghost" size="sm" icon={CreditCard}>Settle</Btn>}
                      <button onClick={()=>dispatch({type:'REMOVE_FRIEND',id:f.id})} style={{ marginLeft:'auto', background:'none', border:'none', color:C.textMuted, cursor:'pointer', fontSize:11 }} onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab==='pending' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {state.friends.filter(f=>f.status==='pending').length===0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:C.textMuted, fontSize:13 }}>No pending invites</div>
          ) : state.friends.filter(f=>f.status==='pending').map(f=>(
            <div key={f.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#000', fontSize:16 }}>{f.avatar||f.name[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{f.name}</div>
                <div style={{ color:C.textMuted, fontSize:11 }}>{f.phone||f.email} · Invite pending</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Btn onClick={()=>dispatch({type:'ACCEPT_FRIEND',id:f.id})} size="sm" icon={Check}>Accept</Btn>
                <Btn onClick={()=>dispatch({type:'REMOVE_FRIEND',id:f.id})} variant="danger" size="sm" icon={X}>Remove</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ state, dispatch, currentUser }) {
  const unread = state.notifications.filter(n=>!n.read).length;
  return (
    <header style={{ height:56, background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', padding:'0 20px', gap:16, flexShrink:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:8 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.gold},${C.goldHover})`, display:'flex', alignItems:'center', justifyContent:'center' }}><DollarSign size={16} color="#000" strokeWidth={2.5}/></div>
        <span style={{ fontFamily:FONT.serif, fontSize:20, color:C.gold }}>ExpenseAI</span>
      </div>
      <div style={{ flex:1, position:'relative', maxWidth:380 }}>
        <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.textMuted }}/>
        <input placeholder="Search expenses, groups…" style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 12px 7px 34px', color:C.text, fontSize:13, outline:'none', fontFamily:'inherit' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border} />
      </div>
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={()=>dispatch({type:'SHOW_INVITE'})} title="Invite Friends" style={{ background:'none', border:'none', color:C.textSec, cursor:'pointer', padding:6, borderRadius:8, transition:'color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color=C.gold} onMouseLeave={e=>e.currentTarget.style.color=C.textSec}><UserPlus size={17}/></button>
        <button onClick={()=>dispatch({type:'TOGGLE_NOTIFICATIONS'})} style={{ background:'none', border:'none', color:C.textSec, cursor:'pointer', position:'relative', padding:6, borderRadius:8, transition:'color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color=C.gold} onMouseLeave={e=>e.currentTarget.style.color=C.textSec}>
          <Bell size={18}/>
          {unread>0 && <span style={{ position:'absolute', top:2, right:2, width:16, height:16, borderRadius:'50%', background:C.gold, color:'#000', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Avatar member={currentUser} size={30}/>
          <span style={{ color:C.textSec, fontSize:13 }}>{currentUser?.name}</span>
        </div>
        <button onClick={()=>dispatch({type:'LOGOUT'})} style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:7, color:C.textMuted, cursor:'pointer', padding:'5px 10px', display:'flex', alignItems:'center', gap:5, fontSize:12, transition:'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color=C.danger} onMouseLeave={e=>e.currentTarget.style.color=C.textMuted}><LogOut size={13}/></button>
      </div>
    </header>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotificationPanel({ state, dispatch }) {
  if (!state.showNotifications) return null;
  return (
    <div className="slide-in-up" style={{ position:'fixed', top:60, right:16, width:360, maxHeight:480, background:C.surface, border:`1px solid ${C.borderLight}`, borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,0.7)', zIndex:500, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:FONT.serif, fontSize:16, color:C.text }}>Notifications</span>
        <button onClick={()=>dispatch({type:'MARK_ALL_READ'})} style={{ background:'none', border:'none', color:C.gold, fontSize:12, cursor:'pointer' }}>Mark all read</button>
      </div>
      <div style={{ overflow:'auto', flex:1 }}>
        {state.notifications.length===0 && <div style={{ padding:30, textAlign:'center', color:C.textMuted, fontSize:13 }}>No notifications</div>}
        {state.notifications.map(n=>(
          <div key={n.id} onClick={()=>dispatch({type:'MARK_READ',id:n.id})} style={{ padding:'12px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:12, cursor:'pointer', background:n.read?'transparent':'rgba(201,168,76,0.04)' }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ color:n.read?C.textSec:C.text, fontSize:13, lineHeight:1.4 }}>{n.message}</p>
              <p style={{ color:C.textMuted, fontSize:11, marginTop:3 }}>{timeAgo(n.time)}</p>
            </div>
            {!n.read && <div style={{ width:7, height:7, borderRadius:'50%', background:C.gold, marginTop:4 }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ state, dispatch, currentUser }) {
  const nav = [{id:'dashboard',label:'Dashboard',icon:Home},{id:'analytics',label:'Analytics',icon:TrendingUp},{id:'history',label:'History',icon:Clock},{id:'friends',label:'Friends',icon:Users}];
  return (
    <aside style={{ width:220, background:C.surface, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
      <div style={{ padding:'16px 12px 8px' }}>
        {nav.map(item=>{
          const pending = item.id==='friends' ? state.friends?.filter(f=>f.status==='pending').length : 0;
          return (
            <button key={item.id} onClick={()=>dispatch({type:'SET_VIEW',view:item.id})} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'none', background:state.view===item.id?C.goldTint:'transparent', color:state.view===item.id?C.gold:C.textSec, cursor:'pointer', transition:'all 0.2s', fontSize:13, fontFamily:'inherit', marginBottom:2, borderLeft:state.view===item.id?`2px solid ${C.gold}`:'2px solid transparent' }}
              onMouseEnter={e=>{ if(state.view!==item.id)e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e=>{ if(state.view!==item.id)e.currentTarget.style.background='transparent'; }}>
              <item.icon size={15}/><span style={{ flex:1, textAlign:'left' }}>{item.label}</span>
              {pending>0 && <span style={{ width:16, height:16, borderRadius:'50%', background:C.gold, color:'#000', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{pending}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ padding:'12px', borderTop:`1px solid ${C.border}`, flex:1, overflow:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ color:C.textMuted, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase' }}>Groups</span>
          <button onClick={()=>dispatch({type:'SHOW_CREATE_GROUP'})} style={{ background:'none', border:'none', color:C.gold, cursor:'pointer', padding:2 }}><Plus size={14}/></button>
        </div>
        {state.groups.length===0 && <p style={{ color:C.textMuted, fontSize:11, padding:'8px 4px' }}>No groups yet. Create one!</p>}
        {state.groups.map(g=>{
          const bal = computeBalances(state.expenses,state.settlements,state.members,g.id)[currentUser.memberId]||0;
          const active = state.view==='group' && state.activeGroupId===g.id;
          return (
            <button key={g.id} onClick={()=>dispatch({type:'SET_ACTIVE_GROUP',id:g.id})} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, border:'none', background:active?C.goldTint:'transparent', cursor:'pointer', transition:'all 0.2s', marginBottom:2, borderLeft:active?`2px solid ${C.gold}`:'2px solid transparent' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=active?C.goldTint:'transparent'}>
              <span style={{ fontSize:18 }}>{g.emoji}</span>
              <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
                <div style={{ color:C.text, fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{g.name}</div>
                <div style={{ fontFamily:FONT.mono, fontSize:10, color:bal>=0?C.success:C.danger }}>{bal>=0?'+':''}{fmt(bal)}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ padding:12, borderTop:`1px solid ${C.border}` }}>
        <button onClick={()=>dispatch({type:'TOGGLE_AI_PANEL'})} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8, border:`1px solid ${state.aiPanelOpen?C.gold:C.border}`, background:state.aiPanelOpen?C.goldTint:'transparent', color:state.aiPanelOpen?C.gold:C.textSec, cursor:'pointer', transition:'all 0.2s', fontSize:13, fontFamily:'inherit' }}>
          <Sparkles size={14}/>{state.aiPanelOpen?'Hide Ace AI':'Open Ace AI'}
        </button>
      </div>
    </aside>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ state, dispatch, currentUser }) {
  const myId = currentUser.memberId;
  const allBal = computeBalances(state.expenses, state.settlements, state.members);
  const myBal = allBal[myId]||0;
  const owedToMe = state.members.filter(m=>m.id!==myId).reduce((s,m)=>{ const b=allBal[m.id]||0; return s+(b<-0.01?-b:0); },0);
  const iOwe = state.members.filter(m=>m.id!==myId).reduce((s,m)=>{ const b=allBal[m.id]||0; return s+(b>0.01?b:0); },0);
  const thisMonth = state.expenses.filter(e=>{ const ed=new Date(e.date); return ed.getMonth()===new Date().getMonth()&&e.splitAmong.includes(myId); }).reduce((s,e)=>s+getShareForMember(e,myId),0);

  const categoryData = Object.entries(state.expenses.reduce((acc,e)=>{ if(!e.splitAmong.includes(myId))return acc; acc[e.category]=(acc[e.category]||0)+getShareForMember(e,myId); return acc; },{})).map(([name,value])=>({name,value:+value.toFixed(2),fill:CATEGORIES[name]?.color||'#666'}));
  const monthlyData = Array.from({length:6},(_,i)=>{ const dt=new Date(); dt.setMonth(dt.getMonth()-(5-i)); const label=dt.toLocaleString('default',{month:'short'}); const spend=state.expenses.filter(e=>{ const ed=new Date(e.date); return ed.getMonth()===dt.getMonth()&&ed.getFullYear()===dt.getFullYear()&&e.splitAmong.includes(myId); }).reduce((s,e)=>s+getShareForMember(e,myId),0); return {month:label,spend:+spend.toFixed(2)}; });
  const recent = [...state.expenses,...state.settlements].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,10);

  if (state.groups.length===0 && state.expenses.length===0) {
    return (
      <div style={{ padding:40, overflowY:'auto', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✨</div>
        <h1 style={{ fontFamily:FONT.serif, fontSize:36, color:C.text, marginBottom:8 }}>Welcome, {currentUser.name}!</h1>
        <p style={{ color:C.textMuted, fontSize:15, maxWidth:400, lineHeight:1.6 }}>You're all set. Create your first group to start tracking shared expenses.</p>
        <div style={{ display:'flex', gap:12, marginTop:28 }}>
          <Btn onClick={()=>dispatch({type:'SHOW_CREATE_GROUP'})} icon={Plus} size="lg">Create a Group</Btn>
          <Btn onClick={()=>dispatch({type:'TOGGLE_AI_PANEL'})} variant="ghost" size="lg" icon={Sparkles}>Ask Ace</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:24, overflowY:'auto', height:'100%' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:FONT.serif, fontSize:32, color:C.text, marginBottom:4 }}>Good morning, {currentUser.name} ✦</h1>
        <p style={{ color:C.textMuted, fontSize:14 }}>Here's your financial overview across all groups</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <MetricCard label="Owed to You" value={owedToMe} color={C.success} icon={TrendingUp} sub={`Across ${state.groups.length} groups`}/>
        <MetricCard label="You Owe" value={iOwe} color={C.danger} icon={TrendingDown} sub="Simplified debts"/>
        <MetricCard label="Net Balance" value={Math.abs(myBal)} color={myBal>=0?C.success:C.danger} icon={Wallet} sub={myBal>=0?'You are ahead':'You are behind'}/>
        <MetricCard label="This Month" value={thisMonth} color={C.gold} icon={Calendar} sub="Your share"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:16 }}>Spend by Category</h3>
          {categoryData.length===0 ? <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:C.textMuted, fontSize:13 }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{categoryData.map((_,i)=><Cell key={i} fill={categoryData[i].fill}/>)}</Pie><Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}} formatter={v=>[`$${v.toFixed(2)}`,'']} /></PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>{categoryData.map((d,i)=><div key={i} style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:8, height:8, borderRadius:2, background:d.fill }}/><span style={{ color:C.textSec, fontSize:11 }}>{d.name}</span></div>)}</div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:16 }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={0.3}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="month" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
              <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}} formatter={v=>[`$${v.toFixed(2)}`,'Spend']}/>
              <Area type="monotone" dataKey="spend" stroke={C.gold} fill="url(#g1)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:16 }}>Groups</h3>
          {state.groups.map(g=>{ const b=computeBalances(state.expenses,state.settlements,state.members,g.id)[myId]||0; return (<div key={g.id} onClick={()=>dispatch({type:'SET_ACTIVE_GROUP',id:g.id})} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer', transition:'opacity 0.2s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.75'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}><span style={{ fontSize:24 }}>{g.emoji}</span><div style={{ flex:1 }}><div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{g.name}</div><div style={{ color:C.textMuted, fontSize:11 }}>{g.memberIds.length} members</div></div><div style={{ textAlign:'right' }}><div style={{ fontFamily:FONT.mono, fontSize:13, color:b>=0?C.success:C.danger }}>{b>=0?'+':''}{fmt(b)}</div><div style={{ color:C.textMuted, fontSize:10 }}>{b>=0?'owed to you':'you owe'}</div></div></div>); })}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:16 }}>Recent Activity</h3>
          {recent.map((item,i)=>{ const isExp='title' in item; const group=state.groups.find(g=>g.id===item.groupId); return (<div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<recent.length-1?`1px solid ${C.border}`:'none' }}><div style={{ width:32, height:32, borderRadius:8, background:C.elevated, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{isExp?(CATEGORIES[item.category]?.emoji||'📦'):'💸'}</div><div style={{ flex:1, minWidth:0 }}><div style={{ color:C.text, fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{isExp?item.title:`${state.members.find(m=>m.id===item.fromId)?.name} → ${state.members.find(m=>m.id===item.toId)?.name}`}</div><div style={{ color:C.textMuted, fontSize:10 }}>{group?.emoji} {group?.name} · {timeAgo(item.date)}</div></div><div style={{ fontFamily:FONT.mono, fontSize:12, color:isExp&&item.paidBy===myId?C.success:C.text, flexShrink:0 }}>{fmt(item.amount,item.currency)}</div></div>); })}
        </div>
      </div>
    </div>
  );
}

// ─── GROUP VIEW ───────────────────────────────────────────────────────────────
function GroupView({ state, dispatch, currentUser }) {
  const myId = currentUser.memberId;
  const group = state.groups.find(g=>g.id===state.activeGroupId);
  if (!group) return null;
  const members = state.members.filter(m=>group.memberIds.includes(m.id));
  const expenses = state.expenses.filter(e=>e.groupId===group.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const balances = computeBalances(state.expenses,state.settlements,state.members,group.id);
  const debts = simplifyDebts(balances);
  return (
    <div style={{ padding:24, overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <button onClick={()=>dispatch({type:'SET_VIEW',view:'dashboard'})} style={{ background:'none', border:'none', color:C.textMuted, cursor:'pointer', padding:4 }}><ArrowLeft size={18}/></button>
        <span style={{ fontSize:36 }}>{group.emoji}</span>
        <div><h1 style={{ fontFamily:FONT.serif, fontSize:28, color:C.text }}>{group.name}</h1><p style={{ color:C.textMuted, fontSize:13 }}>{group.type} · {members.length} members · {expenses.length} expenses</p></div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <Btn onClick={()=>dispatch({type:'SHOW_INVITE',groupId:group.id})} variant="ghost" size="sm" icon={UserPlus}>Invite</Btn>
          <Btn onClick={()=>dispatch({type:'SHOW_SETTLE'})} variant="ghost" size="sm" icon={CreditCard}>Settle Up</Btn>
          <Btn onClick={()=>dispatch({type:'SHOW_ADD_EXPENSE'})} size="sm" icon={Plus}>Add Expense</Btn>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:14 }}>Member Balances</h3>
          {members.map(m=>{ const b=balances[m.id]||0; return (<div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}><Avatar member={m} size={36}/><div style={{ flex:1 }}><div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{m.name}{m.id===myId?' (you)':''}</div><div style={{ width:'100%', height:3, background:C.elevated, borderRadius:2, marginTop:4, overflow:'hidden' }}><div style={{ height:'100%', width:`${Math.min(Math.abs(b)/200*100,100)}%`, background:b>=0?C.success:C.danger, borderRadius:2 }}/></div></div><div style={{ fontFamily:FONT.mono, fontSize:13, color:b>=0?C.success:C.danger }}>{b>=0?'+':''}{fmt(b)}</div></div>); })}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:14 }}>Simplified Debts</h3>
          {debts.length===0 ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:100, color:C.textMuted }}><Check size={24} color={C.success} style={{ marginBottom:8 }}/><span style={{ fontSize:13 }}>All settled up!</span></div>
          : debts.map((d,i)=>{ const from=state.members.find(m=>m.id===d.from); const to=state.members.find(m=>m.id===d.to); return (<div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 12px', background:C.elevated, borderRadius:8 }}><Avatar member={from} size={28}/><span style={{ color:C.textMuted, fontSize:12 }}>owes</span><Avatar member={to} size={28}/><span style={{ color:C.text, fontSize:12, flex:1 }}>{to?.name}</span><span style={{ fontFamily:FONT.mono, fontSize:13, color:C.gold }}>{fmt(d.amount)}</span><button onClick={()=>dispatch({type:'SHOW_SETTLE',target:d})} style={{ background:'none', border:`1px solid ${C.gold}`, borderRadius:6, color:C.gold, fontSize:11, padding:'3px 8px', cursor:'pointer' }}>Settle</button></div>); })}
        </div>
      </div>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
        <h3 style={{ fontFamily:FONT.serif, fontSize:16, color:C.text, marginBottom:16 }}>Expenses</h3>
        {expenses.length===0 ? <div style={{ textAlign:'center', padding:'40px 0', color:C.textMuted }}><Receipt size={32} style={{ marginBottom:12, opacity:0.4 }}/><p>No expenses yet.</p><Btn onClick={()=>dispatch({type:'SHOW_ADD_EXPENSE'})} size="sm" style={{ marginTop:12 }} icon={Plus}>Add First Expense</Btn></div>
        : expenses.map(exp=><ExpenseCard key={exp.id} exp={exp} state={state} dispatch={dispatch} myId={myId}/>)}
      </div>
    </div>
  );
}

function ExpenseCard({ exp, state, dispatch, myId }) {
  const [open, setOpen] = useState(false);
  const paidBy = state.members.find(m=>m.id===exp.paidBy);
  const cat = CATEGORIES[exp.category]||CATEGORIES.Other;
  const myShare = getShareForMember(exp, myId);
  return (
    <div style={{ borderBottom:`1px solid ${C.border}` }}>
      <div onClick={()=>setOpen(!open)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', cursor:'pointer' }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${cat.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{cat.emoji}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{exp.title}</div>
          <div style={{ color:C.textMuted, fontSize:11, marginTop:2 }}>Paid by {paidBy?.name} · {new Date(exp.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {exp.category} · <span style={{ color:C.gold }}>{exp.splitMode}</span></div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontFamily:FONT.mono, fontSize:16, color:C.text }}>{fmt(exp.amount,exp.currency)}</div>
          {myShare>0 && <div style={{ color:C.textMuted, fontSize:11 }}>your share: {fmt(myShare,exp.currency)}</div>}
        </div>
        <ChevronDown size={14} color={C.textMuted} style={{ transform:open?'rotate(180deg)':'', transition:'transform 0.2s', flexShrink:0 }}/>
      </div>
      {open && (
        <div className="fade-in" style={{ padding:'0 0 12px 52px' }}>
          <div style={{ display:'flex', gap:4, marginBottom:10, flexWrap:'wrap' }}>
            {exp.splitAmong.map(mid=>{ const m=state.members.find(x=>x.id===mid); const share=getShareForMember(exp,mid); return <div key={mid} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', background:C.elevated, borderRadius:20, fontSize:11, color:C.textSec }}><Avatar member={m} size={16}/>{m?.name}: {fmt(share,exp.currency)}{exp.splitMode==='percentage'?` (${exp.splitValues?.[mid]||0}%)`:exp.splitMode==='shares'?` (${exp.splitValues?.[mid]||1} share${(exp.splitValues?.[mid]||1)!==1?'s':''})`:''}</div>; })}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={()=>dispatch({type:'SHOW_ADD_EXPENSE',expense:exp})} variant="ghost" size="sm" icon={Edit2}>Edit</Btn>
            <Btn onClick={()=>dispatch({type:'DELETE_EXPENSE',id:exp.id})} variant="danger" size="sm" icon={Trash2}>Delete</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function HistoryView({ state, dispatch }) {
  const [filter, setFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const all = [...state.expenses.map(e=>({...e,_type:'expense'})),...state.settlements.map(s=>({...s,_type:'settlement'}))].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const filtered = all.filter(item=>{ if(filter==='expenses'&&item._type!=='expense')return false; if(filter==='settlements'&&item._type!=='settlement')return false; if(personFilter!=='all'){ if(item._type==='expense')return item.paidBy===personFilter||item.splitAmong.includes(personFilter); return item.fromId===personFilter||item.toId===personFilter; } return true; });
  const exportCSV = () => { const rows=[['Date','Type','Title','Amount','Currency','Group','Paid By']]; filtered.forEach(item=>{ const g=state.groups.find(x=>x.id===item.groupId); if(item._type==='expense')rows.push([item.date,'Expense',item.title,item.amount,item.currency,g?.name||'',state.members.find(m=>m.id===item.paidBy)?.name||'']); else rows.push([item.date,'Settlement',`${state.members.find(m=>m.id===item.fromId)?.name}→${state.members.find(m=>m.id===item.toId)?.name}`,item.amount,item.currency||'USD',g?.name||'',' ']); }); const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='expenseai.csv';a.click(); };
  return (
    <div style={{ padding:24, overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}><h1 style={{ fontFamily:FONT.serif, fontSize:32, color:C.text }}>Full History</h1><Btn onClick={exportCSV} variant="ghost" size="sm" icon={Download}>Export CSV</Btn></div>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all','expenses','settlements'].map(f=><button key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filter===f?C.gold:C.border}`, background:filter===f?C.goldTint:'transparent', color:filter===f?C.gold:C.textSec, cursor:'pointer', fontSize:12, transition:'all 0.2s', textTransform:'capitalize' }}>{f}</button>)}
        <select value={personFilter} onChange={e=>setPersonFilter(e.target.value)} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${C.border}`, background:C.card, color:C.textSec, fontSize:12, outline:'none', cursor:'pointer' }}><option value="all">All people</option>{state.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(item=>{ const g=state.groups.find(x=>x.id===item.groupId); if(item._type==='expense'){ const cat=CATEGORIES[item.category]||CATEGORIES.Other; const pb=state.members.find(m=>m.id===item.paidBy); return (<div key={item.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}><div style={{ width:38,height:38,borderRadius:9,background:`${cat.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>{cat.emoji}</div><div style={{ flex:1 }}><div style={{ color:C.text,fontSize:14 }}>{item.title}</div><div style={{ color:C.textMuted,fontSize:11,marginTop:2 }}>Paid by {pb?.name} · {g?.emoji} {g?.name} · {timeAgo(item.date)} · <span style={{color:C.gold}}>{item.splitMode}</span></div></div><div style={{ fontFamily:FONT.mono,fontSize:15,color:C.text }}>{fmt(item.amount,item.currency)}</div></div>); } else { const from=state.members.find(m=>m.id===item.fromId); const to=state.members.find(m=>m.id===item.toId); return (<div key={item.id} style={{ background:C.card,border:`1px solid rgba(74,222,128,0.15)`,borderRadius:10,padding:'14px 18px',display:'flex',alignItems:'center',gap:12 }}><div style={{ width:38,height:38,borderRadius:9,background:'rgba(74,222,128,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>💸</div><div style={{ flex:1 }}><div style={{ color:C.text,fontSize:14 }}>{from?.name} paid {to?.name}</div><div style={{ color:C.textMuted,fontSize:11,marginTop:2 }}>{g?.emoji} {g?.name} · {item.method} · {timeAgo(item.date)}</div></div><div style={{ fontFamily:FONT.mono,fontSize:15,color:C.success }}>{fmt(item.amount,item.currency)}</div></div>); } })}
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsView({ state }) {
  const perPerson = state.members.map(m=>({ name:m.name, paid:state.expenses.filter(e=>e.paidBy===m.id).reduce((s,e)=>s+e.amount,0), owed:state.expenses.filter(e=>e.splitAmong.includes(m.id)).reduce((s,e)=>s+getShareForMember(e,m.id),0) }));
  const monthlyCategory = Array.from({length:6},(_,i)=>{ const dt=new Date(); dt.setMonth(dt.getMonth()-(5-i)); const cats={}; state.expenses.filter(e=>{ const ed=new Date(e.date); return ed.getMonth()===dt.getMonth()&&ed.getFullYear()===dt.getFullYear(); }).forEach(e=>{ cats[e.category]=(cats[e.category]||0)+e.amount/e.splitAmong.length; }); return {month:dt.toLocaleString('default',{month:'short'}),...cats}; });
  const biggest=[...state.expenses].sort((a,b)=>b.amount-a.amount)[0];
  const mostActive=state.groups.map(g=>({...g,count:state.expenses.filter(e=>e.groupId===g.id).length})).sort((a,b)=>b.count-a.count)[0];
  const totalSettled=state.settlements.reduce((s,x)=>s+x.amount,0);
  return (
    <div style={{ padding:24, overflowY:'auto', height:'100%' }}>
      <h1 style={{ fontFamily:FONT.serif, fontSize:32, color:C.text, marginBottom:24 }}>Analytics</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[{label:'Biggest Expense',value:biggest?.title||'None',sub:fmt(biggest?.amount||0,biggest?.currency),icon:'🏆'},{label:'Most Active Group',value:mostActive?.name||'None',sub:`${mostActive?.count||0} expenses`,icon:mostActive?.emoji||'📊'},{label:'Total Settled',value:fmt(totalSettled),sub:`${state.settlements.length} settlements`,icon:'✅'}].map((c,i)=>(
          <div key={i} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}><div style={{ fontSize:28,marginBottom:8 }}>{c.icon}</div><div style={{ color:C.textMuted,fontSize:11,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4 }}>{c.label}</div><div style={{ color:C.text,fontSize:15,fontWeight:500 }}>{c.value}</div><div style={{ fontFamily:FONT.mono,fontSize:13,color:C.gold,marginTop:2 }}>{c.sub}</div></div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif,fontSize:16,color:C.text,marginBottom:16 }}>Per-Person Contribution</h3>
          <ResponsiveContainer width="100%" height={220}><BarChart data={perPerson} layout="vertical"><XAxis type="number" tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/><YAxis type="category" dataKey="name" tick={{fill:C.textSec,fontSize:12}} axisLine={false} tickLine={false} width={60}/><Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}} formatter={v=>[`$${v.toFixed(2)}`,'']} /><Bar dataKey="paid" name="Paid" fill={C.gold} radius={[0,4,4,0]}/><Bar dataKey="owed" name="Owed" fill={C.elevated} radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20 }}>
          <h3 style={{ fontFamily:FONT.serif,fontSize:16,color:C.text,marginBottom:16 }}>Category Trend</h3>
          <ResponsiveContainer width="100%" height={220}><AreaChart data={monthlyCategory}><XAxis dataKey="month" tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/><Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}}/>{Object.keys(CATEGORIES).map(cat=><Area key={cat} type="monotone" dataKey={cat} stackId="1" stroke={CATEGORIES[cat].color} fill={CATEGORIES[cat].color} fillOpacity={0.6}/>)}</AreaChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── ADD EXPENSE MODAL ────────────────────────────────────────────────────────
function AddExpenseModal({ state, dispatch, currentUser }) {
  const editing = state.editingExpense;
  const defGroup = state.activeGroupId||state.groups[0]?.id||'';
  const defMembers = state.groups.find(g=>g.id===defGroup)?.memberIds||[];
  const [form, setForm] = useState({
    title: editing?.title||'', amount: editing?.amount||'', currency: editing?.currency||'USD',
    category: editing?.category||'Food', paidBy: editing?.paidBy||currentUser.memberId,
    splitAmong: editing?.splitAmong||defMembers, splitMode: editing?.splitMode||'equal',
    splitValues: editing?.splitValues||{}, date: editing?.date?new Date(editing.date).toISOString().split('T')[0]:new Date().toISOString().split('T')[0],
    groupId: editing?.groupId||defGroup, notes: editing?.notes||'',
  });
  const group = state.groups.find(g=>g.id===form.groupId);
  const groupMembers = state.members.filter(m=>group?.memberIds.includes(m.id));
  const set = (k,v) => setForm(f=>{ const n={...f,[k]:v}; if(k==='title')n.category=detectCategory(v); if(k==='groupId'){n.splitAmong=state.groups.find(g=>g.id===v)?.memberIds||[];n.splitValues={};} if(k==='splitAmong'){const sv={...f.splitValues}; v.forEach(id=>{if(!sv[id])sv[id]=f.splitMode==='percentage'?Math.floor(100/v.length):f.splitMode==='shares'?1:0;}); Object.keys(sv).forEach(id=>{if(!v.includes(id))delete sv[id];}); n.splitValues=sv;} return n; });
  const toggleMember = (id) => { const next = form.splitAmong.includes(id)?form.splitAmong.filter(x=>x!==id):[...form.splitAmong,id]; set('splitAmong',next); };
  const setSplitVal = (memberId,val) => setForm(f=>({...f,splitValues:{...f.splitValues,[memberId]:parseFloat(val)||0}}));
  const totalSplit = form.splitAmong.reduce((s,id)=>s+(parseFloat(form.splitValues?.[id])||0),0);
  const pctOk = form.splitMode==='percentage'?Math.abs(totalSplit-100)<0.5:true;
  const exactOk = form.splitMode==='exact'?Math.abs(totalSplit-(parseFloat(form.amount)||0))<0.5:true;

  const submit = () => {
    if (!form.title||!form.amount||!form.groupId||form.splitAmong.length===0) return;
    if (form.splitMode==='percentage'&&!pctOk) return;
    if (form.splitMode==='exact'&&!exactOk) return;
    const expense = {...form, amount:parseFloat(form.amount), date:new Date(form.date).toISOString()};
    dispatch({ type:editing?'EDIT_EXPENSE':'ADD_EXPENSE', expense:editing?{...expense,id:editing.id}:expense });
  };

  const getModeHint = () => {
    if (!form.amount || form.splitAmong.length===0) return null;
    const amt = parseFloat(form.amount)||0;
    switch(form.splitMode) {
      case 'equal': return `Each person: ${fmt(amt/form.splitAmong.length,form.currency)}`;
      case 'percentage': return `Total: ${totalSplit.toFixed(1)}% ${pctOk?'✓':'(must equal 100%)'}`;
      case 'exact': return `Total assigned: ${fmt(totalSplit,form.currency)} of ${fmt(amt,form.currency)} ${exactOk?'✓':'(must equal total)'}`;
      case 'shares': { const total=form.splitAmong.reduce((s,id)=>s+(parseFloat(form.splitValues?.[id])||1),0); return `${total} total shares`; }
      default: return null;
    }
  };

  return (
    <Modal title={editing?'Edit Expense':'New Expense'} onClose={()=>dispatch({type:'HIDE_ADD_EXPENSE'})} width={560}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Title" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Dinner at Nobu"/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Amount" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0.00" style={{ fontFamily:FONT.mono }}/>
          <Sel label="Currency" value={form.currency} onChange={e=>set('currency',e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Category" value={form.category} onChange={e=>set('category',e.target.value)}>{Object.keys(CATEGORIES).map(c=><option key={c} value={c}>{CATEGORIES[c].emoji} {c}</option>)}</Sel>
          <Input label="Date" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Group" value={form.groupId} onChange={e=>set('groupId',e.target.value)}>{state.groups.map(g=><option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}</Sel>
          <Sel label="Paid By" value={form.paidBy} onChange={e=>set('paidBy',e.target.value)}>{groupMembers.map(m=><option key={m.id} value={m.id}>{m.name}{m.id===currentUser.memberId?' (you)':''}</option>)}</Sel>
        </div>

        {/* Split Mode Selector */}
        <div>
          <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Split Method</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {SPLIT_MODES.map(sm=>(
              <button key={sm.id} onClick={()=>set('splitMode',sm.id)} style={{ padding:'8px 4px', borderRadius:8, border:`1px solid ${form.splitMode===sm.id?C.gold:C.border}`, background:form.splitMode===sm.id?C.goldTint:'transparent', color:form.splitMode===sm.id?C.gold:C.textSec, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:4, fontSize:11, fontFamily:'inherit' }}>
                <sm.icon size={14}/>{sm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Members + split values */}
        <div>
          <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Split Among</label>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {groupMembers.map(m=>{
              const selected = form.splitAmong.includes(m.id);
              return (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, border:`1px solid ${selected?C.gold:C.border}`, background:selected?C.goldTint:'transparent', transition:'all 0.2s' }}>
                  <button onClick={()=>toggleMember(m.id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${selected?C.gold:C.border}`, background:selected?C.gold:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{selected && <Check size={11} color="#000"/>}</div>
                    <Avatar member={m} size={24}/>
                    <span style={{ color:C.text, fontSize:13 }}>{m.name}{m.id===currentUser.memberId?' (you)':''}</span>
                  </button>
                  {selected && form.splitMode!=='equal' && (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <input type="number" value={form.splitValues?.[m.id]??( form.splitMode==='shares'?1:0)} onChange={e=>setSplitVal(m.id,e.target.value)} style={{ width:72, background:C.card, border:`1px solid ${C.borderLight}`, borderRadius:6, padding:'5px 8px', color:C.text, fontSize:12, outline:'none', fontFamily:FONT.mono, textAlign:'right' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.borderLight}/>
                      <span style={{ color:C.textMuted, fontSize:11, width:20 }}>
                        {form.splitMode==='percentage'?'%':form.splitMode==='exact'?CURRENCY_SYMBOLS[form.currency]:'sh'}
                      </span>
                    </div>
                  )}
                  {selected && form.splitMode==='equal' && (
                    <span style={{ fontFamily:FONT.mono, fontSize:12, color:C.textSec }}>{fmt((parseFloat(form.amount)||0)/form.splitAmong.length,form.currency)}</span>
                  )}
                </div>
              );
            })}
          </div>
          {getModeHint() && <p style={{ color:(form.splitMode==='percentage'&&!pctOk)||(form.splitMode==='exact'&&!exactOk)?C.danger:C.success, fontSize:12, marginTop:8 }}>{getModeHint()}</p>}
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:8 }}>
          <Btn onClick={()=>dispatch({type:'HIDE_ADD_EXPENSE'})} variant="ghost">Cancel</Btn>
          <Btn onClick={submit} disabled={!form.title||!form.amount||(form.splitMode==='percentage'&&!pctOk)||(form.splitMode==='exact'&&!exactOk)} icon={Check}>{editing?'Save Changes':'Add Expense'}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── CREATE GROUP MODAL ───────────────────────────────────────────────────────
function CreateGroupModal({ state, dispatch, currentUser }) {
  const [form, setForm] = useState({ name:'', emoji:'🎉', type:'Friends', memberIds:[currentUser.memberId], color:C.gold });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggle = (id) => id===currentUser.memberId ? null : set('memberIds', form.memberIds.includes(id)?form.memberIds.filter(x=>x!==id):[...form.memberIds,id]);
  return (
    <Modal title="Create Group" onClose={()=>dispatch({type:'HIDE_CREATE_GROUP'})}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Emoji</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{GROUP_EMOJIS.map(e=><button key={e} onClick={()=>set('emoji',e)} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${form.emoji===e?C.gold:C.border}`, background:form.emoji===e?C.goldTint:C.card, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>{e}</button>)}</div>
        </div>
        <Input label="Group Name" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Europe Trip 2025"/>
        <Sel label="Type" value={form.type} onChange={e=>set('type',e.target.value)}>{GROUP_TYPES.map(t=><option key={t}>{t}</option>)}</Sel>
        <div>
          <label style={{ color:C.textSec, fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Members</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {state.members.map(m=><button key={m.id} onClick={()=>toggle(m.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, border:`1px solid ${form.memberIds.includes(m.id)?C.gold:C.border}`, background:form.memberIds.includes(m.id)?C.goldTint:'transparent', color:form.memberIds.includes(m.id)?C.gold:C.textSec, cursor:m.id===currentUser.memberId?'default':'pointer', fontSize:12 }}><Avatar member={m} size={18}/>{m.name}{m.id===currentUser.memberId?' ✓':''}</button>)}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:8 }}>
          <Btn onClick={()=>dispatch({type:'HIDE_CREATE_GROUP'})} variant="ghost">Cancel</Btn>
          <Btn onClick={()=>dispatch({type:'CREATE_GROUP',group:form})} disabled={!form.name} icon={Plus}>Create Group</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── SETTLE UP MODAL ──────────────────────────────────────────────────────────
function SettleUpModal({ state, dispatch, currentUser }) {
  const target = state.settleTarget;
  const [form, setForm] = useState({ fromId:target?.from||currentUser.memberId, toId:target?.to||state.members.find(m=>m.id!==currentUser.memberId)?.id||'', amount:target?.amount?.toFixed(2)||'', currency:'USD', groupId:state.activeGroupId||state.groups[0]?.id||'', method:'Venmo' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <Modal title="Settle Up" onClose={()=>dispatch({type:'HIDE_SETTLE'})}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'flex-end' }}>
          <Sel label="From" value={form.fromId} onChange={e=>set('fromId',e.target.value)}>{state.members.map(m=><option key={m.id} value={m.id}>{m.name}{m.id===currentUser.memberId?' (you)':''}</option>)}</Sel>
          <div style={{ padding:'0 4px 10px', color:C.textMuted }}><ArrowRight size={16}/></div>
          <Sel label="To" value={form.toId} onChange={e=>set('toId',e.target.value)}>{state.members.map(m=><option key={m.id} value={m.id}>{m.name}{m.id===currentUser.memberId?' (you)':''}</option>)}</Sel>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Input label="Amount" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="0.00" style={{ fontFamily:FONT.mono }}/>
          <Sel label="Currency" value={form.currency} onChange={e=>set('currency',e.target.value)}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</Sel>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Sel label="Group" value={form.groupId} onChange={e=>set('groupId',e.target.value)}>{state.groups.map(g=><option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}</Sel>
          <Sel label="Method" value={form.method} onChange={e=>set('method',e.target.value)}>{['Venmo','Cash','Bank Transfer','PayPal','Zelle','Other'].map(m=><option key={m}>{m}</option>)}</Sel>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:8 }}>
          <Btn onClick={()=>dispatch({type:'HIDE_SETTLE'})} variant="ghost">Cancel</Btn>
          <Btn onClick={()=>dispatch({type:'SETTLE_UP',settlement:{...form,amount:parseFloat(form.amount)}})} disabled={!form.amount||form.fromId===form.toId} icon={Check}>Record Settlement</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── RECEIPT UPLOAD ───────────────────────────────────────────────────────────
function ReceiptUpload({ state, dispatch, onReceiptParsed }) {
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const processFile = async (file) => {
    setLoading(true);
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file); });
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const resp = await fetch('https://api.anthropic.com/v1/messages',{ method:'POST', headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'}, body:JSON.stringify({ model:'claude-sonnet-4-5', max_tokens:1024, messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:file.type,data:base64}},{type:'text',text:'Extract from this receipt: merchant name, date, currency, subtotal, tax, tip, total, and all line items as [{name, price}]. Return ONLY valid JSON, no markdown.'}]}] }) });
      const data = await resp.json();
      const text = data.content?.[0]?.text||'{}';
      const parsed = JSON.parse(text.replace(/```json\n?/g,'').replace(/```\n?/g,''));
      onReceiptParsed(parsed);
    } catch {
      onReceiptParsed({ merchant:'Sample Receipt', date:new Date().toISOString().split('T')[0], total:85.50, subtotal:74.99, tax:7.51, tip:3.00, items:[{name:'Burger',price:18.99},{name:'Fries',price:6.99},{name:'Drinks x3',price:14.97},{name:'Dessert',price:12.99},{name:'Appetizer',price:21.05}] });
    }
    setLoading(false);
    dispatch({ type:'SET_DRAG', value:false });
  };

  return (
    <div style={{ padding:'0 12px 8px' }}>
      {loading ? (
        <div style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:'12px', textAlign:'center' }}>
          <div style={{ width:16, height:16, border:`2px solid ${C.gold}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 6px' }}/>
          <p style={{ color:C.textMuted, fontSize:11 }}>Parsing receipt…</p>
        </div>
      ) : (
        <div onDrop={e=>{e.preventDefault();dispatch({type:'SET_DRAG',value:false});const f=e.dataTransfer.files[0];if(f)processFile(f);}} onDragOver={e=>{e.preventDefault();dispatch({type:'SET_DRAG',value:true});}} onDragLeave={()=>dispatch({type:'SET_DRAG',value:false})}
          style={{ border:`2px dashed ${state.dragOver?C.gold:C.border}`, borderRadius:10, padding:'12px', textAlign:'center', cursor:'pointer', transition:'all 0.2s', background:state.dragOver?C.goldTint:'transparent' }}
          onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e=>e.target.files[0]&&processFile(e.target.files[0])}/>
          <Camera size={18} color={C.textMuted} style={{ margin:'0 auto 4px' }}/>
          <p style={{ color:C.textMuted, fontSize:11 }}>Drop receipt · AI OCR</p>
        </div>
      )}
    </div>
  );
}

// ─── AI PANEL ─────────────────────────────────────────────────────────────────
function AiPanel({ state, dispatch, currentUser }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  const inputRef = useRef();
  const pendingReceiptRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [state.aiMessages]);

  // When a receipt is parsed, auto-send to Ace
  useEffect(() => {
    if (state.pendingReceipt && state.pendingReceipt !== pendingReceiptRef.current) {
      pendingReceiptRef.current = state.pendingReceipt;
      const r = state.pendingReceipt;
      const items = r.items?.map(i=>`• ${i.name}: $${i.price?.toFixed(2)}`).join('\n')||'';
      const msg = `I just uploaded a receipt from **${r.merchant||'Unknown'}**:\n${items}\n\nSubtotal: $${r.subtotal?.toFixed(2)||'?'} · Tax: $${r.tax?.toFixed(2)||'0'} · Tip: $${r.tip?.toFixed(2)||'0'} · **Total: $${r.total?.toFixed(2)||'?'}**\n\nHow would you like to split this? I can split it equally, by percentage, or assign items to specific people.`;
      dispatch({ type:'CLEAR_PENDING_RECEIPT' });
      sendMessage(msg, true);
    }
  }, [state.pendingReceipt]);

  const sendMessage = useCallback(async (text, isSystem=false) => {
    if (!text.trim() || loading) return;
    if (!isSystem) dispatch({ type:'ADD_AI_MESSAGE', message:{role:'user',content:text} });
    else dispatch({ type:'ADD_AI_MESSAGE', message:{role:'user',content:`📄 Receipt uploaded: ${state.pendingReceipt?.merchant||''}`, _receipt:true} });
    setInput('');
    setLoading(true);
    const allBal = computeBalances(state.expenses,state.settlements,state.members);
    const myBal = allBal[currentUser.memberId]||0;
    const context = `User: ${currentUser.name} (id: ${currentUser.memberId}). Groups: ${state.groups.map(g=>`${g.name}(${g.id})`).join(', ')}. Members: ${state.members.map(m=>`${m.name}(${m.id})`).join(', ')}. Balance: ${fmt(myBal)}.`;
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const messages = [...state.aiMessages.slice(-10).map(m=>({role:m.role,content:m.content})),{role:'user',content:text}];
      const resp = await fetch('https://api.anthropic.com/v1/messages',{ method:'POST', headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'}, body:JSON.stringify({ model:'claude-sonnet-4-5', max_tokens:1024, system:`You are Ace, the AI assistant for ExpenceAI. ${context}\nWhen taking actions respond with a JSON block in triple backticks: {"action":"ADD_EXPENSE","data":{title,amount,currency,category,paidBy,splitAmong:[],splitMode,splitValues:{},groupId}} or {"action":"CREATE_GROUP","data":{name,emoji,type,memberIds:[]}} or {"action":"SETTLE_UP","data":{fromId,toId,amount,currency,groupId}}. Be concise. Use member IDs not names. splitMode can be equal/percentage/exact/shares.`, messages }) });
      const data = await resp.json();
      const reply = data.content?.[0]?.text||"I'm having trouble connecting. Please check your API key.";
      const match = reply.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) { try { const act=JSON.parse(match[1]); if(act.action==='ADD_EXPENSE')dispatch({type:'ADD_EXPENSE',expense:{...act.data,id:uid(),date:act.data.date||new Date().toISOString(),notes:''}}); else if(act.action==='CREATE_GROUP')dispatch({type:'CREATE_GROUP',group:{...act.data,emoji:act.data.emoji||'🎉',memberIds:act.data.memberIds||[currentUser.memberId]}}); else if(act.action==='SETTLE_UP')dispatch({type:'SETTLE_UP',settlement:{...act.data,currency:act.data.currency||'USD'}}); } catch {} }
      const clean = reply.replace(/```(?:json)?\n[\s\S]*?\n```/g,'').trim();
      dispatch({ type:'ADD_AI_MESSAGE', message:{role:'assistant',content:clean} });
      if (window.speechSynthesis) { const u=new SpeechSynthesisUtterance(clean.replace(/[*_`#]/g,'').slice(0,200)); u.rate=1.0; window.speechSynthesis.speak(u); }
    } catch { dispatch({ type:'ADD_AI_MESSAGE', message:{role:'assistant',content:'Connection error. Make sure VITE_ANTHROPIC_API_KEY is set in your .env file.'} }); }
    setLoading(false);
  }, [state, dispatch, loading, currentUser]);

  const handleReceiptParsed = useCallback((data) => {
    dispatch({ type:'SET_PENDING_RECEIPT', data });
  }, [dispatch]);

  const suggestions = ['What do I owe?','Add $50 dinner','Show my balance','Who owes the most?'];

  return (
    <div className="slide-in-right" style={{ width:300, background:C.surface, borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, height:'100%' }}>
      <div style={{ padding:'14px 16px 10px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:`linear-gradient(135deg,${C.gold},${C.goldHover})`, display:'flex', alignItems:'center', justifyContent:'center' }}><Sparkles size={13} color="#000"/></div>
          <span style={{ fontFamily:FONT.serif, fontSize:17, color:C.text }}>Ace</span>
          <div style={{ width:6, height:6, borderRadius:'50%', background:C.success }}/>
          <span style={{ color:C.textMuted, fontSize:11, marginLeft:'auto' }}>AI assistant</span>
        </div>
      </div>

      <ReceiptUpload state={state} dispatch={dispatch} onReceiptParsed={handleReceiptParsed}/>

      <div style={{ flex:1, overflowY:'auto', padding:'8px 12px', display:'flex', flexDirection:'column', gap:10 }}>
        {state.aiMessages.map((msg,i)=>(
          <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start', flexDirection:msg.role==='user'?'row-reverse':'row' }}>
            {msg.role==='assistant' && <div style={{ width:22, height:22, borderRadius:5, background:C.goldTint, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}><Sparkles size={11} color={C.gold}/></div>}
            <div style={{ maxWidth:'85%', padding:'8px 11px', borderRadius:msg.role==='user'?'11px 3px 11px 11px':'3px 11px 11px 11px', background:msg.role==='user'?C.goldTint:C.card, border:`1px solid ${msg.role==='user'?'rgba(201,168,76,0.2)':C.border}` }}>
              <p style={{ color:C.text, fontSize:12, lineHeight:1.5, whiteSpace:'pre-wrap' }}>{msg.content.replace(/\*\*(.*?)\*\*/g,'$1')}</p>
            </div>
          </div>
        ))}
        {loading && <div style={{ display:'flex', gap:7 }}><div style={{ width:22, height:22, borderRadius:5, background:C.goldTint, display:'flex', alignItems:'center', justifyContent:'center' }}><Sparkles size={11} color={C.gold}/></div><div style={{ padding:'9px 13px', background:C.card, border:`1px solid ${C.border}`, borderRadius:'3px 11px 11px 11px', display:'flex', gap:3 }}>{[0,1,2].map(i=><div key={i} style={{ width:5, height:5, borderRadius:'50%', background:C.gold, animation:`wave 1s ease-in-out ${i*0.15}s infinite` }}/>)}</div></div>}
        <div ref={endRef}/>
      </div>

      <div style={{ padding:'6px 12px', display:'flex', gap:4, flexWrap:'wrap' }}>
        {suggestions.map((s,i)=><button key={i} onClick={()=>sendMessage(s)} style={{ padding:'3px 9px', borderRadius:20, border:`1px solid ${C.border}`, background:'transparent', color:C.textMuted, fontSize:10, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMuted;}}>{s}</button>)}
      </div>

      <div style={{ padding:'10px 12px', borderTop:`1px solid ${C.border}`, display:'flex', gap:8 }}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage(input))} placeholder="Ask Ace anything…" style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={()=>sendMessage(input)} disabled={!input.trim()||loading} style={{ width:33, height:33, borderRadius:8, background:input.trim()&&!loading?C.gold:C.elevated, border:'none', cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0 }}>
          <Send size={13} color={input.trim()&&!loading?'#000':C.textMuted}/>
        </button>
      </div>
    </div>
  );
}

// ─── VOICE BUTTON ─────────────────────────────────────────────────────────────
function VoiceButton({ state, dispatch, onTranscript }) {
  const [transcript, setTranscript] = useState('');
  const recRef = useRef();
  const start = () => {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert('Speech recognition not supported');return;}
    const r=new SR(); r.continuous=false; r.interimResults=true; r.lang='en-US';
    r.onresult=e=>{ const t=Array.from(e.results).map(r=>r[0].transcript).join(''); setTranscript(t); if(e.results[e.results.length-1].isFinal){onTranscript(t);setTranscript('');dispatch({type:'SET_LISTENING',value:false});} };
    r.onerror=()=>{dispatch({type:'SET_LISTENING',value:false});setTranscript('');};
    r.onend=()=>dispatch({type:'SET_LISTENING',value:false});
    recRef.current=r; r.start(); dispatch({type:'SET_LISTENING',value:true});
  };
  const stop = () => { recRef.current?.stop(); dispatch({type:'SET_LISTENING',value:false}); };
  return (
    <div style={{ position:'fixed', bottom:24, right:state.aiPanelOpen?316:16, zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      {transcript && <div style={{ background:C.elevated, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 12px', maxWidth:180, fontSize:11, color:C.text, textAlign:'center' }}>{transcript}</div>}
      {state.isListening && <div style={{ display:'flex', gap:3, alignItems:'center' }}>{[0,1,2,3,4].map(i=><div key={i} style={{ width:3, borderRadius:3, background:C.gold, animation:`wave 0.8s ease-in-out ${i*0.1}s infinite`, height:`${8+i*4}px` }}/>)}</div>}
      <button onMouseDown={start} onMouseUp={stop} onTouchStart={start} onTouchEnd={stop} className={state.isListening?'pulse-gold':''} style={{ width:50, height:50, borderRadius:'50%', background:state.isListening?C.gold:C.surface, border:`2px solid ${C.gold}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', boxShadow:state.isListening?`0 0 0 8px rgba(201,168,76,0.15)`:`0 4px 20px rgba(0,0,0,0.4)` }}>
        {state.isListening?<MicOff size={19} color="#000"/>:<Mic size={19} color={C.gold}/>}
      </button>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, BASE_STATE);
  const { currentUser, appData: app } = state;

  useEffect(() => {
    if (!app) return;
    const msgs = [
      "Reminder: check your Tokyo Trip balances — you're owed money!",
      "You've split expenses 3 ways this week. Want a summary?",
    ];
    let i = 0;
    const t = setInterval(() => { if(i<msgs.length){ dispatch({type:'ADD_AI_MESSAGE',message:{role:'assistant',content:`💡 ${msgs[i]}`}}); i++; } }, 20000);
    return () => clearInterval(t);
  }, [!!app]);

  if (!currentUser || !app) return <LoginPage dispatch={dispatch}/>;

  const handleVoice = (text) => {
    if (!app.aiPanelOpen) dispatch({type:'TOGGLE_AI_PANEL'});
    dispatch({type:'ADD_AI_MESSAGE',message:{role:'user',content:`🎤 ${text}`}});
  };

  const renderMain = () => {
    switch(app.view) {
      case 'dashboard': return <Dashboard state={app} dispatch={dispatch} currentUser={currentUser}/>;
      case 'group': return <GroupView state={app} dispatch={dispatch} currentUser={currentUser}/>;
      case 'history': return <HistoryView state={app} dispatch={dispatch}/>;
      case 'analytics': return <AnalyticsView state={app}/>;
      case 'friends': return <FriendsView state={app} dispatch={dispatch} currentUser={currentUser}/>;
      default: return <Dashboard state={app} dispatch={dispatch} currentUser={currentUser}/>;
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      <Header state={app} dispatch={dispatch} currentUser={currentUser}/>
      <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative' }}>
        <Sidebar state={app} dispatch={dispatch} currentUser={currentUser}/>
        <main style={{ flex:1, overflow:'hidden' }}>{renderMain()}</main>
        {app.aiPanelOpen && <AiPanel state={app} dispatch={dispatch} currentUser={currentUser}/>}
      </div>

      {app.showAddExpense && <AddExpenseModal state={app} dispatch={dispatch} currentUser={currentUser}/>}
      {app.showCreateGroup && <CreateGroupModal state={app} dispatch={dispatch} currentUser={currentUser}/>}
      {app.showSettleUp && <SettleUpModal state={app} dispatch={dispatch} currentUser={currentUser}/>}
      {app.showInvite && <InviteFriendsModal state={app} dispatch={dispatch} currentUser={currentUser}/>}
      {app.showNotifications && <div style={{ position:'fixed', inset:0, zIndex:499 }} onClick={()=>dispatch({type:'TOGGLE_NOTIFICATIONS'})}/>}
      <NotificationPanel state={app} dispatch={dispatch}/>

      <VoiceButton state={app} dispatch={dispatch} onTranscript={handleVoice}/>

      {!app.aiPanelOpen && (
        <button onClick={()=>dispatch({type:'SHOW_ADD_EXPENSE'})} style={{ position:'fixed', bottom:24, right:24, width:48, height:48, borderRadius:'50%', background:C.gold, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 20px rgba(201,168,76,0.4)`, zIndex:100 }} onMouseEnter={e=>{e.currentTarget.style.background=C.goldHover;e.currentTarget.style.transform='scale(1.08)';}} onMouseLeave={e=>{e.currentTarget.style.background=C.gold;e.currentTarget.style.transform='';}}>
          <Plus size={22} color="#000" strokeWidth={2.5}/>
        </button>
      )}

      <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', gap:8, zIndex:9999, pointerEvents:'none' }}>
        {app.toasts.slice(0,3).map(t=><div key={t.id} style={{ pointerEvents:'all' }}><Toast toast={t} onDismiss={id=>dispatch({type:'DISMISS_TOAST',id})}/></div>)}
      </div>
    </div>
  );
}
