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
  /** True when the user chose to use the app without logging in. */
  guestMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  /** Call once in main.tsx. Returns an unsubscribe function. */
  _initialize: () => () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  pendingConfirmation: false,
  guestMode: false,

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

  enterGuestMode: () => set({ guestMode: true }),

  exitGuestMode: () => set({ guestMode: false }),

  _initialize: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // When a real auth event fires, clear guest mode
      set({ session, user: session?.user ?? null, loading: false, guestMode: false });
    });
    return () => subscription.unsubscribe();
  },
}));
