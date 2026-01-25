
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load backend env
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    console.log(`Connecting to ${url}...`);
    const start = performance.now();
    
    // Use a simple query that should always work (e.g. select count from a public table or just check health)
    // We'll try to select from profiles, but limited to 1 just to check handshake
    // If profiles is empty, it returns []
    try {
        const { data, error, count } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        const end = performance.now();
        
        if (error) {
            console.error("Connection failed:", error);
        } else {
            console.log(`Success! Ping: ${(end - start).toFixed(2)}ms`);
            console.log(`Profiles count: ${count}`);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testConnection();
