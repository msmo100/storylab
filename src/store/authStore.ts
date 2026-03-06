import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthStore {
  user: User | null;
  session: Session | null;
  /** True while the initial Supabase session check is in flight — prevents routing flashes. */
  loading: boolean;
  error: string | null;
  /** True when signup succeeded but email confirmation is required before login. */
  pendingConfirmation: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Call once in main.tsx. Returns an unsubscribe function. */
  _initialize: () => () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  pendingConfirmation: false,

  signIn: async (email, password) => {
    set({ error: null, pendingConfirmation: false });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) set({ error: error.message });
    // onAuthStateChange automatically updates user/session
  },

  signUp: async (email, password) => {
    set({ error: null, pendingConfirmation: false });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
    } else if (!data.session) {
      // Supabase requires email confirmation — session won't exist until confirmed
      set({ pendingConfirmation: true });
    }
    // If session exists, onAuthStateChange handles the redirect
  },

  signOut: async () => {
    set({ error: null });
    await supabase.auth.signOut();
    // onAuthStateChange fires and sets user/session to null
  },

  _initialize: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
    });
    return () => subscription.unsubscribe();
  },
}));
