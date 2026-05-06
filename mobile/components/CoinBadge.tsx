import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export function CoinBadge({ amount, size = 'md' }: { amount: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 12, text: 12, pad: 4 },
    md: { icon: 16, text: 14, pad: 6 },
    lg: { icon: 20, text: 18, pad: 8 },
  };
  const s = sizes[size];

  return (
    <View style={[styles.badge, { paddingHorizontal: s.pad, paddingVertical: s.pad / 2 }]}>
      <Ionicons name="star" size={s.icon} color={Colors.coin} />
      <Text style={[styles.text, { fontSize: s.text }]}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  text: {
    color: Colors.coin,
    fontWeight: '700',
  },
});
