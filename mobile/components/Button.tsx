import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.base, style]} activeOpacity={0.8}>
        <LinearGradient colors={['#7C6FFF', '#FF6B9D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{title}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const bgColor = variant === 'secondary' ? Colors.surfaceLight : variant === 'danger' ? 'rgba(244,67,54,0.2)' : 'transparent';
  const textColor = variant === 'danger' ? Colors.error : Colors.textPrimary;
  const borderColor = variant === 'danger' ? Colors.error : Colors.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, { backgroundColor: bgColor, borderWidth: 1, borderColor, borderRadius: 12 }, style]}
      activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 12, overflow: 'hidden' },
  gradient: { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  text: { fontWeight: '600', fontSize: 15, paddingVertical: 14, paddingHorizontal: 24, textAlign: 'center' },
});
