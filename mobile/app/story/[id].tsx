import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { getStory, generateScenes, getCharacters } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { COIN_COSTS, MODEL_LABELS, MODEL_COLORS } from '../../constants/Config';

const SCENE_COUNTS = [1, 2, 3, 4, 5, 6];

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshUser } = useAuthStore();

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generation form state
  const [idea, setIdea] = useState('');
  const [sceneCount, setSceneCount] = useState(3);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const costPerScene = COIN_COSTS.scene_generation ?? 5;
  const totalCost = sceneCount * costPerScene;

  const load = useCallback(async () => {
    try {
      const data = await getStory(id as string);
      setStory(data);
      if (!data.scenes || data.scenes.length === 0) {
        setShowGenerateForm(true);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Story konnte nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    getCharacters()
      .then((data) => setCharacters(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [load]);

  const handleGenerateScenes = async () => {
    if (!idea.trim()) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Bitte gib eine Story-Idee ein' });
      return;
    }
    if ((user?.coins ?? 0) < totalCost) {
      Alert.alert(
        'Nicht genug Coins',
        `Du benötigst ${totalCost} Coins, hast aber nur ${user?.coins ?? 0}.`
      );
      return;
    }

    setGenerating(true);
    try {
      await generateScenes(id as string, {
        idea: idea.trim(),
        sceneCount,
        characterId: selectedCharId || undefined,
      });
      await refreshUser();
      Toast.show({ type: 'success', text1: `${sceneCount} Szenen generiert!` });
      setShowGenerateForm(false);
      setIdea('');
      await load();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Generierung fehlgeschlagen',
        text2: err.message || 'Bitte erneut versuchen',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Story nicht gefunden</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasScenes = story.scenes && story.scenes.length > 0;

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {story.name}
        </Text>
        {hasScenes && (
          <TouchableOpacity
            style={styles.addScenesBtn}
            onPress={() => setShowGenerateForm(!showGenerateForm)}
          >
            <Ionicons name={showGenerateForm ? 'close' : 'add'} size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        {!hasScenes && <View style={{ width: 36 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meta */}
        <View style={styles.metaCard}>
          <MetaBadge icon="film" label={story.genre} color={Colors.primary} />
          <MetaBadge icon="musical-notes" label={story.mood} color={Colors.accentPink} />
          <MetaBadge icon="phone-portrait" label={story.target_platform} color={Colors.accent} />
          <MetaBadge icon="language" label={story.language} color={Colors.success} />
        </View>

        {/* Generate Scenes Section */}
        {showGenerateForm && (
          <View style={styles.generateCard}>
            <View style={styles.generateCardHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.accentGold} />
              <Text style={styles.generateCardTitle}>Szenen generieren</Text>
            </View>

            {/* Coin cost preview */}
            <View
              style={[
                styles.costBanner,
                (user?.coins ?? 0) < totalCost && styles.costBannerError,
              ]}
            >
              <Ionicons
                name="logo-bitcoin"
                size={16}
                color={
                  (user?.coins ?? 0) >= totalCost ? Colors.coinGold : Colors.error
                }
              />
              <Text
                style={[
                  styles.costBannerText,
                  (user?.coins ?? 0) < totalCost && { color: Colors.error },
                ]}
              >
                {totalCost} Coins für {sceneCount} Szene{sceneCount !== 1 ? 'n' : ''}
                {(user?.coins ?? 0) < totalCost
                  ? ` (nur ${user?.coins ?? 0} verfügbar)`
                  : ` (${(user?.coins ?? 0) - totalCost} verbleibend)`}
              </Text>
            </View>

            {/* Idea input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Deine Story-Idee *</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={idea}
                onChangeText={setIdea}
                placeholder="Was soll passieren? Wer sind die Charaktere? Was ist das Ziel? Je mehr Details, desto besser..."
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Scene count */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Anzahl Szenen</Text>
              <View style={styles.chips}>
                {SCENE_COUNTS.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, sceneCount === n && styles.chipActive]}
                    onPress={() => setSceneCount(n)}
                  >
                    <Text style={[styles.chipText, sceneCount === n && styles.chipTextActive]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Character selector */}
            {characters.length > 0 && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Charakter (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.chip, !selectedCharId && styles.chipActive]}
                      onPress={() => setSelectedCharId('')}
                    >
                      <Text style={[styles.chipText, !selectedCharId && styles.chipTextActive]}>
                        Kein Charakter
                      </Text>
                    </TouchableOpacity>
                    {characters.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.chip, selectedCharId === c.id && styles.chipActive]}
                        onPress={() => setSelectedCharId(c.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedCharId === c.id && styles.chipTextActive,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Generate button */}
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerateScenes}
              disabled={generating || (user?.coins ?? 0) < totalCost}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  (user?.coins ?? 0) >= totalCost
                    ? ['#7C3AED', '#5B21B6']
                    : ['#444', '#333']
                }
                style={styles.generateBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Text style={styles.generateBtnText}>
                      {totalCost} Coins — Szenen generieren
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Scenes list */}
        {hasScenes ? (
          <>
            <View style={styles.scenesHeader}>
              <Text style={styles.sectionTitle}>{story.scenes.length} Szenen</Text>
            </View>
            {story.scenes.map((scene: any) => (
              <SceneCard key={scene.id} scene={scene} storyId={id as string} />
            ))}
          </>
        ) : !showGenerateForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Noch keine Szenen</Text>
            <Text style={styles.emptySubtitle}>
              Gib eine Story-Idee ein und lass die KI Szenen für dich generieren.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowGenerateForm(true)}
            >
              <Text style={styles.emptyBtnText}>Szenen generieren</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MetaBadge({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.metaBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.metaBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SceneCard({ scene, storyId }: { scene: any; storyId: string }) {
  const modelColor = MODEL_COLORS[scene.model_recommendation] ?? Colors.textMuted;
  const modelLabel = MODEL_LABELS[scene.model_recommendation] ?? scene.model_recommendation ?? '–';

  return (
    <View style={styles.sceneCard}>
      <View style={styles.sceneHeader}>
        <View style={styles.sceneNumBadge}>
          <Text style={styles.sceneNumText}>{scene.scene_number}</Text>
        </View>
        <Text style={styles.sceneTitle} numberOfLines={2}>
          {scene.title}
        </Text>
        <View style={[styles.modelTag, { backgroundColor: modelColor + '22', borderColor: modelColor + '44' }]}>
          <Text style={[styles.modelTagText, { color: modelColor }]}>{modelLabel}</Text>
        </View>
      </View>

      {scene.content ? (
        <Text style={styles.sceneContent}>{scene.content}</Text>
      ) : null}

      {scene.camera_notes ? (
        <View style={styles.noteRow}>
          <Ionicons name="camera" size={13} color={Colors.textMuted} />
          <Text style={styles.noteText}>{scene.camera_notes}</Text>
        </View>
      ) : null}

      {scene.audio_notes ? (
        <View style={styles.noteRow}>
          <Ionicons name="musical-note" size={13} color={Colors.textMuted} />
          <Text style={styles.noteText}>{scene.audio_notes}</Text>
        </View>
      ) : null}

      {scene.prompt ? (
        <View style={styles.promptBox}>
          <Text style={styles.promptLabel}>Video-Prompt</Text>
          <Text style={styles.promptText}>{scene.prompt}</Text>
        </View>
      ) : null}

      <View style={styles.sceneFooter}>
        <View style={styles.coinEstRow}>
          <Ionicons name="logo-bitcoin" size={14} color={Colors.coinGold} />
          <Text style={styles.coinEst}>~{scene.estimated_coins ?? '?'} Coins</Text>
        </View>
        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() =>
            router.push({
              pathname: '/video/generate' as any,
              params: {
                prompt: scene.prompt ?? '',
                sceneId: scene.id,
                projectId: storyId,
                model: scene.model_recommendation ?? 'grok',
              },
            })
          }
        >
          <Ionicons name="play-circle" size={16} color={Colors.primary} />
          <Text style={styles.videoBtnText}>Video generieren</Text>
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  backLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addScenesBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 60,
  },
  metaCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  generateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: 14,
  },
  generateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  costBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.coinGold + '15',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.coinGold + '33',
  },
  costBannerError: {
    backgroundColor: Colors.error + '11',
    borderColor: Colors.error + '44',
  },
  costBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.coinGold,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputMultiline: {
    height: 110,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '33',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  generateBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  scenesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sceneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  sceneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sceneNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sceneNumText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  sceneTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  modelTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  modelTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  sceneContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  promptBox: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  promptLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sceneFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  coinEstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinEst: {
    fontSize: 13,
    color: Colors.coinGold,
    fontWeight: '700',
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  videoBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyBtn: {
    backgroundColor: Colors.primary + '33',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emptyBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
