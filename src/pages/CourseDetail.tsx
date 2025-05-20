
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Module, GetCourseModulesParams, GetCourseModulesResponse } from '@/types/course';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  referral_reward: number;
}

const CourseDetail: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch course modules (just titles for preview)
        const { data: modulesData, error: modulesError } = await supabase
          .rpc<GetCourseModulesResponse, GetCourseModulesParams>(
            'get_course_modules', 
            { course_id_param: id }
          );
          
        if (modulesError) {
          console.error("Error fetching modules via RPC:", modulesError);
          
          // Fallback to direct query
          const { data: directModulesData, error: directModulesError } = await supabase
            .from('course_modules')
            .select('id, title, module_order')
            .eq('course_id', id)
            .order('module_order', { ascending: true });
            
          if (directModulesError) throw directModulesError;
          setModules(directModulesData as Module[]);
        } else {
          setModules(modulesData);
        }
        
        // Check if user has purchased this course
        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .single();
            
          if (purchaseError && purchaseError.code !== 'PGRST116') {
            throw purchaseError;
          }
          
          setIsPurchased(!!purchaseData);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, user, toast]);

  const handleProceedToPayment = () => {
    if (!course) return;
    
    // Pass course information and referral code to payment page
    navigate('/payment', { 
      state: { 
        courseId: course.id,
        courseTitle: course.title,
        coursePrice: course.price,
        referralCode: referralCode.trim() || null
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
          <div className="flex justify-center py-8">Loading course details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Course not found</h1>
            <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <div className="inline-flex items-center text-blue-600">
              <BookOpen size={20} className="mr-1" />
              <span className="text-sm">Web Course</span>
            </div>
          </div>

          <div className="mb-6 text-gray-600">
            <p className="mb-4">{course.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">What You'll Learn</h2>
            <ul className="space-y-2">
              {modules.map((module) => (
                <li key={module.id} className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs mr-2 mt-0.5">
                    {module.module_order}
                  </span>
                  <span className="text-gray-700">{module.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {isPurchased ? (
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                <p className="text-green-700 font-medium">You've already purchased this course</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 mr-2" onClick={() => navigate(`/course-content/${course.id}`)}>
                Continue Learning
              </Button>
              <Button variant="outline" onClick={() => navigate('/referrals')}>
                Manage Referrals
              </Button>
            </div>
          ) : (
            <div className="flex flex-col mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">₹ {course.price}</span>
                <Button className="bg-[#00C853] hover:bg-green-700" onClick={handleProceedToPayment}>Buy Now</Button>
              </div>
              <div className="text-sm text-gray-500">Earn ₹ {course.referral_reward} per successful referral after purchase</div>
            </div>
          )}

          {!isPurchased && (
            <>
              <div className="border-t border-gray-200 my-6"></div>

              <div>
                <label htmlFor="referral-code" className="text-sm font-medium text-gray-700 block mb-2">
                  Have a referral code?
                </label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    placeholder="Enter referral code (optional)"
                    className="max-w-xs"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
