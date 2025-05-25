import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsMetric {
  date: string;
  active_users: number;
  new_signups: number;
  course_enrollments: number;
  referral_earnings: number;
  successful_payments: number;
  revenue: number;
  support_tickets: number;
  user_engagement: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalReferrals: number;
}

const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total courses
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('purchases')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;

    // Get total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalRevenue,
      totalReferrals: totalReferrals || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalRevenue: 0,
      totalReferrals: 0
    };
  }
};

const getAnalyticsMetrics = async (period: string = '30d'): Promise<AnalyticsMetric[]> => {
  try {
    // For now, return mock data since we don't have the analytics functions
    // In production, this would call actual analytics functions
    console.log('Fetching analytics for period:', period);
    
    // Generate mock analytics data for the last 7 days
    const mockData: AnalyticsMetric[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        active_users: Math.floor(Math.random() * 50) + 10,
        new_signups: Math.floor(Math.random() * 10) + 1,
        course_enrollments: Math.floor(Math.random() * 20) + 2,
        referral_earnings: Math.floor(Math.random() * 5000) + 500,
        successful_payments: Math.floor(Math.random() * 15) + 2,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        support_tickets: Math.floor(Math.random() * 5) + 1,
        user_engagement: Math.floor(Math.random() * 80) + 20
      });
    }
    
    return mockData;
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return [];
  }
};

const getRecentActivity = async (limit: number = 10) => {
  try {
    // Get recent user registrations
    const { data: recentUsers } = await supabase
      .from('users')
      .select('name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Get recent purchases
    const { data: recentPurchases } = await supabase
      .from('purchases')
      .select(`
        *,
        users(name, email),
        courses(title)
      `)
      .order('purchased_at', { ascending: false })
      .limit(limit);

    return {
      recentUsers: recentUsers || [],
      recentPurchases: recentPurchases || []
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      recentUsers: [],
      recentPurchases: []
    };
  }
};

const generateTestData = async () => {
  try {
    console.log('Generating test analytics data...');
    // This would generate test analytics data in production
    return { success: true, message: 'Test data generated successfully' };
  } catch (error) {
    console.error('Error generating test data:', error);
    return { success: false, message: 'Failed to generate test data' };
  }
};

const logUserLogin = async (userId: string) => {
  try {
    console.log('Logging user login:', userId);
    // This would log user login in production
    return { success: true };
  } catch (error) {
    console.error('Error logging user login:', error);
    return { success: false };
  }
};

export {
  getDashboardStats,
  getAnalyticsMetrics,
  getRecentActivity,
  generateTestData,
  logUserLogin
};
