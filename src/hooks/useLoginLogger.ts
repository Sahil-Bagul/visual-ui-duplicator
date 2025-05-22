
import { useEffect } from 'react';
import { logUserLogin } from '@/services/analyticsService';

export function useLoginLogger(userId: string | undefined, isAuthenticated: boolean) {
  useEffect(() => {
    // Only log if authenticated and has a userId
    if (isAuthenticated && userId) {
      // Log the login event
      logUserLogin(userId).catch((error) => {
        console.error('Failed to log user login:', error);
      });
    }
  }, [userId, isAuthenticated]);
}
