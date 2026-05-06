import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import {
  adminGetUsers,
  adminGetStats,
  adminCreateUser,
  adminAddCoins,
  adminRemoveCoins,
  adminResetPassword,
  adminDeleteUser,
} from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

type CoinAction = 'add' | 'remove';

export default function AdminPanelScreen() {
  const { user } = useAuthStore();

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Coin modal
  const [coinModal, setCoinModal] = useState<{ user: any; action: CoinAction } | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinDesc, setCoinDesc] = useState('');
  const [coinLoading, setCoinLoading] = useState(false);

  // Password reset modal
  const [pwModal, setPwModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Create user modal
  const [createModal, setCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newCoins, setNewCoins] = useState('0');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Guard: redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      Toast.show({ type: 'error', text1: 'Kein Zugriff', text2: 'Nur für Admins' });
      router.back();
    }
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const [usersData, statsData] = await Promise.all([adminGetUsers(), adminGetStats()]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Ladefehler', text2: err.message });
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const handleCoinAction = async () => {
    const amount = parseInt(coinAmount, 10);
    if (!amount || amount <= 0) {
      Toast.show({ type: 'error', text1: 'Ungültige Menge' });
      return;
    }
    setCoinLoading(true);
    try {
      if (coinModal!.action === 'add') {
        await adminAddCoins(coinModal!.user.id, amount, coinDesc || undefined);
        Toast.show({ type: 'success', text1: `+${amount} Coins für ${coinModal!.user.username}` });
      } else {
        await adminRemoveCoins(coinModal!.user.id, amount, coinDesc || undefined);
        Toast.show({ type: 'success', text1: `-${amount} Coins von ${coinModal!.user.username}` });
      }
      setCoinModal(null);
      setCoinAmount('');
      setCoinDesc('');
      await loadData();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: err.message });
    } finally {
      setCoinLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Mindestens 6 Zeichen' });
      return;
    }
    setPwLoading(true);
    try {
      await adminResetPassword(pwModal.id, newPassword);
      Toast.show({ type: 'success', text1: 'Passwort zurückgesetzt' });
      setPwModal(null);
      setNewPassword('');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newEmail.trim() || !newUserPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Alle Pflichtfelder ausfüllen' });
      return;
    }
    setCreateLoading(true);
    try {
      await adminCreateUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newUserPassword.trim(),
        coins: parseInt(newCoins, 10) || 0,
        is_admin: newIsAdmin,
      });
      Toast.show({ type: 'success', text1: 'Nutzer erstellt', text2: newUsername.trim() });
      setCreateModal(false);
      setNewUsername('');
      setNewEmail('');
      setNewUserPassword('');
      setNewCoins('0');
      setNewIsAdmin(false);
      await loadData();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = (u: any) => {
    Alert.alert(
      'Nutzer löschen',
      `"${u.username}" wirklich permanent löschen? Alle Daten werden entfernt.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminDeleteUser(u.id);
              Toast.show({ type: 'success', text1: 'Nutzer gelöscht' });
              await loadData();
              setExpandedUserId(null);
            } catch (err: any) {
              Toast.show({ type: 'error', text1: 'Fehler', text2: err.message });
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateModal(true)}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              label="Nutzer"
              value={stats.totalUsers ?? users.length}
              icon="people"
              color={Colors.primary}
            />
            <StatCard
              label="Generierungen"
              value={stats.totalGenerations ?? 0}
              icon="videocam"
              color={Colors.accent}
            />
            <StatCard
              label="Coins verteilt"
              value={stats.totalCoinsDistributed ?? 0}
              icon="logo-bitcoin"
              color={Colors.coinGold}
            />
            <StatCard
              label="Jobs pending"
              value={stats.pendingJobs ?? 0}
              icon="time"
              color={Colors.warning}
            />
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Nutzer suchen..."
              placeholderTextColor={Colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* User list */}
          <Text style={styles.sectionTitle}>
            Nutzer ({filteredUsers.length}{searchQuery ? ` von ${users.length}` : ''})
          </Text>

          {filteredUsers.map((u) => {
            const isExpanded = expandedUserId === u.id;
            return (
              <View key={u.id} style={styles.userCard}>
                {/* User row */}
                <TouchableOpacity
                  style={styles.userRow}
                  onPress={() => setExpandedUserId(isExpanded ? null : u.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{u.username[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{u.username}</Text>
                      {u.is_admin && (
                        <View style={styles.adminBadge}>
                          <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                  </View>
                  <View style={styles.userCoins}>
                    <Ionicons name="logo-bitcoin" size={13} color={Colors.coinGold} />
                    <Text style={styles.userCoinsText}>{u.coins}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>

                {/* Expanded actions */}
                {isExpanded && (
                  <View style={styles.userActions}>
                    <View style={styles.actionsDivider} />

                    {/* Coins add/remove */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnSuccess]}
                        onPress={() => setCoinModal({ user: u, action: 'add' })}
                      >
                        <Ionicons name="add-circle" size={16} color={Colors.success} />
                        <Text style={[styles.actionBtnText, { color: Colors.success }]}>
                          Coins hinzufügen
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnError]}
                        onPress={() => setCoinModal({ user: u, action: 'remove' })}
                      >
                        <Ionicons name="remove-circle" size={16} color={Colors.error} />
                        <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                          Coins entfernen
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Password reset */}
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnNeutral]}
                      onPress={() => setPwModal(u)}
                    >
                      <Ionicons name="lock-closed" size={16} color={Colors.accent} />
                      <Text style={[styles.actionBtnText, { color: Colors.accent }]}>
                        Passwort zurücksetzen
                      </Text>
                    </TouchableOpacity>

                    {/* Delete — not for admins */}
                    {!u.is_admin && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnDeleteRow]}
                        onPress={() => handleDeleteUser(u)}
                      >
                        <Ionicons name="trash" size={16} color={Colors.error} />
                        <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                          Nutzer löschen
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Keine Nutzer gefunden</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Coin action modal */}
      <Modal visible={!!coinModal} transparent animationType="slide" onRequestClose={() => setCoinModal(null)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCoinModal(null)}
        />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {coinModal?.action === 'add' ? 'Coins hinzufügen' : 'Coins entfernen'}
          </Text>
          <Text style={styles.sheetSubtitle}>Nutzer: {coinModal?.user?.username}</Text>

          <Text style={styles.inputLabel}>Menge *</Text>
          <TextInput
            style={styles.modalInput}
            value={coinAmount}
            onChangeText={setCoinAmount}
            placeholder="z.B. 100"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.inputLabel}>Beschreibung (optional)</Text>
          <TextInput
            style={styles.modalInput}
            value={coinDesc}
            onChangeText={setCoinDesc}
            placeholder="z.B. Willkommensbonus"
            placeholderTextColor={Colors.textMuted}
          />

          <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleCoinAction} disabled={coinLoading}>
            <LinearGradient
              colors={coinModal?.action === 'add' ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
              style={styles.sheetConfirmGradient}
            >
              {coinLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sheetConfirmText}>Bestätigen</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setCoinModal(null)}>
            <Text style={styles.sheetCancelText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Password reset modal */}
      <Modal visible={!!pwModal} transparent animationType="slide" onRequestClose={() => setPwModal(null)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setPwModal(null)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Passwort zurücksetzen</Text>
          <Text style={styles.sheetSubtitle}>Nutzer: {pwModal?.username}</Text>

          <Text style={styles.inputLabel}>Neues Passwort *</Text>
          <TextInput
            style={styles.modalInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Mindestens 6 Zeichen"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoFocus
          />

          <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleResetPassword} disabled={pwLoading}>
            <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.sheetConfirmGradient}>
              {pwLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sheetConfirmText}>Passwort setzen</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => { setPwModal(null); setNewPassword(''); }}>
            <Text style={styles.sheetCancelText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Create user modal */}
      <Modal visible={createModal} transparent animationType="slide" onRequestClose={() => setCreateModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setCreateModal(false)} />
        <ScrollView style={styles.bottomSheetScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.bottomSheetInner}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Nutzer erstellen</Text>

            <Text style={styles.inputLabel}>Benutzername *</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="username"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>E-Mail *</Text>
            <TextInput
              style={styles.modalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="email@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Passwort *</Text>
            <TextInput
              style={styles.modalInput}
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              placeholder="Mindestens 6 Zeichen"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Start-Coins</Text>
            <TextInput
              style={styles.modalInput}
              value={newCoins}
              onChangeText={setNewCoins}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />

            <View style={styles.toggleRow}>
              <Text style={styles.inputLabel}>Admin-Rechte</Text>
              <Switch
                value={newIsAdmin}
                onValueChange={setNewIsAdmin}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity
              style={styles.sheetConfirmBtn}
              onPress={handleCreateUser}
              disabled={createLoading}
            >
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.sheetConfirmGradient}>
                {createLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sheetConfirmText}>Nutzer erstellen</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sheetCancelBtn, { marginBottom: 20 }]}
              onPress={() => setCreateModal(false)}
            >
              <Text style={styles.sheetCancelText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  createBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
    gap: 2,
    overflow: 'hidden',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary + '22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  adminBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.coinGold + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.coinGold + '33',
  },
  userCoinsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coinGold,
  },
  userActions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnSuccess: {
    backgroundColor: Colors.success + '11',
    borderColor: Colors.success + '44',
  },
  actionBtnError: {
    backgroundColor: Colors.error + '11',
    borderColor: Colors.error + '44',
  },
  actionBtnNeutral: {
    backgroundColor: Colors.accent + '11',
    borderColor: Colors.accent + '44',
  },
  actionBtnDeleteRow: {
    backgroundColor: Colors.error + '0A',
    borderColor: Colors.error + '33',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  bottomSheetScroll: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetInner: {
    padding: 24,
    gap: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sheetConfirmBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  sheetConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  sheetCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
