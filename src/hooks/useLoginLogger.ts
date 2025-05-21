
import { useEffect } from 'react';
import { logUserLogin } from '../services/analyticsService';

/**
 * Hook to log user logins for analytics
 * @param userId The user ID to log
 * @param isAuthenticated Boolean indicating if user is authenticated
 */
export function useLoginLogger(userId: string | undefined, isAuthenticated: boolean) {
  useEffect(() => {
    // Only proceed with logging if we have both a userId and the user is authenticated
    if (userId && isAuthenticated) {
      const logLogin = async () => {
        try {
          await logUserLogin(userId);
          console.log('User login logged for analytics');
        } catch (error) {
          console.error('Error logging user login:', error);
        }
      };
      
      logLogin();
    }
  }, [userId, isAuthenticated]);
}
