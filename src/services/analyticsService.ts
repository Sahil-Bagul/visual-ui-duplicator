
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
