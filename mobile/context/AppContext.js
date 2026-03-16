import React, { createContext, useContext, useReducer } from 'react';
import { MOCK_MEMBERS, MOCK_GROUPS, MOCK_EXPENSES, MOCK_SETTLEMENTS, MOCK_NOTIFICATIONS, uid, fmt, CATEGORIES, pickColor } from '../data/mockData';

function buildInitialAppState(account) {
  const isMock = account?.id === 'acc_devansh';
  return {
    activeGroupId: null,
    members: isMock ? MOCK_MEMBERS : [{ id: account.memberId, name: account.name, avatar: account.avatar, color: account.color }],
    groups: isMock ? MOCK_GROUPS : [],
    expenses: isMock ? MOCK_EXPENSES : [],
    settlements: isMock ? MOCK_SETTLEMENTS : [],
    notifications: isMock ? MOCK_NOTIFICATIONS : [],
    aiMessages: [{ role: 'assistant', content: `Hi ${account?.name || ''}! I'm Ace, your AI expense assistant. I can add expenses, create groups, and provide spending insights. What can I help you with? 💰` }],
    friends: isMock ? [
      { id: 'f2', memberId: 'm2', name: 'Sarah', avatar: 'S', color: '#ec4899', phone: '+1 (555) 000-0002', email: 'sarah@example.com', status: 'accepted' },
      { id: 'f3', memberId: 'm3', name: 'Alex', avatar: 'A', color: '#3b82f6', phone: '+1 (555) 000-0003', email: 'alex@example.com', status: 'accepted' },
      { id: 'f4', memberId: 'm4', name: 'Jake', avatar: 'J', color: '#10b981', phone: '+1 (555) 000-0004', email: 'jake@example.com', status: 'accepted' },
    ] : [],
    toasts: [],
  };
}

function reducer(state, action) {
  const app = state.appData;
  const setApp = (patch) => ({ ...state, appData: { ...app, ...patch } });
  switch (action.type) {
    case 'LOGIN': return { currentUser: action.account, appData: buildInitialAppState(action.account) };
    case 'LOGOUT': return { currentUser: null, appData: null };
    case 'SIGNUP': {
      const newAccount = { id: uid(), name: action.name, email: action.email, phone: action.phone || '', password: action.password, memberId: 'm_' + uid(), avatar: action.name[0].toUpperCase(), color: pickColor(action.name) };
      return { currentUser: newAccount, appData: buildInitialAppState(newAccount) };
    }
    case 'ADD_EXPENSE': {
      const exp = { id: uid(), ...action.expense };
      const notif = { id: uid(), type: 'NEW_EXPENSE', message: `Added ${fmt(exp.amount, exp.currency)} ${exp.title}`, time: new Date().toISOString(), read: false, icon: CATEGORIES[exp.category]?.emoji || '📦' };
      return setApp({ expenses: [exp, ...app.expenses], notifications: [notif, ...app.notifications] });
    }
    case 'DELETE_EXPENSE': return setApp({ expenses: app.expenses.filter(e => e.id !== action.id) });
    case 'CREATE_GROUP': {
      const g = { id: uid(), ...action.group, createdAt: new Date().toISOString() };
      return setApp({ groups: [g, ...app.groups] });
    }
    case 'SETTLE_UP': {
      const s = { id: uid(), ...action.settlement, date: new Date().toISOString() };
      const notif = { id: uid(), type: 'SETTLED', message: `Settled ${fmt(s.amount, s.currency)}`, time: new Date().toISOString(), read: false, icon: '✅' };
      return setApp({ settlements: [s, ...app.settlements], notifications: [notif, ...app.notifications] });
    }
    case 'ADD_AI_MESSAGE': return setApp({ aiMessages: [...app.aiMessages, action.message] });
    case 'MARK_NOTIFICATIONS_READ': return setApp({ notifications: app.notifications.map(n => ({ ...n, read: true })) });
    default: return state;
  }
}

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { currentUser: null, appData: null });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
