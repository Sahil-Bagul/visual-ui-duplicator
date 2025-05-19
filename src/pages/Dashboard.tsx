
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface Purchase {
  course_id: string;
}

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
          
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);
        
        // Fetch user's purchased courses
        if (user) {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('purchases')
            .select('course_id')
            .eq('user_id', user.id);
            
          if (purchasesError) throw purchasesError;
          setPurchasedCourses((purchasesData || []).map(purchase => purchase.course_id));
          
          // Fetch wallet balance
          const { data: walletData, error: walletError } = await supabase
            .from('wallet')
            .select('balance')
            .eq('user_id', user.id)
            .single();
            
          if (walletError && walletError.code !== 'PGRST116') {
            throw walletError;
          }
          
          if (walletData) {
            setWalletBalance(walletData.balance);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4">
        <WelcomeCard 
          userName={user?.user_metadata?.name || 'User'} 
          walletBalance={walletBalance} 
        />
        
        <section className="mt-8">
          <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Available Courses</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading courses...</p>
            </div>
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
                  isPurchased={purchasedCourses.includes(course.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
