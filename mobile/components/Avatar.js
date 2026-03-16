import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Avatar({ name, color, size = 36, style }) {
  const initial = name?.[0]?.toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '33', borderColor: color + '66' }, style]}>
      <Text style={[styles.initial, { fontSize: size * 0.38, color }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  initial: { fontWeight: '700' },
});
