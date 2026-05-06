import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { createStory } from '../../services/api';
import { Colors } from '../../constants/Colors';

const GENRES = [
  'Drama',
  'Komödie',
  'Action',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Fantasy',
  'Sonstiges',
];
const MOODS = ['Episch', 'Dramatisch', 'Romantisch', 'Spannend', 'Lustig', 'Düster', 'Entspannt'];
const PLATFORMS = ['TikTok', 'YouTube Shorts', 'Instagram Reels'];
const LANGUAGES = ['Deutsch', 'Englisch'];

export default function CreateStoryScreen() {
  const [projectName, setProjectName] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [mood, setMood] = useState('Episch');
  const [platform, setPlatform] = useState('TikTok');
  const [language, setLanguage] = useState('Deutsch');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!projectName.trim()) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Projektname ist erforderlich' });
      return;
    }
    setLoading(true);
    try {
      const story = await createStory({
        name: projectName.trim(),
        genre,
        mood,
        target_platform: platform,
        language,
      });
      Toast.show({ type: 'success', text1: 'Story erstellt', text2: projectName.trim() });
      router.push(`/story/${story.id}` as any);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: err.message || 'Story konnte nicht erstellt werden',
      });
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Neue Story</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Project Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Projektname *</Text>
          <TextInput
            style={styles.input}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="z.B. Mein Anime-Kurzfilm"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />
        </View>

        {/* Genre */}
        <ChipSelector label="Genre" options={GENRES} value={genre} onChange={setGenre} />

        {/* Mood */}
        <ChipSelector label="Stimmung / Mood" options={MOODS} value={mood} onChange={setMood} />

        {/* Platform */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Zielplattform</Text>
          <View style={styles.chips}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  styles.chipWide,
                  platform === p && styles.chipActive,
                ]}
                onPress={() => setPlatform(p)}
              >
                <Ionicons
                  name={
                    p === 'TikTok'
                      ? 'musical-notes'
                      : p === 'YouTube Shorts'
                      ? 'logo-youtube'
                      : 'logo-instagram'
                  }
                  size={14}
                  color={platform === p ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.chipText, platform === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Sprache</Text>
          <View style={styles.chips}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.chip, language === l && styles.chipActive]}
                onPress={() => setLanguage(l)}
              >
                <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={Colors.accent} />
          <Text style={styles.infoText}>
            Nach dem Erstellen kannst du eine Story-Idee eingeben und Szenen mit KI generieren lassen.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#7C3AED', '#5B21B6']}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Story erstellen</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ChipSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, value === o && styles.chipActive]}
            onPress={() => onChange(o)}
          >
            <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  form: {
    padding: 20,
    gap: 18,
    paddingBottom: 60,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipWide: {
    paddingHorizontal: 16,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.accent + '11',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '33',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
