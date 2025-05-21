
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsPeriodSelector from './AnalyticsPeriodSelector';
import MetricCard from './MetricCard';
import AnalyticsChart from './AnalyticsChart';
import {
  fetchAnalyticsData,
  calculateMetricSummary,
  generateTestData,
  DailyMetric
} from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

const AnalyticsDashboard: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const { toast } = useToast();
  
  // Fetch analytics data
  const { 
    data: analyticsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics', selectedDays],
    queryFn: () => fetchAnalyticsData(selectedDays),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Calculate metric summaries
  const userMetrics = calculateMetricSummary(analyticsData || [], 'active_users', 7, 7);
  const signupMetrics = calculateMetricSummary(analyticsData || [], 'new_signups', 7, 7);
  const revenueMetrics = calculateMetricSummary(analyticsData || [], 'total_revenue', 7, 7);
  const referralMetrics = calculateMetricSummary(analyticsData || [], 'referral_count', 7, 7);
  
  // Handle generating test data
  const handleGenerateTestData = async () => {
    if (isGeneratingData) return;
    
    setIsGeneratingData(true);
    try {
      const result = await generateTestData();
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      
      if (result.success) {
        // Refetch the analytics data after generating test data
        await refetch();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test data",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingData(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Analytics Dashboard</h2>
          <p className="text-gray-500">Track key metrics for your platform</p>
        </div>
        
        <div className="flex gap-2">
          <AnalyticsPeriodSelector 
            selectedDays={selectedDays} 
            onSelectDays={setSelectedDays} 
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading analytics data. Please try again.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Key metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Users" 
          value={userMetrics.current} 
          change={userMetrics.percentChange} 
          loading={isLoading}
        />
        <MetricCard 
          title="New Sign-ups" 
          value={signupMetrics.current} 
          change={signupMetrics.percentChange}
          loading={isLoading}
        />
        <MetricCard 
          title="Revenue" 
          value={revenueMetrics.current} 
          change={revenueMetrics.percentChange}
          prefix="₹"
          loading={isLoading}
        />
        <MetricCard 
          title="Referrals" 
          value={referralMetrics.current} 
          change={referralMetrics.percentChange}
          loading={isLoading}
        />
      </div>
      
      {/* Dashboard tabs */}
      <Tabs 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <AnalyticsChart
            title="Activity Overview"
            data={analyticsData || []}
            type="line"
            loading={isLoading}
            dataKeys={[
              { key: 'active_users', name: 'Active Users', color: '#2196F3' },
              { key: 'course_enrollments', name: 'Course Enrollments', color: '#00C853' },
            ]}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="User Growth"
              data={analyticsData || []}
              type="area"
              loading={isLoading}
              dataKeys={[
                { key: 'new_signups', name: 'New Sign-ups', color: '#2196F3' },
              ]}
            />
            
            <AnalyticsChart
              title="Daily Active Users"
              data={analyticsData || []}
              type="line"
              loading={isLoading}
              dataKeys={[
                { key: 'active_users', name: 'Active Users', color: '#FF9800' },
              ]}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Revenue"
              data={analyticsData || []}
              type="bar"
              loading={isLoading}
              dataKeys={[
                { key: 'total_revenue', name: 'Total Revenue', color: '#00C853' },
                { key: 'referral_commissions', name: 'Referral Commissions', color: '#673AB7' },
              ]}
            />
            
            <AnalyticsChart
              title="Referral Performance"
              data={analyticsData || []}
              type="line"
              loading={isLoading}
              dataKeys={[
                { key: 'referral_count', name: 'Referral Count', color: '#FF5722' },
              ]}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Course Enrollments"
              data={analyticsData || []}
              type="bar"
              loading={isLoading}
              dataKeys={[
                { key: 'course_enrollments', name: 'New Enrollments', color: '#2196F3' },
              ]}
            />
            
            <AnalyticsChart
              title="Lesson Completions"
              data={analyticsData || []}
              type="line"
              loading={isLoading}
              dataKeys={[
                { key: 'lesson_completions', name: 'Completed Lessons', color: '#4CAF50' },
                { key: 'course_completion_rate', name: 'Completion Rate (%)', color: '#673AB7' },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Generate test data button */}
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={handleGenerateTestData}
          disabled={isGeneratingData}
        >
          {isGeneratingData ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Data...
            </>
          ) : (
            'Generate Demo Data'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
