import { create } from 'zustand';
import { supabase } from '../api/supabaseClient';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user as User, session: data.session });
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user as User, session: data.session });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  loadUser: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      // Пытаемся получить профиль
      let { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      // Если профиля нет — создаём
      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: data.session.user.id,
            username: data.session.user.email,
            avatar_url: null,
          }])
          .select()
          .single();

        if (!insertError) {
          userData = newProfile;
        } else {
          console.error('Ошибка создания профиля:', insertError);
        }
      }

      set({ user: userData as User, session: data.session, isLoading: false });
    } else {
      set({ user: null, session: null, isLoading: false });
    }
  },
}));

useAuthStore.getState().loadUser();