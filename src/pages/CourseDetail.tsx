import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  referral_reward: number;
  pdf_url?: string;
}

const CourseDetail: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M10 4.5V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14C2.73478 14 2.48043 13.8946 2.29289 13.7071C2.10536 13.5196 2 13.2652 2 13V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H7C7.79565 2 8.55871 2.31607 9.12132 2.87868C9.68393 3.44129 10 4.20435 10 5C10 4.20435 10.3161 3.44129 10.8787 2.87868C11.4413 2.31607 12.2044 2 13 2H17C17.2652 2 17.5196 2.10536 17.7071 2.29289C17.8946 2.48043 18 2.73478 18 3V13C18 13.2652 17.8946 13.5196 17.7071 13.7071C17.5196 13.8946 17.2652 14 17 14H13C12.2044 14 11.4413 13.6839 10.8787 13.1213C10.3161 12.5587 10 11.7956 10 11C10 11.7956 9.68393 12.5587 9.12132 13.1213C8.55871 13.6839 7.79565 14 7 14H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm">PDF Course</span>
            </div>
          </div>

          <div className="mb-6 text-gray-600">
            <p className="mb-4">{course.description}</p>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {isPurchased ? (
            <div className="mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                <p className="text-green-700 font-medium">You've already purchased this course</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 mr-2" onClick={() => navigate('/my-courses')}>View in My Courses</Button>
              <Button variant="outline" onClick={() => navigate('/referrals')}>Manage Referrals</Button>
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
