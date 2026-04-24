import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  MONGO_URI:  z.string().min(1, 'MONGO_URI is required'),
  PORT:       z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRY: z.string().default('7d'),
  NODE_ENV:   z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL:  z.string().default('http'),

  // ── Phase 2: Redis ──────────────────────────────────────────────────────────
  // Optional — only required when CACHE_DRIVER=redis
  REDIS_URL:  z.string().optional(),

  // ── Phase 2: Meilisearch ────────────────────────────────────────────────────
  // Optional — only required when SEARCH_DRIVER=meili
  MEILI_HOST:       z.string().default('http://localhost:7700'),
  MEILI_MASTER_KEY: z.string().default(''),

  // ── Feature flags ───────────────────────────────────────────────────────────
  // CACHE_DRIVER: 'redis' | 'memory' | 'none'  (default: memory)
  CACHE_DRIVER:  z.enum(['redis', 'memory', 'none']).default('memory'),
  // SEARCH_DRIVER: 'meili' | 'mongo'            (default: mongo)
  SEARCH_DRIVER: z.enum(['meili', 'mongo']).default('mongo'),
});

console.log('ENV CHECK:', {
  MONGO_URI: !!process.env.MONGO_URI,
  JWT_SECRET: !!process.env.JWT_SECRET,
  PORT: process.env.PORT,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Server cannot start — invalid environment variables:\n');
  parsed.error.issues.forEach(({ path, message }) => {
    console.error(`  ${path.join('.')}: ${message}`);
  });
  console.error('\nSee server/.env.example for required variables.\n');
  process.exit(1);
}

export const env = parsed.data;
