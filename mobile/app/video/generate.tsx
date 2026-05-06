import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { generateVideo, getVideoStatus, getCharacter, getCharacters } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { COIN_COSTS, MODEL_LABELS, MODEL_COLORS } from '../../constants/Config';
import { API_BASE_URL } from '../../constants/Config';

const BASE = API_BASE_URL.replace(/\/api$/, '');

type ModelKey = 'grok' | 'sora2' | 'veo31';

const MODEL_INFO: Record<
  ModelKey,
  {
    description: string;
    durations: number[];
    resolutions: string[];
    priceNote: string;
  }
> = {
  grok: {
    description: 'Schnell & günstig · Referenzbilder unterstützt',
    durations: [6, 10, 15],
    resolutions: ['480p', '720p'],
    priceNote: '6s/480p=10 · 6s/720p=20 · 10s/480p=20 · 10s/720p=30 · 15s/480p=30 · 15s/720p=40',
  },
  sora2: {
    description: 'OpenAI Sora 2 · Hochqualität · Kein Referenzbild',
    durations: [10, 15],
    resolutions: ['720p'],
    priceNote: '10s=30 Coins · 15s=35 Coins',
  },
  veo31: {
    description: 'Google Veo 3.1 · Beste Qualität · Bis zu 3 Referenzbilder',
    durations: [8],
    resolutions: ['720p'],
    priceNote: '8s=60 Coins',
  },
};

function getCost(model: ModelKey, duration: number, resolution: string): number {
  if (model === 'grok') {
    const key = `grok_${duration}s_${resolution}` as keyof typeof COIN_COSTS;
    return (COIN_COSTS[key] as number) ?? 20;
  }
  if (model === 'sora2') return duration >= 15 ? COIN_COSTS.sora2_15s : COIN_COSTS.sora2_10s;
  if (model === 'veo31') return COIN_COSTS.veo31_8s ?? 60;
  return 20;
}

