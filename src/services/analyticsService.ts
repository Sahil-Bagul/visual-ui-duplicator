
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetric {
  date: string;
  active_users: number;
  new_signups: number;
  course_enrollments: number;
  lesson_completions: number;
  total_revenue: number;
  referral_commissions: number;
  referral_count: number;
  course_completion_rate: number;
}

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | 'all';

export const TIMEFRAMES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' }
];

// Function to get analytics metrics based on time period
export async function getAnalyticsMetrics(days: number = 30): Promise<AnalyticsMetric[]> {
  try {
    const { data, error } = await supabase.rpc('get_recent_analytics_metrics', {
      days_back: days
    });

    if (error) {
      console.error('Error fetching analytics metrics:', error);
      return [];
    }

    return data as AnalyticsMetric[];
  } catch (error) {
    console.error('Exception fetching analytics metrics:', error);
    return [];
  }
}

// Log user login activity
export async function logUserLogin(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.error('Cannot log login: No user ID provided');
      return false;
    }

    const { error } = await supabase.rpc('log_user_login', {
      user_id_param: userId
    });

    if (error) {
      console.error('Error logging user login:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception logging user login:', error);
    return false;
  }
}

// Generate test analytics data (admin function)
export async function generateTestAnalyticsData(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('generate_test_analytics_data');

    if (error) {
      console.error('Error generating test analytics data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception generating test analytics data:', error);
    return false;
  }
}

// Convert timeframe string to number of days
export function timeframeToDays(timeframe: AnalyticsTimeframe): number {
  switch (timeframe) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case 'all': return 365; // Just use a large number for "all time"
    default: return 30;
  }
}
