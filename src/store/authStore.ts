import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const REMEMBER_KEY = 'gp-storylab-remember';
const SESSION_ACTIVE_KEY = 'gp-storylab-session-active';

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
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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

  signIn: async (email, password, rememberMe = true) => {
    set({ error: null, pendingConfirmation: false });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
    } else {
      localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');
      sessionStorage.setItem(SESSION_ACTIVE_KEY, '1');
    }
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
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    await supabase.auth.signOut();
    // onAuthStateChange fires and sets user/session to null
  },

  enterGuestMode: () => set({ guestMode: true }),

  exitGuestMode: () => set({ guestMode: false }),

  _initialize: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If remember-me was off and this is a new browser session (not a reload), sign out
      if (
        session &&
        event === 'INITIAL_SESSION' &&
        localStorage.getItem(REMEMBER_KEY) === '0' &&
        sessionStorage.getItem(SESSION_ACTIVE_KEY) !== '1'
      ) {
        supabase.auth.signOut();
        set({ session: null, user: null, loading: false, guestMode: false });
        return;
      }
      // When a real auth event fires, clear guest mode
      set({ session, user: session?.user ?? null, loading: false, guestMode: false });
    });
    return () => subscription.unsubscribe();
  },
}));
