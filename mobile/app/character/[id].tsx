import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import {
  getCharacter,
  deleteCharacter,
  uploadCharacterImage,
  deleteCharacterImage,
} from '../../services/api';
import { Colors } from '../../constants/Colors';
import { API_BASE_URL } from '../../constants/Config';

const VIEW_SLOTS = [
  { key: 'front', label: 'Front' },
  { key: 'left', label: 'Links' },
  { key: 'right', label: 'Rechts' },
  { key: 'back', label: 'Rücken' },
  { key: 'closeup_front', label: 'Close-up vorne' },
  { key: 'closeup_left', label: 'Close-up links' },
  { key: 'closeup_right', label: 'Close-up rechts' },
  { key: 'extra', label: 'Extra' },
];

// Strip /api suffix so we can build full image URLs
const BASE = API_BASE_URL.replace(/\/api$/, '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCharacter(id as string);
      setCharacter(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Charakter konnte nicht geladen werden' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const getSlotImage = (viewKey: string) =>
    character?.images?.find((img: any) => img.view_type === viewKey) ?? null;

  const handleEmptySlotPress = async (viewKey: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(viewKey);
    try {
      await uploadCharacterImage(id as string, result.assets[0].uri, viewKey);
      await load();
      Toast.show({ type: 'success', text1: 'Bild hochgeladen' });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload fehlgeschlagen',
        text2: err.message || 'Bitte erneut versuchen',
      });
    } finally {
      setUploading(null);
    }
  };

  const handleFilledSlotPress = (viewKey: string, imageId: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Abbrechen', 'Bild ändern', 'Bild löschen'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        async (idx) => {
          if (idx === 1) await handleEmptySlotPress(viewKey);
          if (idx === 2) await handleDeleteImage(imageId);
        }
      );
    } else {
      Alert.alert('Bild-Optionen', undefined, [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Bild ändern', onPress: () => handleEmptySlotPress(viewKey) },
        {
          text: 'Bild löschen',
          style: 'destructive',
          onPress: () => handleDeleteImage(imageId),
        },
      ]);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteCharacterImage(id as string, imageId);
      await load();
      Toast.show({ type: 'success', text1: 'Bild gelöscht' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Fehler beim Löschen', text2: err.message });
    }
  };

  const handleDeleteCharacter = () => {
    Alert.alert(
      'Charakter löschen',
      `"${character?.name}" wirklich permanent löschen? Alle Referenzbilder werden ebenfalls gelöscht.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCharacter(id as string);
              Toast.show({ type: 'success', text1: 'Charakter gelöscht' });
              router.back();
            } catch (err: any) {
              Toast.show({ type: 'error', text1: 'Fehler', text2: err.message });
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!character) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Charakter nicht gefunden</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filledSlots = VIEW_SLOTS.filter((s) => getSlotImage(s.key)).length;

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
          {character.name}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: Colors.primary + '33' }]}>
          <Text style={styles.categoryBadgeText}>{character.category}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.detailsGrid}>
            {character.style ? (
              <DetailItem icon="color-palette" label="Stil" value={character.style} />
            ) : null}
            {character.gender ? (
              <DetailItem icon="person" label="Geschlecht" value={character.gender} />
            ) : null}
            {character.age_look ? (
              <DetailItem icon="calendar" label="Look" value={character.age_look} />
            ) : null}
            <DetailItem
              icon="language"
              label="Sprache"
              value={character.language || 'Deutsch'}
            />
          </View>
          {character.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Beschreibung</Text>
              <Text style={styles.descText}>{character.description}</Text>
            </View>
          ) : null}
          {character.clothing ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Kleidung</Text>
              <Text style={styles.descText}>{character.clothing}</Text>
            </View>
          ) : null}
          {character.features ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Besondere Merkmale</Text>
              <Text style={styles.descText}>{character.features}</Text>
            </View>
          ) : null}
          {character.tags?.length > 0 ? (
            <View style={styles.tagsRow}>
              {character.tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Reference Images */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Referenzbilder (8-Shot)</Text>
          <Text style={styles.sectionSubtitle}>
            {filledSlots}/8 hochgeladen
          </Text>
        </View>
        <Text style={styles.hint}>
          Tippe auf einen freien Slot um ein Bild hochzuladen. Tippe ein vorhandenes Bild für Optionen.
        </Text>

        <View style={styles.imageGrid}>
          {VIEW_SLOTS.map((slot) => {
            const img = getSlotImage(slot.key);
            const isUploading = uploading === slot.key;

            return (
              <TouchableOpacity
                key={slot.key}
                style={[styles.imageSlot, img && styles.imageSlotFilled]}
                onPress={() =>
                  img
                    ? handleFilledSlotPress(slot.key, img.id)
                    : handleEmptySlotPress(slot.key)
                }
                activeOpacity={0.75}
              >
                {isUploading ? (
                  <ActivityIndicator color={Colors.primary} size="small" />
                ) : img ? (
                  <Image
                    source={{ uri: resolveImageUrl(img.image_url) }}
                    style={styles.slotImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.emptySlotContent}>
                    <Ionicons name="add" size={24} color={Colors.textMuted} />
                  </View>
                )}
                <View style={styles.slotLabelWrapper}>
                  <Text style={styles.slotLabel} numberOfLines={1}>
                    {slot.label}
                  </Text>
                </View>
                {img && (
                  <View style={styles.filledOverlay}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            router.push({
              pathname: '/video/generate' as any,
              params: { characterId: id },
            })
          }
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#7C3AED', '#5B21B6']}
            style={styles.primaryBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="videocam" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Video mit diesem Charakter</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteCharacter}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={Colors.error} size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Charakter löschen</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={14} color={Colors.textMuted} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
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
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    minWidth: '44%',
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  descSection: {
    gap: 4,
  },
  descLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: -8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageSlot: {
    width: '22.5%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSlotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.primary + '55',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  emptySlotContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  slotLabelWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  slotLabel: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  filledOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    backgroundColor: Colors.error + '0A',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
});
