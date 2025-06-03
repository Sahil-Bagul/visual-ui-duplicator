
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSessionManager = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update last activity on user interactions
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Session validation without auto-refresh
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session validation error:', error);
          return;
        }

        // Only handle session expiry, don't force refresh
        if (!session && user) {
          console.log('Session expired, user will be redirected on next navigation');
        }
      } catch (error) {
        console.warn('Session check failed:', error);
      }
    };

    // Check session every 5 minutes instead of frequent checks
    if (user) {
      sessionCheckIntervalRef.current = setInterval(validateSession, 5 * 60 * 1000);
    }

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      
      // Clear interval
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [user]);

  return { lastActivity: lastActivityRef.current };
};
