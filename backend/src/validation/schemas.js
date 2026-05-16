const { z } = require('zod');

// Auth schemas
// Note: min(6) matches existing password policy (admin user creation enforces min 6)
const loginSchema = z.object({
  email: z.string().email('Ungueltige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

// Video generation schema
const videoGenerateSchema = z.object({
  model: z.enum(['grok', 'veo31'], 'Ungueltiges Modell. Erlaubt: grok, veo31'),
  prompt: z.string().min(1, 'Prompt ist erforderlich').max(2000, 'Prompt darf maximal 2000 Zeichen haben'),
  duration: z.number().int('Dauer muss eine ganze Zahl sein').min(2).max(60).optional(),
  resolution: z.enum(['480p', '720p'], 'Ungueltige Aufloesung. Erlaubt: 480p, 720p').optional(),
  referenceImages: z.array(z.string().url()).max(7).optional(),
  projectId: z.string().uuid().optional().nullable(),
  sceneId: z.string().uuid().optional().nullable(),
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
  adminCoinAddSchema,
  adminCoinRemoveSchema,
  characterCreateSchema,
  adminUserCreateSchema,
};
