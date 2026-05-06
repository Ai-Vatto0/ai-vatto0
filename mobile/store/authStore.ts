import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, getMe } from '../services/api';

interface User {
  id: string; username: string; email: string; coins: number; is_admin: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateCoins: (coins: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const data = await apiLogin(email, password);
    await AsyncStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null });
  },

  refreshUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { set({ isLoading: false }); return; }
      set({ token });
      const user = await getMe();
      set({ user, isLoading: false });
    } catch {
      await AsyncStorage.removeItem('token');
      set({ token: null, user: null, isLoading: false });
    }
  },

  updateCoins: (coins) => set((state) => ({ user: state.user ? { ...state.user, coins } : null })),
}));
