import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { getVideos, getVideoStatus, deleteVideo } from '../../services/api';
import { MODEL_LABELS, MODEL_COLORS } from '../../constants/Config';
import Toast from 'react-native-toast-message';

export default function VideosScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try { setVideos(await getVideos()); } catch (e: any) {
      setError(e.message || 'Videos konnten nicht geladen werden');
      Toast.show({ type: 'error', text1: 'Fehler', text2: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      videos.forEach(v => {
        if (v.status === 'processing' || v.status === 'pending') {
          getVideoStatus(v.id)
            .then(updated => {
              if (mounted) setVideos(prev => prev.map(x => x.id === v.id ? updated : x));
            })
            .catch(() => {});
        }
      });
    }, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [videos]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const checkStatus = async (jobId: string) => {
    try {
      const updated = await getVideoStatus(jobId);
      setVideos(prev => prev.map(v => v.id === jobId ? updated : v));
    } catch (e: any) { Toast.show({ type: 'error', text1: e.message }); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Löschen', 'Job wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        try { await deleteVideo(id); load(); } catch (e: any) { Toast.show({ type: 'error', text1: e.message }); }
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Videos</Text>
        <TouchableOpacity onPress={() => router.push('/video/generate')} style={styles.addBtn}>
          <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.addBtnInner}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading && videos.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accentPink} size="large" />
          <Text style={styles.loadingText}>Videos werden geladen...</Text>
        </View>
      )}
      {error && videos.length === 0 && !loading && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentPink} />}>
        {videos.length === 0 && !loading && !error && (
          <View style={styles.empty}>
            <Ionicons name="film-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Noch keine Videos</Text>
            <TouchableOpacity onPress={() => router.push('/video/generate')}>
              <Text style={[styles.emptyAction, { color: Colors.accentPink }]}>Erstes Video generieren →</Text>
            </TouchableOpacity>
          </View>
        )}
        {videos.map((v) => {
          const modelColor = MODEL_COLORS[v.model] || Colors.accent;
          return (
            <View key={v.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.modelBadge, { backgroundColor: modelColor + '20' }]}>
                  <Text style={[styles.modelText, { color: modelColor }]}>{MODEL_LABELS[v.model] || v.model}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(v.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(v.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(v.status) }]}>{v.status}</Text>
                </View>
              </View>
              <Text style={styles.prompt} numberOfLines={2}>{v.prompt}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>{v.duration}s • {v.resolution}</Text>
                <Text style={styles.coinText}>-{v.coins_used} Coins</Text>
              </View>
              <View style={styles.cardActions}>
                {(v.status === 'processing' || v.status === 'pending') && (
                  <TouchableOpacity onPress={() => checkStatus(v.id)} style={styles.actionBtn}>
                    <Ionicons name="refresh" size={14} color={Colors.accent} />
                    <Text style={[styles.actionText, { color: Colors.accent }]}>Status</Text>
                  </TouchableOpacity>
                )}
                {v.result_url && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(v.result_url)}>
                    <Ionicons name="download" size={14} color={Colors.success} />
                    <Text style={[styles.actionText, { color: Colors.success }]}>Download</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(v.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={14} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStatusColor(status: string) {
  if (status === 'completed') return Colors.success;
  if (status === 'failed') return Colors.error;
  return Colors.accent;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  addBtn: { borderRadius: 14 },
  addBtnInner: { padding: 10, borderRadius: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  errorText: { fontSize: 14, color: Colors.error, textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: { marginTop: 12, backgroundColor: Colors.primary + '33', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary },
  retryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  emptyAction: { fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  cardHeader: { flexDirection: 'row', gap: 8 },
  modelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modelText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  prompt: { fontSize: 13, color: Colors.textSecondary },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: Colors.textMuted },
  coinText: { fontSize: 12, color: Colors.coinGold },
  cardActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, fontWeight: '600' },
});
