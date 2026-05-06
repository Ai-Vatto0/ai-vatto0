import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { createCharacter } from '../../services/api';
import { Colors } from '../../constants/Colors';

const CATEGORIES = ['Anime', 'Realistisch', 'Fantasy', 'Sci-Fi', 'Cartoon', 'Sonstiges'];
const LANGUAGES = ['Deutsch', 'Englisch'];

export default function CreateCharacterScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Anime');
  const [gender, setGender] = useState('');
  const [ageLook, setAgeLook] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('');
  const [clothing, setClothing] = useState('');
  const [features, setFeatures] = useState('');
  const [language, setLanguage] = useState('Deutsch');
  const [tags, setTags] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Fehler', text2: 'Name ist erforderlich' });
      return;
    }
    setLoading(true);
    try {
      await createCharacter({
        name: name.trim(),
        category,
        gender: gender.trim() || undefined,
        age_look: ageLook.trim() || undefined,
        description: description.trim() || undefined,
        style: style.trim() || undefined,
        clothing: clothing.trim() || undefined,
        features: features.trim() || undefined,
        language,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        is_main: isMain,
      });
      Toast.show({ type: 'success', text1: 'Charakter erstellt', text2: name.trim() });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: err.message || 'Charakter konnte nicht erstellt werden',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Neuer Charakter</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <FormField
          label="Name *"
          value={name}
          onChangeText={setName}
          placeholder="z.B. Luna Yashiro"
        />

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kategorie</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gender */}
        <FormField
          label="Geschlecht / Typ"
          value={gender}
          onChangeText={setGender}
          placeholder="z.B. Weiblich"
        />

        {/* Age Look */}
        <FormField
          label="Alterswirkung / Look"
          value={ageLook}
          onChangeText={setAgeLook}
          placeholder="z.B. Frühe 20er, jugendlich"
        />

        {/* Description */}
        <FormField
          label="Beschreibung"
          value={description}
          onChangeText={setDescription}
          placeholder="Wie sieht der Charakter aus? Persönlichkeit, Hintergrundgeschichte..."
          multiline
          height={100}
        />

        {/* Style */}
        <FormField
          label="Stil"
          value={style}
          onChangeText={setStyle}
          placeholder="z.B. Anime-Stil, photorealistisch, 3D-Render"
        />

        {/* Clothing */}
        <FormField
          label="Kleidung"
          value={clothing}
          onChangeText={setClothing}
          placeholder="z.B. Schwarze Jacke, weißes Hemd, Jeans"
        />

        {/* Special Features */}
        <FormField
          label="Besondere Merkmale"
          value={features}
          onChangeText={setFeatures}
          placeholder="z.B. Narbe am Kinn, lila Augen, Tattoo"
        />

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

        {/* Tags */}
        <FormField
          label="Tags (kommagetrennt)"
          value={tags}
          onChangeText={setTags}
          placeholder="z.B. kuudere, kampf, magie"
        />

        {/* Main character toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.label}>Hauptcharakter</Text>
            <Text style={styles.toggleHint}>Dieser Charakter wird bevorzugt angezeigt</Text>
          </View>
          <Switch
            value={isMain}
            onValueChange={setIsMain}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
            ios_backgroundColor={Colors.border}
          />
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
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Charakter speichern</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  height,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  height?: number;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && { height: height ?? 80, textAlignVertical: 'top' },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
      />
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
    gap: 16,
    paddingBottom: 60,
  },
  fieldGroup: {
    gap: 8,
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
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
