import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function createMissingEnvClient() {
  const missing = [
    !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean)

  const error = new Error(
    `Supabase env vars missing: ${missing.join(', ')}. Set them in your Vite env and restart the dev server.`
  )

  const reject = async () => {
    throw error
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: reject,
      signInWithOAuth: reject,
      linkIdentity: reject,
      signOut: reject,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: async () => ({ data: null, error }),
        }),
      }),
    }),
  } as any
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMissingEnvClient()