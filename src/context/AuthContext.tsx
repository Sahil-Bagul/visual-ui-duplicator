
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  isAdmin: false,
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Optimized admin status check with caching
  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      
      // Use the RPC function for better performance
      const { data: adminStatus, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status via RPC:', error);
        // Fallback to direct table query
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          return false;
        }
        
        console.log('Admin status from users table:', userData?.is_admin);
        return userData?.is_admin || false;
      }
      
      console.log('Admin status from RPC:', adminStatus);
      return adminStatus || false;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  }, []);

  // Function to refresh auth state that can be called from outside
  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing auth:', error);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkAdminStatus]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsLoading(false);
          return;
        }
        
        // Set session and user if available
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status if user exists
        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Check admin status if user exists
        if (newSession?.user) {
          // Use setTimeout to avoid potential recursion in auth state change
          setTimeout(async () => {
            const adminStatus = await checkAdminStatus(newSession.user.id);
            setIsAdmin(adminStatus);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.success('Successfully logged in');
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred during login');
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.success('Successfully registered. Please check your email for verification.');
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during registration');
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signIn,
    signUp,
    isAdmin,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
