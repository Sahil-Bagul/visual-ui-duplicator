
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

export type DailyMetric = AnalyticsMetric;

export type AnalyticsTimeframe = '7d' | '30d' | '90d' | 'all';

export const TIMEFRAMES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' }
];

interface MetricSummary {
  current: number;
  previous: number;
  percentChange: number;
}

export interface DashboardSummary {
  totalUsers: number;
  totalRevenue: number;
  totalCourses: number;
  totalPurchases: number;
  activeUsers: MetricSummary;
  newSignups: MetricSummary;
  revenue: MetricSummary;
  referrals: MetricSummary;
}

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

// Alias for getAnalyticsMetrics to match the expected function name
export const fetchAnalyticsData = getAnalyticsMetrics;

// Calculate metric summary (current period vs previous period)
export function calculateMetricSummary(
  data: AnalyticsMetric[], 
  metricKey: keyof AnalyticsMetric, 
  currentDays: number, 
  previousDays: number
): MetricSummary {
  if (!data || data.length === 0) {
    return { current: 0, previous: 0, percentChange: 0 };
  }

  // Sort data by date (newest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get current period data
  const currentPeriodData = sortedData.slice(0, currentDays);
  // Get previous period data
  const previousPeriodData = sortedData.slice(currentDays, currentDays + previousDays);

  // Calculate totals
  const currentTotal = currentPeriodData.reduce((sum, item) => 
    sum + Number(item[metricKey] || 0), 0);
  const previousTotal = previousPeriodData.reduce((sum, item) => 
    sum + Number(item[metricKey] || 0), 0);

  // Calculate percent change
  let percentChange = 0;
  if (previousTotal > 0) {
    percentChange = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  } else if (currentTotal > 0) {
    percentChange = 100; // If previous was 0 and current is not, that's a 100% increase
  }

  return {
    current: currentTotal,
    previous: previousTotal,
    percentChange
  };
}

// Fetch dashboard summary data
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    // Fetch metrics for last 60 days to have enough data for comparison
    const metrics = await getAnalyticsMetrics(60);
    
    // Calculate summary metrics
    const activeUsers = calculateMetricSummary(metrics, 'active_users', 7, 7);
    const newSignups = calculateMetricSummary(metrics, 'new_signups', 7, 7);
    const revenue = calculateMetricSummary(metrics, 'total_revenue', 7, 7);
    const referrals = calculateMetricSummary(metrics, 'referral_count', 7, 7);
    
    // Fetch total counts
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    const { count: coursesCount, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
      
    const { count: purchasesCount, error: purchasesError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
      
    const { data: revenueData } = await supabase
      .from('purchases')
      .select('course_id');
      
    // Calculate total revenue from purchases (simplified)
    const totalRevenue = metrics.reduce((sum, day) => sum + day.total_revenue, 0);
    
    // Handle the counts - they are returned directly in the count property
    const totalUsers = usersCount || 0;
    const totalCourses = coursesCount || 0;
    const totalPurchases = purchasesCount || 0;
    
    return {
      totalUsers,
      totalRevenue,
      totalCourses,
      totalPurchases,
      activeUsers,
      newSignups,
      revenue,
      referrals
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    // Return default values on error
    return {
      totalUsers: 0,
      totalRevenue: 0,
      totalCourses: 0,
      totalPurchases: 0,
      activeUsers: { current: 0, previous: 0, percentChange: 0 },
      newSignups: { current: 0, previous: 0, percentChange: 0 },
      revenue: { current: 0, previous: 0, percentChange: 0 },
      referrals: { current: 0, previous: 0, percentChange: 0 }
    };
  }
}

// Generate test analytics data (admin function)
export async function generateTestData(): Promise<{ success: boolean, message: string }> {
  try {
    const { error } = await supabase.rpc('generate_test_analytics_data');

    if (error) {
      console.error('Error generating test analytics data:', error);
      return { 
        success: false, 
        message: `Failed to generate test data: ${error.message}` 
      };
    }

    return { 
      success: true, 
      message: 'Test data generated successfully' 
    };
  } catch (error) {
    console.error('Exception generating test analytics data:', error);
    return { 
      success: false, 
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
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
