import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toAdminError } from '@/lib/adminErrors';
import { safeAdminRedirect } from '@/lib/redirect';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
        setSessionExpired(true);
        await supabase.auth.signOut();
      }
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        setLoading(false);
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        if (event === 'TOKEN_REFRESHED' && !session) setSessionExpired(true);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setSessionExpired(false);
        setUser(session.user);
        await fetchProfile(session.user.id);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(toAdminError(error));
    return data;
  }

  async function signUp({ email, password, displayName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          preferred_language: 'sv',
        },
        emailRedirectTo: `${window.location.origin}/admin/login`,
      },
    });
    if (error) throw new Error(toAdminError(error));
    return data;
  }

  async function signInWithGoogle(redirectPath = '/admin') {
    const redirectTo = `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(safeAdminRedirect(redirectPath))}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw new Error(toAdminError(error));
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSessionExpired(false);
  }

  async function resetPasswordForEmail(email) {
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(toAdminError(error));
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(toAdminError(error));
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  const role = profile?.role ?? 'viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        sessionExpired,
        role,
        isAdmin: role === 'admin',
        isEditor: role === 'editor',
        canAccessAdmin: role === 'admin' || role === 'editor',
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        refreshProfile,
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
