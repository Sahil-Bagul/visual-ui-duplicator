
import { supabase } from "@/integrations/supabase/client";

export interface DailyMetric {
  id: string;
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

export interface AnalyticsTimeframe {
  days: number;
  label: string;
}

export const TIMEFRAMES: AnalyticsTimeframe[] = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

export async function fetchAnalyticsData(days: number = 30): Promise<DailyMetric[]> {
  // Get date for specified number of days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics_daily_metrics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
  
  return data || [];
}

export async function generateTestData(): Promise<{ success: boolean, message: string }> {
  try {
    const { data, error } = await supabase.rpc('generate_test_analytics_data');
    
    if (error) {
      console.error('Error generating test data:', error);
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
    console.error('Exception when generating test data:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function fetchDashboardSummary(): Promise<{
  totalUsers: number;
  totalRevenue: number;
  totalCourses: number;
  totalPurchases: number;
  activeUsers: { current: number; previous: number; percentChange: number };
  newSignups: { current: number; previous: number; percentChange: number };
  revenue: { current: number; previous: number; percentChange: number };
  referrals: { current: number; previous: number; percentChange: number };
}> {
  try {
    // Get current date and date 14 days ago
    const currentDate = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(currentDate.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);
    
    // Format dates for comparison
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    
    // Fetch analytics metrics
    const { data: metricsData } = await supabase
      .from('analytics_daily_metrics')
      .select('*')
      .gte('date', twoWeeksAgoStr)
      .lte('date', currentDateStr)
      .order('date', { ascending: true });
    
    // Fetch total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total revenue from purchases
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select(`
        course:courses(price)
      `);
    
    const totalRevenue = purchasesData?.reduce((sum, purchase) => {
      return sum + (purchase.course?.price || 0);
    }, 0) || 0;
    
    // Fetch total courses
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total purchases
    const { count: totalPurchases } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
    
    // Calculate metrics for current week and previous week
    const currentWeekMetrics = metricsData?.filter(
      (metric) => new Date(metric.date) >= oneWeekAgo
    ) || [];
    
    const previousWeekMetrics = metricsData?.filter(
      (metric) => new Date(metric.date) >= twoWeeksAgo && new Date(metric.date) < oneWeekAgo
    ) || [];
    
    // Calculate sums for metrics
    const sumMetric = (metrics: DailyMetric[], field: keyof DailyMetric): number => {
      return metrics.reduce((sum, metric) => sum + (Number(metric[field]) || 0), 0);
    };
    
    // Calculate active users
    const currentActiveUsers = sumMetric(currentWeekMetrics, 'active_users');
    const previousActiveUsers = sumMetric(previousWeekMetrics, 'active_users');
    const activeUsersPercentChange = previousActiveUsers > 0 
      ? ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) * 100
      : currentActiveUsers > 0 ? 100 : 0;
    
    // Calculate new signups
    const currentSignups = sumMetric(currentWeekMetrics, 'new_signups');
    const previousSignups = sumMetric(previousWeekMetrics, 'new_signups');
    const signupsPercentChange = previousSignups > 0
      ? ((currentSignups - previousSignups) / previousSignups) * 100
      : currentSignups > 0 ? 100 : 0;
    
    // Calculate revenue
    const currentRevenue = sumMetric(currentWeekMetrics, 'total_revenue');
    const previousRevenue = sumMetric(previousWeekMetrics, 'total_revenue');
    const revenuePercentChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0;
    
    // Calculate referrals
    const currentReferrals = sumMetric(currentWeekMetrics, 'referral_count');
    const previousReferrals = sumMetric(previousWeekMetrics, 'referral_count');
    const referralsPercentChange = previousReferrals > 0
      ? ((currentReferrals - previousReferrals) / previousReferrals) * 100
      : currentReferrals > 0 ? 100 : 0;
    
    return {
      totalUsers: totalUsers || 0,
      totalRevenue,
      totalCourses: totalCourses || 0,
      totalPurchases: totalPurchases || 0,
      activeUsers: {
        current: currentActiveUsers,
        previous: previousActiveUsers,
        percentChange: parseFloat(activeUsersPercentChange.toFixed(2))
      },
      newSignups: {
        current: currentSignups,
        previous: previousSignups,
        percentChange: parseFloat(signupsPercentChange.toFixed(2))
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        percentChange: parseFloat(revenuePercentChange.toFixed(2))
      },
      referrals: {
        current: currentReferrals,
        previous: previousReferrals,
        percentChange: parseFloat(referralsPercentChange.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
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

export async function logUserLogin(userId: string): Promise<void> {
  const { error } = await supabase.rpc('log_user_login', {
    user_id_param: userId
  });
  
  if (error) {
    console.error('Error logging user login:', error);
  }
}

export interface MetricSummary {
  current: number;
  previous: number;
  percentChange: number;
}

export function calculateMetricSummary(
  metrics: DailyMetric[], 
  field: keyof DailyMetric, 
  currentDays: number = 7,
  previousDays: number = 7
): MetricSummary {
  if (metrics.length === 0) {
    return { current: 0, previous: 0, percentChange: 0 };
  }
  
  // Sort metrics by date
  const sortedMetrics = [...metrics].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get the most recent metrics for current period
  const currentMetrics = sortedMetrics.slice(-currentDays);
  
  // Get the metrics for previous period
  const previousMetrics = sortedMetrics.slice(-currentDays - previousDays, -currentDays);
  
  // Calculate sums
  const currentSum = currentMetrics.reduce((sum, metric) => 
    sum + (typeof metric[field] === 'number' ? Number(metric[field]) : 0), 0);
    
  const previousSum = previousMetrics.reduce((sum, metric) => 
    sum + (typeof metric[field] === 'number' ? Number(metric[field]) : 0), 0);
  
  // Calculate percent change
  let percentChange = 0;
  if (previousSum > 0) {
    percentChange = ((currentSum - previousSum) / previousSum) * 100;
  } else if (currentSum > 0) {
    percentChange = 100; // If previous was 0 and current is positive, that's a 100% increase
  }
  
  return {
    current: currentSum,
    previous: previousSum,
    percentChange: parseFloat(percentChange.toFixed(2))
  };
}
