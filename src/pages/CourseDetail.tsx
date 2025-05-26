
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createRazorpayOrder, initializeRazorpayPayment, processPaymentSuccess } from '@/services/razorpayService';
import { BookOpen, Clock, Users, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  referral_reward: number;
  is_active: boolean;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndAccess = async () => {
      if (!courseId || !user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .eq('is_active', true)
          .single();
          
        if (courseError) {
          console.error('Error fetching course:', courseError);
          toast({
            title: "Error",
            description: "Course not found",
            variant: "destructive"
          });
          return;
        }
        
        setCourse(courseData);
        
        // Check if user has access
        const { data: purchase, error: purchaseError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .eq('payment_status', 'completed')
          .single();
          
        if (purchaseError && purchaseError.code !== 'PGRST116') {
          console.error('Error checking access:', purchaseError);
        } else if (purchase) {
          setHasAccess(true);
        }
        
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseAndAccess();
  }, [courseId, user, toast]);

  const handlePurchase = async () => {
    if (!user || !course) return;
    
    try {
      setIsProcessing(true);
      
      // Create Razorpay order
      const orderResult = await createRazorpayOrder(
        course.id,
        course.price,
        user.id,
        referralCode.trim() || undefined
      );
      
      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }
      
      // Initialize Razorpay payment
      initializeRazorpayPayment(
        {
          orderId: orderResult.data.id,
          amount: orderResult.data.amount,
          currency: orderResult.data.currency,
          userId: user.id,
          courseId: course.id,
          referralCode: referralCode.trim() || undefined
        },
        async (response) => {
          // Payment successful
          try {
            const processResult = await processPaymentSuccess(
              response,
              user.id,
              course.id,
              course.price,
              referralCode.trim() || undefined
            );
            
            if (processResult.success) {
              toast({
                title: "Payment Successful!",
                description: "You now have access to the course.",
              });
              setHasAccess(true);
              navigate(`/course/${courseId}/content`);
            } else {
              throw new Error(processResult.error);
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            toast({
              title: "Payment Error",
              description: "Payment was successful but there was an error processing your purchase. Please contact support.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        (error) => {
          // Payment failed
          console.error('Payment failed:', error);
          toast({
            title: "Payment Failed",
            description: "There was an error processing your payment. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      );
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleAccessCourse = () => {
    navigate(`/course/${courseId}/content`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[1200px] mx-auto w-full px-6 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              {course.thumbnail_url && (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md mb-6"
                />
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <Badge className="bg-[#00C853] text-white">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Web Course
                </Badge>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">Online Learning</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm">₹{course.referral_reward} Referral Reward</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">Course Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {course.description || "This comprehensive course will help you master essential skills and knowledge in this field."}
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {hasAccess ? 'Course Access' : 'Purchase Course'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasAccess ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✓ You have access to this course
                      </Badge>
                    </div>
                    <Button 
                      className="w-full bg-[#00C853] hover:bg-green-700"
                      onClick={handleAccessCourse}
                    >
                      Start Learning
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-2">₹{course.price}</div>
                      <p className="text-gray-600">One-time payment</p>
                    </div>
                    
                    <div className="mb-4">
                      <Label htmlFor="referralCode" className="text-sm text-gray-600">
                        Referral Code (optional)
                      </Label>
                      <Input 
                        type="text" 
                        id="referralCode" 
                        placeholder="Enter referral code" 
                        className="mt-1"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                      {referralCode && (
                        <p className="text-xs text-green-600 mt-1">
                          Your referrer will earn ₹{course.referral_reward} when you purchase!
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-[#00C853] hover:bg-green-700 mb-3"
                      onClick={handlePurchase}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Buy Now with Razorpay'}
                    </Button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Secure payment powered by Razorpay
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
