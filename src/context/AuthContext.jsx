import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminMembership } from '../lib/adminApi';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membership, setMembership] = useState(null);
  const [membershipError, setMembershipError] = useState(null);

  const refreshMembership = useCallback(async (nextUser = user) => {
    if (!isSupabaseConfigured || !supabase || !nextUser?.id) {
      setMembership(null);
      setMembershipError(null);
      setMembershipLoading(false);
      return null;
    }

    setMembershipLoading(true);

    try {
      const nextMembership = await fetchAdminMembership(nextUser.id);
      setMembership(nextMembership);
      setMembershipError(null);
      return nextMembership;
    } catch (error) {
      const friendlyError = error instanceof Error
        ? error
        : new Error('Failed to verify admin access.');
      setMembership(null);
      setMembershipError(friendlyError);
      return null;
    } finally {
      setMembershipLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    async function bootstrapSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setLoading(false);
        return;
      }

      const nextSession = data.session ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    }

    bootstrapSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshMembership(user);
  }, [refreshMembership, user]);

  const signInWithPassword = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }, []);

  const signUpWithPassword = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setMembership(null);
    setMembershipError(null);
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    membership,
    membershipLoading,
    membershipError,
    isConfigured: isSupabaseConfigured,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(membership?.role === 'admin'),
    signInWithPassword,
    signUpWithPassword,
    signOut,
    refreshMembership,
  }), [
    session,
    user,
    loading,
    membership,
    membershipLoading,
    membershipError,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    refreshMembership,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
