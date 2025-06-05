
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useSessionManager = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Update last activity on user interactions
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add event listeners for user activity (passive for performance)
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  return { lastActivity: lastActivityRef.current };
};
