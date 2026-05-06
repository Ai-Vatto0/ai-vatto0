import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { getStories, deleteStory } from '../../services/api';
import Toast from 'react-native-toast-message';

export default function StoriesScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => { try { setStories(await getStories()); } catch {} };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Löschen', `"${name}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        try { await deleteStory(id); load(); } catch (e: any) { Toast.show({ type: 'error', text1: e.message }); }
      }},
    ]);
  };

  const platformIcons: Record<string, any> = { TikTok: 'logo-tiktok', 'YouTube Shorts': 'logo-youtube', 'Instagram Reels': 'logo-instagram' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Storys</Text>
        <TouchableOpacity onPress={() => router.push('/story/create')} style={styles.addBtn}>
          <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.addBtnInner}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}>
        {stories.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Noch keine Storys</Text>
            <TouchableOpacity onPress={() => router.push('/story/create')}>
              <Text style={[styles.emptyAction, { color: Colors.accent }]}>Erste Story erstellen →</Text>
            </TouchableOpacity>
          </View>
        )}
        {stories.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => router.push(`/story/${s.id}`)} activeOpacity={0.85} style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: Colors.accent }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName}>{s.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: s.status === 'draft' ? Colors.warning : Colors.success }]} />
              </View>
              <View style={styles.cardMeta}>
                {s.genre ? <View style={styles.tag}><Text style={styles.tagText}>{s.genre}</Text></View> : null}
                {s.target_platform ? <View style={styles.tag}>
                  <Ionicons name={platformIcons[s.target_platform] || 'phone-portrait'} size={10} color={Colors.accent} />
                  <Text style={styles.tagText}>{s.target_platform}</Text>
                </View> : null}
                {s.language ? <View style={styles.tag}><Text style={styles.tagText}>{s.language}</Text></View> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(s.id, s.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  addBtn: { borderRadius: 14 },
  addBtnInner: { padding: 10, borderRadius: 14 },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  emptyAction: { fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, color: Colors.accent },
  deleteBtn: { padding: 14, justifyContent: 'center' },
});
