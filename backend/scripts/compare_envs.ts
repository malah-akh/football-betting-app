
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load backend env
const backendConfig = dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') }).parsed;

// Load frontend env
const frontendConfig = dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env') }).parsed;

console.log("--- ENV COMPARISON ---");

const backendUrl = backendConfig?.SUPABASE_URL || 'MISSING';
const frontendUrl = frontendConfig?.VITE_SUPABASE_URL || 'MISSING';

console.log(`Backend URL:  ${backendUrl}`);
console.log(`Frontend URL: ${frontendUrl}`);

if (backendUrl === frontendUrl) {
    console.log("MATCH: URLs are identical.");
} else {
    console.warn("MISMATCH: URLs are different!");
}
