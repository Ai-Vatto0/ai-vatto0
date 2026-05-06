import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { changePassword, getCoinHistory } from '../../services/api';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuthStore();

  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const toggleHistory = async () => {
    if (historyVisible) {
      setHistoryVisible(false);
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await getCoinHistory();
      setHistory(Array.isArray(data) ? data : data.transactions ?? []);
    } catch {
      Alert.alert('Fehler', 'Verlauf konnte nicht geladen werden');
    } finally {
      setHistoryLoading(false);
      setHistoryVisible(true);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return Alert.alert('Fehler', 'Bitte beide Felder ausfüllen');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Fehler', 'Neues Passwort muss mindestens 6 Zeichen haben');
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Erfolg', 'Passwort wurde geändert');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordVisible(false);
    } catch (err: any) {
      Alert.alert('Fehler', err.message || 'Passwort konnte nicht geändert werden');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshUser();
      Alert.alert('Aktualisiert', 'Deine Daten wurden aktualisiert');
    } catch {
      Alert.alert('Fehler', 'Daten konnten nicht aktualisiert werden');
    }
  };

  const handleLogout = () => {
    Alert.alert('Ausloggen', 'Wirklich ausloggen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Ausloggen',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.headerBg}>
        <LinearGradient
          colors={['#7C3AED22', '#0D0D1A']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.avatarWrapper}>
          <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </LinearGradient>
          {user?.is_admin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.accentGold} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Coin Balance Card */}
      <View style={styles.section}>
        <LinearGradient
          colors={['#F59E0B22', '#1E1E35']}
          style={styles.coinCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.coinCardHeader}>
            <View style={styles.coinLeft}>
              <Ionicons name="logo-bitcoin" size={28} color={Colors.coinGold} />
              <View>
                <Text style={styles.coinLabel}>Coin-Guthaben</Text>
                <Text style={styles.coinAmount}>{user?.coins ?? 0} Coins</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.historyBtn} onPress={toggleHistory}>
              {historyLoading ? (
                <ActivityIndicator size="small" color={Colors.accentGold} />
              ) : (
                <>
                  <Ionicons
                    name={historyVisible ? 'chevron-up' : 'time-outline'}
                    size={16}
                    color={Colors.accentGold}
                  />
                  <Text style={styles.historyBtnText}>Verlauf</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {historyVisible && (
            <View style={styles.historyList}>
              <View style={styles.divider} />
              {history.length === 0 ? (
                <Text style={styles.emptyText}>Noch keine Transaktionen</Text>
              ) : (
                history.slice(0, 20).map((tx: any, i: number) => (
                  <View key={tx.id ?? i} style={styles.txRow}>
                    <Ionicons
                      name={tx.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={18}
                      color={tx.type === 'credit' ? Colors.success : Colors.error}
                    />
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.description || (tx.type === 'credit' ? 'Gutschrift' : 'Abbuchung')}
                    </Text>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: tx.type === 'credit' ? Colors.success : Colors.error },
                      ]}
                    >
                      {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Einstellungen</Text>

        {/* Admin Panel — only for admins */}
        {user?.is_admin && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '33' }]}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Admin Panel</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Passwort ändern */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setPasswordVisible(!passwordVisible)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: Colors.accent + '33' }]}>
            <Ionicons name="lock-closed" size={20} color={Colors.accent} />
          </View>
          <Text style={styles.menuText}>Passwort ändern</Text>
          <Ionicons
            name={passwordVisible ? 'chevron-up' : 'chevron-forward'}
            size={18}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        {passwordVisible && (
          <View style={styles.passwordForm}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Aktuelles Passwort"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.savePasswordBtn}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.savePasswordGradient}>
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.savePasswordText}>Passwort speichern</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Daten aktualisieren */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleRefreshData}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: Colors.success + '33' }]}>
            <Ionicons name="refresh" size={20} color={Colors.success} />
          </View>
          <Text style={styles.menuText}>Daten aktualisieren</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Ausloggen */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemDanger]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: Colors.error + '22' }]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          </View>
          <Text style={[styles.menuText, { color: Colors.error }]}>Ausloggen</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.error + '88'} />
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.versionText}>Snova Studio v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 48,
  },
  headerBg: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentGold + '22',
    borderWidth: 1,
    borderColor: Colors.accentGold + '55',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  coinCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accentGold + '33',
  },
  coinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  coinAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.coinGold,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentGold + '22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accentGold + '44',
  },
  historyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  historyList: {
    gap: 10,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txDesc: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemDanger: {
    borderColor: Colors.error + '33',
    backgroundColor: Colors.error + '0A',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  passwordForm: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: -4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  savePasswordBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  savePasswordGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePasswordText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  versionText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 32,
    marginBottom: 8,
  },
});
