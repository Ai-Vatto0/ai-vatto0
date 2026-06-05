import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { API_BASE_URL } from '../../constants/Config';
import { getCharacters, deleteCharacter } from '../../services/api';
import Toast from 'react-native-toast-message';

const BASE = API_BASE_URL.replace(/\/api$/, '');
function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

export default function CharactersScreen() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setCharacters(await getCharacters());
    } catch (e: any) {
      setError(e.message || 'Charaktere konnten nicht geladen werden');
      Toast.show({ type: 'error', text1: 'Fehler', text2: e.message });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Löschen', `"${name}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => {
        try { await deleteCharacter(id); load(); Toast.show({ type: 'success', text1: 'Gelöscht' }); }
        catch (e: any) { Toast.show({ type: 'error', text1: e.message }); }
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Charaktere</Text>
        <TouchableOpacity onPress={() => router.push('/character/create')} style={styles.addBtn}>
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addBtnInner}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading && characters.length === 0 && (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Charaktere werden geladen...</Text>
        </View>
      )}
      {error && characters.length === 0 && !loading && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {characters.length === 0 && !loading && !error && (
          <View style={styles.empty}>
            <Ionicons name="person-add-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Noch keine Charaktere</Text>
            <TouchableOpacity onPress={() => router.push('/character/create')}>
              <Text style={styles.emptyAction}>Ersten Charakter erstellen →</Text>
            </TouchableOpacity>
          </View>
        )}
        {characters.map((c) => (
          <TouchableOpacity key={c.id} onPress={() => router.push(`/character/${c.id}`)} activeOpacity={0.85} style={styles.card}>
            <View style={styles.cardImageArea}>
              {c.images?.find((i: any) => i.view_type === 'front')?.image_url
                ? <Image source={{ uri: resolveImageUrl(c.images.find((i: any) => i.view_type === 'front').image_url) }} style={styles.cardImage} />
                : <View style={styles.cardImagePlaceholder}><Ionicons name="person" size={28} color={Colors.primary} /></View>
              }
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{c.name}</Text>
              <Text style={styles.cardCategory}>{c.category} • {c.language}</Text>
              {c.description ? <Text style={styles.cardDesc} numberOfLines={2}>{c.description}</Text> : null}
              <View style={styles.cardMeta}>
                <Text style={styles.cardImages}>{c.images?.length || 0}/8 Bilder</Text>
                {c.is_main && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>Haupt</Text></View>}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(c.id, c.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
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
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
  emptyAction: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardImageArea: { width: 80 },
  cardImage: { width: 80, height: 100, resizeMode: 'cover' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  retryBtn: { marginTop: 12, backgroundColor: Colors.primary + '33', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary },
  retryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  cardImagePlaceholder: { width: 80, height: 100, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, padding: 12 },
  cardName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardCategory: { fontSize: 12, color: Colors.accent, marginTop: 2 },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  cardImages: { fontSize: 11, color: Colors.textMuted },
  mainBadge: { backgroundColor: Colors.primary + '30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  mainBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  deleteBtn: { padding: 14, justifyContent: 'center' },
});
