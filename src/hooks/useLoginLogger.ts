
import { useCallback } from 'react';
import { logUserLogin } from '@/services/analyticsService';

export function useLoginLogger() {
  const logLogin = useCallback(async (userId: string) => {
    try {
      await logUserLogin(userId);
    } catch (error) {
      console.error('Failed to log user login:', error);
    }
  }, []);

  return { logLogin };
}
