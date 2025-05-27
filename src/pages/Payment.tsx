
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createRazorpayOrder, initializeRazorpayPayment, processPaymentSuccess } from '@/services/razorpayService';
import { Loader2, Shield, CreditCard } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  referral_reward: number;
}

const Payment: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string>(location.state?.referralCode || '');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        
        setCourse(courseData as Course);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, toast, navigate]);

  const handleRazorpayPayment = async () => {
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
      
      if (!orderResult.success || !orderResult.data) {
        throw new Error(orderResult.error || 'Failed to create order');
      }
      
      // Initialize Razorpay payment
      await initializeRazorpayPayment(
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
              navigate('/payment-success', { 
                state: { 
                  courseId: course.id, 
                  courseName: course.title,
                  amount: course.price 
                } 
              });
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

  const handleDemoPayment = async () => {
    if (!user || !course) return;
    
    try {
      setIsProcessing(true);
      console.log('Processing demo payment...');
      
      const purchaseData = {
        user_id: user.id,
        course_id: course.id,
        amount: 0,
        payment_id: 'demo_' + Date.now(),
        payment_status: 'completed',
        has_used_referral_code: Boolean(referralCode),
        used_referral_code: referralCode || null,
        purchased_at: new Date().toISOString()
      };
      
      const { data: purchaseRecord, error: purchaseError } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();
        
      if (purchaseError) throw purchaseError;
      
      toast({
        title: "Demo Access Granted!",
        description: "You can now preview the course content.",
      });
      
      navigate(`/course/${courseId}/content`);
      
    } catch (error) {
      console.error('Error in demo payment:', error);
      toast({
        title: "Error",
        description: "There was an error processing your demo access. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#00C853] mx-auto mb-3" />
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure payment powered by Razorpay</p>
        </div>

        {course ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{course.title}</span>
                    <Badge variant="outline">Web Course</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{course.description}</p>
                  
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      className="rounded-lg shadow-sm w-full mb-4" 
                    />
                  )}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">🎯 What You'll Get:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ Interactive web-based modules</li>
                      <li>✅ Progress tracking system</li>
                      <li>✅ Lifetime access to content</li>
                      <li>✅ Earn ₹{course.referral_reward} per referral</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Payment Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-[#00C853]" />
                    <span>Payment Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Course Price:</span>
                    <span className="text-2xl font-bold text-[#00C853]">₹{course.price}</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="referralCode" className="text-sm font-medium">
                      Referral Code (optional)
                    </Label>
                    <Input 
                      type="text" 
                      id="referralCode" 
                      placeholder="Enter referral code" 
                      className="mt-1"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Help your friend earn ₹{course.referral_reward} when you purchase
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#00C853] hover:bg-green-700 text-white"
                      onClick={handleRazorpayPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Pay ₹{course.price} with Razorpay
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={handleDemoPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Get Free Demo Access'
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center text-xs text-gray-500 pt-2">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Secure payment processing with industry-standard encryption
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Course not found.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Payment;
