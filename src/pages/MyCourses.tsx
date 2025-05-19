
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  pdf_url?: string;
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user's purchased courses
        const { data, error } = await supabase
          .from('purchases')
          .select('course:courses(*)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Extract course data from the join
        const purchasedCourses = data?.map(item => item.course as Course) || [];
        setCourses(purchasedCourses);
        
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load your courses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyCourses();
  }, [user, toast]);

  const handleDownload = (course: Course) => {
    // In a real app, this would download the PDF or open it in a new tab
    toast({
      title: "Download Started",
      description: `Downloading ${course.title}...`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Courses</h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading your courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-xs font-semibold">
                    PDF Course
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleDownload(course)}
                    className="bg-[#4F46E5] hover:bg-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/referrals')}
                  >
                    Share & Earn
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6m0 0v14m0-14h6m-6 0H6" />
                <rect x="2" y="6" width="20" height="16" rx="2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No courses yet</h2>
            <p className="text-gray-500 text-center mb-6">Get started by purchasing your first course.</p>
            <Button asChild className="bg-[#4F46E5] hover:bg-blue-700">
              <Link to="/dashboard">Browse Courses</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCourses;
