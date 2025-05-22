
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DailyMetric {
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

export interface MetricSummary {
  current: number;
  previous: number;
  percentChange: number;
  increasing: boolean;
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

// Fetch analytics data for the specified number of days
export async function fetchAnalyticsData(days: number = 30): Promise<DailyMetric[]> {
  try {
    console.log(`Fetching analytics data for last ${days} days`);
    
    const { data, error } = await supabase.rpc('get_recent_analytics_metrics', {
      days_back: days
    });
    
    if (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      return [];
    }
    
    console.log(`Retrieved ${data.length} days of analytics data`);
    
    // Sort data by date (ascending)
    return data.sort((a: DailyMetric, b: DailyMetric) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Exception fetching analytics data:', error);
    toast.error('An unexpected error occurred while loading analytics');
    return [];
  }
}

// Calculate metric summary (current vs previous period)
export function calculateMetricSummary(
  data: DailyMetric[], 
  metricKey: keyof DailyMetric, 
  currentDays: number = 7,
  previousDays: number = 7
): MetricSummary {
  if (!data || data.length === 0) {
    return { current: 0, previous: 0, percentChange: 0, increasing: false };
  }
  
  // Get most recent data for current period
  const currentPeriodData = data.slice(Math.max(0, data.length - currentDays));
  
  // Get data for previous period
  const previousPeriodData = data.slice(
    Math.max(0, data.length - currentDays - previousDays),
    data.length - currentDays
  );
  
  // Calculate sums
  const currentSum = currentPeriodData.reduce(
    (sum, item) => sum + (Number(item[metricKey]) || 0), 
    0
  );
  
  const previousSum = previousPeriodData.reduce(
    (sum, item) => sum + (Number(item[metricKey]) || 0), 
    0
  );
  
  // Calculate percent change
  let percentChange = 0;
  
  if (previousSum > 0) {
    percentChange = ((currentSum - previousSum) / previousSum) * 100;
  } else if (currentSum > 0) {
    percentChange = 100; // If previous was 0 and current is non-zero, that's a 100% increase
  }
  
  return {
    current: currentSum,
    previous: previousSum,
    percentChange: Math.round(percentChange * 100) / 100, // Round to 2 decimals
    increasing: currentSum >= previousSum,
  };
}

// Fetch dashboard summary data
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    // Fetch analytics data for the last 30 days
    const analyticsData = await fetchAnalyticsData(30);
    
    // Calculate metric summaries
    const activeUsers = calculateMetricSummary(analyticsData, 'active_users', 7, 7);
    const newSignups = calculateMetricSummary(analyticsData, 'new_signups', 7, 7);
    const revenue = calculateMetricSummary(analyticsData, 'total_revenue', 7, 7);
    const referrals = calculateMetricSummary(analyticsData, 'referral_count', 7, 7);
    
    // Fetch total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total courses count
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total purchases count
    const { count: totalPurchases } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true });
    
    // Calculate total revenue
    const { data: revenueData } = await supabase
      .from('analytics_daily_metrics')
      .select('total_revenue')
      .order('date', { ascending: false })
      .limit(30);
    
    const totalRevenue = revenueData?.reduce(
      (sum, item) => sum + (item.total_revenue || 0), 
      0
    ) || 0;
    
    return {
      totalUsers: totalUsers || 0,
      totalRevenue,
      totalCourses: totalCourses || 0,
      totalPurchases: totalPurchases || 0,
      activeUsers,
      newSignups,
      revenue,
      referrals,
    };
  } catch (error) {
    console.error('Exception fetching dashboard summary:', error);
    toast.error('Failed to load dashboard summary');
    
    return {
      totalUsers: 0,
      totalRevenue: 0,
      totalCourses: 0,
      totalPurchases: 0,
      activeUsers: { current: 0, previous: 0, percentChange: 0, increasing: false },
      newSignups: { current: 0, previous: 0, percentChange: 0, increasing: false },
      revenue: { current: 0, previous: 0, percentChange: 0, increasing: false },
      referrals: { current: 0, previous: 0, percentChange: 0, increasing: false },
    };
  }
}

// Generate test analytics data
export async function generateTestData(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Generating test analytics data');
    
    // Call the RPC function to generate test data
    const { error } = await supabase.rpc('generate_test_analytics_data');
    
    if (error) {
      console.error('Error generating test data:', error);
      return {
        success: false,
        message: `Failed to generate test data: ${error.message}`
      };
    }
    
    console.log('Test data generated successfully');
    return {
      success: true,
      message: 'Test analytics data generated successfully'
    };
  } catch (error) {
    console.error('Exception generating test data:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
