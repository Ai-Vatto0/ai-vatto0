import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getCharacters, getStories, getVideos, getCoinBalance } from '../../services/api';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const updateCoins = useAuthStore((s) => s.updateCoins);
  const [stats, setStats] = useState({ characters: 0, stories: 0, videos: 0 });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [chars, stories, videos, coins] = await Promise.all([getCharacters(), getStories(), getVideos(), getCoinBalance()]);
      setStats({ characters: chars.length, stories: stories.length, videos: videos.length });
      setRecentVideos(videos.slice(0, 3));
      updateCoins(coins.coins);
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const quickActions = [
    { icon: 'person-add', label: 'Charakter', color: Colors.primary, route: '/character/create' },
    { icon: 'document-text', label: 'Story', color: Colors.accent, route: '/story/create' },
    { icon: 'film', label: 'Video', color: Colors.accentPink, route: '/video/generate' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      {/* Header */}
      <LinearGradient colors={['#16162A', '#0D0D1A']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Willkommen,</Text>
            <Text style={styles.username}>{user?.username} ✨</Text>
          </View>
          {user?.is_admin && (
            <TouchableOpacity onPress={() => router.push('/admin')} style={styles.adminBtn}>
              <Ionicons name="shield" size={18} color={Colors.accentGold} />
            </TouchableOpacity>
          )}
        </View>
        {/* Coin Balance */}
        <LinearGradient colors={['#F59E0B20', '#F59E0B10']} style={styles.coinCard}>
          <Ionicons name="logo-bitcoin" size={22} color={Colors.coinGold} />
          <Text style={styles.coinAmount}>{user?.coins?.toLocaleString()}</Text>
          <Text style={styles.coinLabel}>Coins</Text>
        </LinearGradient>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Schnellstart</Text>
        <View style={styles.quickActions}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} onPress={() => router.push(a.route as any)} activeOpacity={0.8} style={styles.quickAction}>
              <LinearGradient colors={[a.color + '30', a.color + '10']} style={styles.quickActionInner}>
                <Ionicons name={a.icon as any} size={26} color={a.color} />
                <Text style={[styles.quickActionLabel, { color: a.color }]}>{a.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Übersicht</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Charaktere', value: stats.characters, icon: 'person', color: Colors.primary },
            { label: 'Storys', value: stats.stories, icon: 'document-text', color: Colors.accent },
            { label: 'Videos', value: stats.videos, icon: 'film', color: Colors.accentPink },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Videos */}
        {recentVideos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Letzte Videos</Text>
            {recentVideos.map((v) => (
              <View key={v.id} style={styles.videoCard}>
                <View style={styles.videoIcon}>
                  <Ionicons name="film" size={20} color={Colors.accentPink} />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoModel}>{v.model?.toUpperCase()}</Text>
                  <Text style={styles.videoPrompt} numberOfLines={1}>{v.prompt}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(v.status) + '30' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(v.status) }]}>{v.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function getStatusColor(status: string) {
  if (status === 'completed') return Colors.success;
  if (status === 'failed') return Colors.error;
  return Colors.accent;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 56 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  username: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  adminBtn: { backgroundColor: Colors.accentGold + '20', padding: 10, borderRadius: 12 },
  coinCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.coinGold + '30' },
  coinAmount: { fontSize: 24, fontWeight: '900', color: Colors.coinGold },
  coinLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 1 },
  content: { padding: 20, gap: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 16, marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1 },
  quickActionInner: { borderRadius: 16, padding: 18, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border },
  quickActionLabel: { fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary },
  videoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  videoIcon: { backgroundColor: Colors.accentPink + '20', padding: 10, borderRadius: 10 },
  videoInfo: { flex: 1 },
  videoModel: { fontSize: 11, color: Colors.accentPink, fontWeight: '700' },
  videoPrompt: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
