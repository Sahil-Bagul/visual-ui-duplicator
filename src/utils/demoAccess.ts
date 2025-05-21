
import { supabase } from '@/integrations/supabase/client';

// This file is kept for backward compatibility
// Demo user access is now managed manually through database entries

/**
 * Checks if the current user is the demo user with special access
 * This function is kept for backward compatibility but will always return false
 * @returns {Promise<boolean>} Always returns false as demo access is now managed manually
 */
export const isDemoUser = async (): Promise<boolean> => {
  return false;
};

/**
 * This function is now deprecated as demo access is managed manually
 * @returns {Promise<void>}
 */
export const grantDemoUserAccess = async (): Promise<void> => {
  console.log("Demo access is now managed manually through database entries");
  return;
};
