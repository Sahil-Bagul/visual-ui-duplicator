
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import Header from '@/components/layout/Header';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';
import { supabase } from '@/integrations/supabase/client';
import { initializeAppData } from '@/utils/autoSetupCourses';

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      
      // Initialize data if needed
      await initializeAppData(undefined);
      
      // Fetch courses
      const { data, error } = await supabase
        .from('courses')
        .select('*');
        
      if (!error && data) {
        setCourses(data);
      }
      
      setIsLoading(false);
    };
    
    fetchCourses();
  }, []);

  // Toggle between login and dashboard views for demo purposes
  const toggleView = () => {
    setIsLoggedIn(!isLoggedIn);
  };
  
  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };
  
  return <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {!isLoggedIn ?
        // Login/Signup View
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-[993px] w-full h-screen flex justify-center items-center mx-auto max-md:max-w-[991px] max-sm:max-w-screen-sm">
            <div className="flex flex-col items-center gap-8 w-full max-w-md">
              <div className="text-center pt-6">
                <h1 className="text-[26px] text-gray-900 mb-2">Learn &amp; Earn</h1>
                <p className="text-xs text-gray-600">Learn new skills and earn through referrals</p>
              </div>
              <AuthForm />
            </div>
          </div>
        </div> :
        // Dashboard View
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4">
            <WelcomeCard userName="Rahul" walletBalance={0} />
            <section>
              <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Available Courses</h2>
              {isLoading ? (
                <div className="flex justify-center py-4">Loading courses...</div>
              ) : (
                <div className="flex gap-6 max-md:flex-col">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      description={course.description}
                      price={course.price}
                      type="PDF Course"
                      onClick={() => handleCourseClick(course.id)}
                    />
                  ))}
                </div>
              )}
            </section>
            <div className="mt-8 flex gap-4 justify-center">
              <button onClick={toggleView} className="text-xs text-blue-600 underline">
                Demo: Back to Login
              </button>
              <button onClick={() => navigate('/my-courses')} className="text-xs text-blue-600 underline">
                View My Courses
              </button>
            </div>
          </main>
        </div>}
    </>;
};
export default Index;
