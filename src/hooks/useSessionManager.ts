
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSessionManager = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Update last activity on user interactions
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Very minimal session validation - only check if really needed
    const validateSession = async () => {
      try {
        // Only validate if user has been inactive for more than 30 minutes
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        if (lastActivityRef.current > thirtyMinutesAgo) {
          return; // User is active, skip validation
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session validation error (non-critical):', error);
          return;
        }

        // Only log session issues, don't force refresh
        if (!session && user) {
          console.log('Session may have expired, but not forcing refresh');
        }
      } catch (error) {
        console.warn('Session check failed (non-critical):', error);
      }
    };

    // Check session very infrequently - every 15 minutes
    if (user) {
      sessionCheckIntervalRef.current = setInterval(validateSession, 15 * 60 * 1000);
    }

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      
      // Clear interval
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };
  }, [user]);

  return { lastActivity: lastActivityRef.current };
};