export default function GenerateVideoScreen() {
  const params = useLocalSearchParams<{
    characterId?: string;
    sceneId?: string;
    projectId?: string;
    prompt?: string;
    model?: string;
  }>();
  const { user, refreshUser } = useAuthStore();

  const [model, setModel] = useState<ModelKey>((params.model as ModelKey) || 'grok');
  const [prompt, setPrompt] = useState(params.prompt || '');
  const [duration, setDuration] = useState(6);
  const [resolution, setResolution] = useState('720p');

  // Character reference
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState(params.characterId || '');
  const [charImages, setCharImages] = useState<string[]>([]);

  // Extra ref images (up to 3 total)
  const [extraImages, setExtraImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived
  const modelInfo = MODEL_INFO[model];
  const coinCost = getCost(model, duration, resolution);
  const canGenerate = (user?.coins ?? 0) >= coinCost && !loading;

  // Load characters
  useEffect(() => {
    getCharacters()
      .then((data) => setCharacters(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Sync duration / resolution when model changes
  useEffect(() => {
    const info = MODEL_INFO[model];
    if (!info.durations.includes(duration)) setDuration(info.durations[0]);
    if (!info.resolutions.includes(resolution)) setResolution(info.resolutions[0]);
  }, [model]);

  // Load char images when selection changes
  useEffect(() => {
    if (!selectedCharId) {
      setCharImages([]);
      return;
    }
    getCharacter(selectedCharId)
      .then((c) => {
        const priority = ['front', 'left', 'back', 'right', 'closeup_front', 'extra'];
        const maxRefs = model === 'veo31' ? 3 : 1;
        const imgs = priority
          .map((v) => c.images?.find((i: any) => i.view_type === v)?.image_url)
          .filter(Boolean)
          .slice(0, maxRefs)
          .map((url: string) => (url.startsWith('http') ? url : `${BASE}${url}`));
        setCharImages(imgs);
      })
      .catch(() => setCharImages([]));
  }, [selectedCharId, model]);

  const totalRefImages = [...charImages, ...extraImages];
  const maxExtraImages = Math.max(0, 3 - charImages.length);

  const handleAddExtraImage = async () => {
    if (extraImages.length >= maxExtraImages) {
      Toast.show({ type: 'info', text1: 'Maximum erreicht', text2: 'Max. 3 Referenzbilder total' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setExtraImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Prompt ist erforderlich' });
      return;
    }
    if (!canGenerate) {
      Alert.alert(
        'Nicht genug Coins',
        `Du benötigst ${coinCost} Coins, hast aber nur ${user?.coins ?? 0}.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await generateVideo({
        model,
        prompt: prompt.trim(),
        duration,
        resolution,
        referenceImages: totalRefImages,
        characterId: selectedCharId || undefined,
        projectId: params.projectId || undefined,
        sceneId: params.sceneId || undefined,
      });
      setResult({ jobId: res.jobId, status: 'processing' });
      await refreshUser();
      startPolling(res.jobId);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Generierung fehlgeschlagen',
        text2: err.message || 'Bitte erneut versuchen',
      });
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (jobId: string) => {
    setPolling(true);
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const status = await getVideoStatus(jobId);
        setResult(status);
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollingRef.current!);
          setPolling(false);
          if (status.status === 'completed') {
            await refreshUser();
            Toast.show({ type: 'success', text1: 'Video fertig!' });
          }
        }
      } catch {}
      if (attempts > 72) {
        clearInterval(pollingRef.current!);
        setPolling(false);
      }
    }, 5000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Result screen
  if (result) {
    const isDone = result.status === 'completed';
    const isFailed = result.status === 'failed';

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setResult(null);
              router.back();
            }}
          >
            <Ionicons name="close" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video-Status</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.resultCenter}>
          <View
            style={[
              styles.statusIconWrap,
              {
                backgroundColor: isDone
                  ? Colors.success + '22'
                  : isFailed
                  ? Colors.error + '22'
                  : Colors.warning + '22',
              },
            ]}
          >
            {isDone ? (
              <Ionicons name="checkmark-circle" size={52} color={Colors.success} />
            ) : isFailed ? (
              <Ionicons name="close-circle" size={52} color={Colors.error} />
            ) : (
              <ActivityIndicator size="large" color={Colors.warning} />
            )}
          </View>

          <Text style={styles.statusTitle}>
            {isDone ? 'Video ist fertig!' : isFailed ? 'Generierung fehlgeschlagen' : 'Wird generiert…'}
          </Text>

          {polling && (
            <Text style={styles.pollingNote}>Prüfe Status alle 5 Sekunden…</Text>
          )}

          {isFailed && result.error_message ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{result.error_message}</Text>
            </View>
          ) : null}

          {isDone && result.result_url ? (
            <TouchableOpacity
              style={styles.openVideoBtn}
              onPress={() => Linking.openURL(result.result_url)}
            >
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.openVideoBtnGradient}>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.openVideoBtnText}>Video öffnen</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.newVideoBtn}
            onPress={() => {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setResult(null);
            }}
          >
            <Text style={styles.newVideoBtnText}>Neues Video generieren</Text>
          </TouchableOpacity>

          <View style={styles.coinRow}>
            <Ionicons name="logo-bitcoin" size={16} color={Colors.coinGold} />
            <Text style={styles.coinBalance}>{user?.coins ?? 0} Coins verbleibend</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video generieren</Text>
        <View style={styles.coinPill}>
          <Ionicons name="logo-bitcoin" size={14} color={Colors.coinGold} />
          <Text style={styles.coinPillText}>{user?.coins ?? 0}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Model selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Modell wählen</Text>
          {(['grok', 'sora2', 'veo31'] as ModelKey[]).map((m) => {
            const color = MODEL_COLORS[m] ?? Colors.primary;
            const isSelected = model === m;
            return (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modelCard,
                  isSelected && {
                    borderColor: color,
                    backgroundColor: color + '11',
                  },
                ]}
                onPress={() => setModel(m)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.modelDot,
                    { backgroundColor: color + '33', borderColor: color },
                  ]}
                >
                  <Ionicons name="videocam" size={16} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modelTitleRow}>
                    <Text style={[styles.modelName, isSelected && { color }]}>
                      {MODEL_LABELS[m]}
                    </Text>
                    <Text style={[styles.modelPrice, { color }]}>
                      {getCost(m, MODEL_INFO[m].durations[0], MODEL_INFO[m].resolutions[0])}+ Coins
                    </Text>
                  </View>
                  <Text style={styles.modelDesc}>{MODEL_INFO[m].description}</Text>
                  {isSelected && (
                    <Text style={[styles.modelPriceTable, { color: color + 'CC' }]}>
                      {MODEL_INFO[m].priceNote}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration */}
        {modelInfo.durations.length > 1 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Dauer</Text>
            <View style={styles.chips}>
              {modelInfo.durations.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, duration === d && styles.chipActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>
                    {d}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {modelInfo.durations.length === 1 && (
          <View style={styles.fixedInfo}>
            <Ionicons name="time" size={14} color={Colors.textMuted} />
            <Text style={styles.fixedInfoText}>Feste Dauer: {modelInfo.durations[0]}s</Text>
          </View>
        )}

        {/* Resolution */}
        {modelInfo.resolutions.length > 1 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Auflösung</Text>
            <View style={styles.chips}>
              {modelInfo.resolutions.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, resolution === r && styles.chipActive]}
                  onPress={() => setResolution(r)}
                >
                  <Text style={[styles.chipText, resolution === r && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Prompt */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Prompt{params.prompt ? ' (aus Szene übernommen)' : ' (Englisch empfohlen)'}
          </Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="A young woman walks through a neon-lit cyberpunk city at night, cinematic, 4K..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Character reference */}
        {characters.length > 0 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Charakter-Referenz (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.chip, !selectedCharId && styles.chipActive]}
                  onPress={() => setSelectedCharId('')}
                >
                  <Text style={[styles.chipText, !selectedCharId && styles.chipTextActive]}>
                    Kein
                  </Text>
                </TouchableOpacity>
                {characters.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.chip,
                      selectedCharId === c.id && styles.chipActive,
                    ]}
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

        {/* Reference images preview */}
        {totalRefImages.length > 0 || maxExtraImages > 0 ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Referenzbilder ({totalRefImages.length}/3)
            </Text>
            <View style={styles.refImagesRow}>
              {totalRefImages.map((uri, i) => (
                <View key={i} style={styles.refImageSlot}>
                  <Image source={{ uri }} style={styles.refImage} resizeMode="cover" />
                  {i >= charImages.length && (
                    <TouchableOpacity
                      style={styles.removeRefBtn}
                      onPress={() =>
                        setExtraImages((prev) => prev.filter((_, ei) => ei !== i - charImages.length))
                      }
                    >
                      <Ionicons name="close-circle" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {totalRefImages.length < 3 && (
                <TouchableOpacity style={styles.addRefImageBtn} onPress={handleAddExtraImage}>
                  <Ionicons name="add" size={22} color={Colors.textMuted} />
                  <Text style={styles.addRefImageText}>Hinzufügen</Text>
                </TouchableOpacity>
              )}
            </View>
            {charImages.length > 0 && (
              <Text style={styles.refNote}>
                {charImages.length} Bild{charImages.length > 1 ? 'er' : ''} vom Charakter •{' '}
                {maxExtraImages} weiteres Slot{maxExtraImages !== 1 ? 's' : ''} verfügbar
              </Text>
            )}
          </View>
        ) : null}

        {/* Cost preview */}
        <View style={[styles.costCard, !canGenerate && styles.costCardError]}>
          <View style={styles.costCardRow}>
            <View style={styles.costLeft}>
              <Ionicons
                name="logo-bitcoin"
                size={22}
                color={canGenerate ? Colors.coinGold : Colors.error}
              />
              <View>
                <Text style={styles.costLabel}>Kosten</Text>
                <Text
                  style={[styles.costAmount, !canGenerate && { color: Colors.error }]}
                >
                  {coinCost} Coins
                </Text>
              </View>
            </View>
            <View style={styles.costRight}>
              <Text style={styles.costBalanceLabel}>Dein Guthaben</Text>
              <Text
                style={[
                  styles.costBalance,
                  !canGenerate && { color: Colors.error },
                ]}
              >
                {user?.coins ?? 0} Coins
              </Text>
            </View>
          </View>
          {!canGenerate && (
            <Text style={styles.costError}>
              Nicht genug Coins — du benötigst noch {coinCost - (user?.coins ?? 0)} Coins
            </Text>
          )}
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerate}
          disabled={!canGenerate}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canGenerate ? ['#7C3AED', '#5B21B6'] : ['#333', '#2A2A2A']}
            style={styles.generateBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.generateBtnText}>
                  Video generieren ({coinCost} Coins)
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.coinGold + '22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.coinGold + '44',
  },
  coinPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.coinGold,
  },
  form: {
    padding: 20,
    gap: 18,
    paddingBottom: 60,
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  modelDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  modelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modelPrice: {
    fontSize: 12,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  modelPriceTable: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '33',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  fixedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  fixedInfoText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.surface,
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
  refImagesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  refImageSlot: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refImage: {
    width: '100%',
    height: '100%',
  },
  removeRefBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  addRefImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addRefImageText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  refNote: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  costCard: {
    backgroundColor: Colors.coinGold + '11',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.coinGold + '33',
    gap: 8,
  },
  costCardError: {
    backgroundColor: Colors.error + '0A',
    borderColor: Colors.error + '44',
  },
  costCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  costLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  costAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.coinGold,
  },
  costRight: {
    alignItems: 'flex-end',
  },
  costBalanceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  costBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  costError: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  generateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  // Result screen
  resultCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  statusIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pollingNote: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  errorBox: {
    backgroundColor: Colors.error + '11',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    maxWidth: '100%',
  },
  errorBoxText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  openVideoBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  openVideoBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  openVideoBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  newVideoBtn: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    width: '100%',
    alignItems: 'center',
  },
  newVideoBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinBalance: {
    fontSize: 14,
    color: Colors.coinGold,
    fontWeight: '700',
  },
});
