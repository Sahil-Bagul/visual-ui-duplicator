
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useSessionManager = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const hasInitializedRef = useRef(false);
  const activityTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Optimized activity tracking
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      
      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      // Set new timeout for activity tracking
      activityTimeoutRef.current = setTimeout(() => {
        // User inactive for 30 minutes - could trigger cleanup
        console.log('User inactive for extended period');
      }, 30 * 60 * 1000);
    };

    // Optimized event listeners with throttling
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    let throttleTimer: NodeJS.Timeout;
    
    const throttledUpdateActivity = () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(updateActivity, 1000); // Throttle to 1 second
    };

    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { 
        passive: true,
        capture: false 
      });
    });

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [user]);

  return { lastActivity: lastActivityRef.current };
};
