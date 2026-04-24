import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure local development env vars are loaded when running via turbo/pnpm from repo root.
dotenv.config({ path: resolve(__dirname, '../.env') });

export const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

export const GITHUB_TOKEN = process.env['GITHUB_TOKEN'] ?? '';
export const GITHUB_OWNER = process.env['GITHUB_OWNER'] ?? '';
export const GITHUB_REPO = process.env['GITHUB_REPO'] ?? 'deploytitan-demo';
export const GITHUB_BRANCH = process.env['GITHUB_BRANCH'] ?? 'main';

export const DEPLOYTITAN_API_URL = process.env['DEPLOYTITAN_API_URL'] ?? '';
export const DEPLOYTITAN_API_KEY = process.env['DEPLOYTITAN_API_KEY'] ?? '';
export const CORE_SERVICE_NAME =
  process.env['SERVICE_NAME'] ?? 'core-api-service';
export const ENVIRONMENT = process.env['ENVIRONMENT'] ?? 'production';

export const CONTROLLER_URL = process.env['CONTROLLER_URL'] ?? '';
export const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? '*';
