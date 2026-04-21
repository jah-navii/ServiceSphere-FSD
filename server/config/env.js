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
