import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/Colors';
import { API_URL } from '../../constants/Config';

const PLATFORM_ICONS: Record<string, string> = { TikTok: '🎵', 'YouTube Shorts': '▶️', 'Instagram Reels': '📸', Sonstiges: '🎬' };

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await axios.get(`${API_URL}/api/stories`); setProjects(res.data); } catch {}
  };
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  useEffect(() => { load(); }, []);

  const deleteProject = (id: string, name: string) => {
    Alert.alert('Löschen', `"${name}" löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        await axios.delete(`${API_URL}/api/stories/${id}`);
        setProjects(prev => prev.filter(p => p.id !== id));
      }},
    ]);
  };

  const statusColor = (s: string) => s === 'done' ? Colors.success : s === 'active' ? Colors.primary : Colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projekte</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/story/create')} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {projects.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyTitle}>Noch keine Projekte</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/story/create')}>
              <Text style={styles.emptyBtnText}>+ Projekt erstellen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => router.push(`/story/${p.id}` as any)} activeOpacity={0.8}>
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.platformIcon}>{PLATFORM_ICONS[p.target_platform] || '🎬'}</Text>
                  <View style={styles.info}>
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.meta}>{p.genre || 'Kein Genre'} · {p.language}</Text>
                    {p.mood ? <Text style={styles.mood}>{p.mood}</Text> : null}
                  </View>
                  <View style={styles.right}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(p.status) }]} />
                    <TouchableOpacity onPress={() => deleteProject(p.id, p.name)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 12, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptyBtn: { marginTop: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  card: { padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  platformIcon: { fontSize: 28 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.primary },
  mood: { fontSize: 13, color: Colors.textSecondary },
  right: { gap: 12, alignItems: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
