import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure local development env vars are loaded when running via turbo/pnpm from repo root.
dotenv.config({ path: resolve(__dirname, '../.env') });

export const CORE_SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'core-service';

export const PORT = parseInt(process.env['PORT'] ?? '8080', 10);
export const VERSION = process.env['VERSION'] ?? 'unknown';
export const OTLP_ENDPOINT =
  process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318';
export const OTLP_FLUSH_MS = parseInt(
  process.env['OTEL_FLUSH_INTERVAL_MS'] ?? '5000',
  10,
);
