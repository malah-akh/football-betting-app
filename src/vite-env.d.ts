/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SKIP_EMAIL_CONFIRMATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
