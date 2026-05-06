import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  useEffect(() => { refreshUser(); }, []);
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D1A' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="character/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="character/[id]" />
        <Stack.Screen name="story/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="story/[id]" />
        <Stack.Screen name="video/generate" options={{ presentation: 'modal' }} />
        <Stack.Screen name="admin/index" />
      </Stack>
      <StatusBar style="light" backgroundColor="#0D0D1A" />
      <Toast />
    </>
  );
}
