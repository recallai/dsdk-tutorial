import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    RECALLAI_API_KEY: z.string().min(1),
    RECALLAI_BASE_URL: z.url(),
    OPENAI_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env); 