export const C = {
  bg: '#080808', surface: '#0f0f0f', card: '#161616', elevated: '#1c1c1c',
  gold: '#c9a84c', goldHover: '#e8c46a', goldTint: 'rgba(201,168,76,0.12)',
  text: '#f5f0eb', textSec: 'rgba(255,255,255,0.6)', textMuted: 'rgba(255,255,255,0.3)',
  success: '#4ade80', danger: '#f87171', border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.1)',
};

export const CATEGORIES = {
  Food: { emoji: '🍜', color: '#f97316' },
  Housing: { emoji: '🏠', color: '#8b5cf6' },
  Transport: { emoji: '🚗', color: '#3b82f6' },
  Entertainment: { emoji: '🎭', color: '#ec4899' },
  Travel: { emoji: '✈️', color: '#06b6d4' },
  Health: { emoji: '💊', color: '#10b981' },
  Shopping: { emoji: '🛍️', color: '#f59e0b' },
  Other: { emoji: '📦', color: '#6b7280' },
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
export const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
export const GROUP_TYPES = ['Trip', 'Home', 'Couple', 'Work', 'Event', 'Friends'];
export const GROUP_EMOJIS = ['🗼', '🏠', '🌊', '🎉', '💼', '🍻', '🎭', '🏔️', '🌴', '🎸'];
export const AVATAR_COLORS = ['#c9a84c','#ec4899','#3b82f6','#10b981','#f97316','#8b5cf6','#06b6d4','#ef4444'];
export const pickColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const d = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const MOCK_MEMBERS = [
  { id: 'm1', name: 'Devansh', avatar: 'D', color: '#c9a84c', phone: '+1 (555) 000-0001', email: 'devansh@expenseai.com' },
  { id: 'm2', name: 'Sarah', avatar: 'S', color: '#ec4899', phone: '+1 (555) 000-0002', email: 'sarah@example.com' },
  { id: 'm3', name: 'Alex', avatar: 'A', color: '#3b82f6', phone: '+1 (555) 000-0003', email: 'alex@example.com' },
  { id: 'm4', name: 'Jake', avatar: 'J', color: '#10b981', phone: '+1 (555) 000-0004', email: 'jake@example.com' },
];

export const MOCK_GROUPS = [
  { id: 'g1', name: 'Tokyo Trip', emoji: '🗼', color: '#c9a84c', type: 'Trip', memberIds: ['m1','m2','m3','m4'], createdAt: d(30) },
  { id: 'g2', name: 'Apartment', emoji: '🏠', color: '#8b5cf6', type: 'Home', memberIds: ['m1','m4'], createdAt: d(90) },
  { id: 'g3', name: 'Barcelona 2025', emoji: '🌊', color: '#3b82f6', type: 'Trip', memberIds: ['m1','m2','m3'], createdAt: d(15) },
];

export const MOCK_EXPENSES = [
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

export const MOCK_SETTLEMENTS = [
  { id: 's1', groupId: 'g1', fromId: 'm3', toId: 'm1', amount: 50, currency: 'USD', date: d(8), method: 'Venmo' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'DEBT_REMINDER', message: "You owe Jake $67 · Apartment · 7 days overdue", time: d(0), read: false, icon: '⏰' },
  { id: 'n2', type: 'NEW_EXPENSE', message: "Sarah added $145 Tapas Bar El Born · Barcelona 2025", time: d(1), read: false, icon: '🍜' },
  { id: 'n3', type: 'ACE_INSIGHT', message: "Your food spend is up 60% vs last month", time: d(1), read: true, icon: '✨' },
  { id: 'n4', type: 'SETTLED', message: "Alex paid you $50 · Tokyo Trip", time: d(8), read: true, icon: '✅' },
];

export const ACCOUNTS = [
  { id: 'acc_devansh', name: 'Devansh', email: 'devansh@expenseai.com', phone: '+1 (555) 000-0001', password: 'demo123', memberId: 'm1', avatar: 'D', color: '#c9a84c' },
];

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const fmt = (amount, currency = 'USD') => `${CURRENCY_SYMBOLS[currency] || '$'}${Math.abs(amount).toFixed(2)}`;
export const timeAgo = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export function getShareForMember(exp, memberId) {
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

export function computeBalances(expenses, settlements, members, groupId = null) {
  const bal = {};
  members.forEach(m => { bal[m.id] = 0; });
  const exps = groupId ? expenses.filter(e => e.groupId === groupId) : expenses;
  const setts = groupId ? settlements.filter(s => s.groupId === groupId) : settlements;
  exps.forEach(exp => {
    exp.splitAmong.forEach(mid => { bal[mid] = (bal[mid] || 0) - getShareForMember(exp, mid); });
    bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
  });
  setts.forEach(s => { bal[s.fromId] = (bal[s.fromId] || 0) - s.amount; bal[s.toId] = (bal[s.toId] || 0) + s.amount; });
  return bal;
}

export function simplifyDebts(balances) {
  const creds = [], debs = [];
  Object.entries(balances).forEach(([id, b]) => {
    if (b > 0.01) creds.push({ id, amount: b });
    else if (b < -0.01) debs.push({ id, amount: -b });
  });
  creds.sort((a, b) => b.amount - a.amount); debs.sort((a, b) => b.amount - a.amount);
  const debts = []; let ci = 0, di = 0;
  while (ci < creds.length && di < debs.length) {
    const settle = Math.min(creds[ci].amount, debs[di].amount);
    if (settle > 0.01) debts.push({ from: debs[di].id, to: creds[ci].id, amount: settle });
    creds[ci].amount -= settle; debs[di].amount -= settle;
    if (creds[ci].amount < 0.01) ci++; if (debs[di].amount < 0.01) di++;
  }
  return debts;
}
