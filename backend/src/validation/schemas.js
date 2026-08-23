const { z } = require('zod');

// Auth schemas
// Note: min(6) matches existing password policy (admin user creation enforces min 6)
const loginSchema = z.object({
  email: z.string().email('Ungueltige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

const klingElementSchema = z.object({
  name: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/, 'Elementname darf nur Buchstaben, Zahlen, _ und - enthalten'),
  description: z.string().min(1).max(500),
  element_input_urls: z.array(z.string().url()).min(2).max(4),
  element_input_audio_urls: z.array(z.string().url()).max(1).optional(),
  start_time: z.number().int().min(0).optional(),
  end_time: z.number().int().positive().optional(),
}).refine((value) => {
  if (value.start_time === undefined && value.end_time === undefined) return true;
  if (value.start_time === undefined || value.end_time === undefined) return false;
  const length = value.end_time - value.start_time;
  return value.end_time > value.start_time && length >= 3000 && length <= 8000;
}, 'Video-Element start_time/end_time muessen zusammen gesetzt sein und 3-8 Sekunden umfassen');

const klingMultiPromptSchema = z.object({
  prompt: z.string().min(1).max(500),
  duration: z.number().int().min(1).max(12),
});

// Video generation schema
const videoGenerateSchema = z.object({
  model: z.enum(['grok', 'veo31', 'kling3'], 'Ungueltiges Modell. Erlaubt: grok, veo31, kling3'),
  prompt: z.string().min(1, 'Prompt ist erforderlich').max(5000, 'Prompt darf maximal 5000 Zeichen haben'),
  duration: z.number().int('Dauer muss eine ganze Zahl sein').min(2).max(60).optional(),
  resolution: z.enum(['480p', '720p', '1080p', '4K']).optional(),
  referenceImages: z.array(z.string().url()).max(7).optional(),
  projectId: z.string().uuid().optional().nullable(),
  sceneId: z.string().uuid().optional().nullable(),

  // Kling 3.0 Market API
  startFrame: z.string().url().optional(),
  lastFrame: z.string().url().optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).optional(),
  mode: z.enum(['std', 'pro', '4K']).optional(),
  sound: z.boolean().optional(),
  multiShots: z.boolean().optional(),
  multiPrompt: z.array(klingMultiPromptSchema).max(5).optional(),
  klingElements: z.array(klingElementSchema).max(3).optional(),
  productElementId: z.string().uuid().optional().nullable(),
}).superRefine((value, ctx) => {
  if (value.model !== 'kling3') return;

  const duration = value.duration ?? 4;
  if (duration < 3 || duration > 15) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['duration'], message: 'Kling 3.0 erlaubt 3-15 Sekunden' });
  }

  const hasElements = Array.isArray(value.klingElements) && value.klingElements.length > 0;
  if (hasElements && !value.startFrame) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['startFrame'], message: 'Kling-Elemente benoetigen einen Startframe' });
  }

  if (value.multiShots) {
    const shots = value.multiPrompt || [];
    if (!shots.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['multiPrompt'], message: 'Multi-Shot benoetigt mindestens einen Shot' });
    }
    const total = shots.reduce((sum, shot) => sum + shot.duration, 0);
    if (shots.length && total !== duration) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['multiPrompt'], message: 'Summe der Shot-Dauern muss der Gesamtdauer entsprechen' });
    }
    if (value.lastFrame) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lastFrame'], message: 'Multi-Shot unterstuetzt nur den Startframe' });
    }
  }
});

// Admin coin schemas
const adminCoinAddSchema = z.object({
  userId: z.string().min(1, 'userId ist erforderlich'),
  amount: z.number().positive('Menge muss positiv sein').int('Menge muss eine ganze Zahl sein'),
  description: z.string().max(500).optional(),
});

const adminCoinRemoveSchema = z.object({
  userId: z.string().min(1, 'userId ist erforderlich'),
  amount: z.number().positive('Menge muss positiv sein').int('Menge muss eine ganze Zahl sein'),
  description: z.string().max(500).optional(),
});

// Character creation schema
const characterCreateSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(100, 'Name darf maximal 100 Zeichen haben'),
  category: z.string().max(50).optional(),
  gender: z.string().max(30).optional(),
  age_look: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  style: z.string().max(500).optional(),
  clothing: z.string().max(500).optional(),
  features: z.string().max(500).optional(),
  language: z.string().max(30).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_main: z.boolean().optional(),
});

// Admin user creation schema
const adminUserCreateSchema = z.object({
  username: z.string().min(1, 'Username erforderlich').max(50),
  email: z.string().email('Ungueltige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort min. 6 Zeichen'),
  coins: z.number().int().min(0).optional(),
  is_admin: z.boolean().optional(),
});

module.exports = {
  loginSchema,
  videoGenerateSchema,
  klingElementSchema,
  adminCoinAddSchema,
  adminCoinRemoveSchema,
  characterCreateSchema,
  adminUserCreateSchema,
};
