import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
}

const Payment: React.FC = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isDemoAccess, setIsDemoAccess] = useState(false);

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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, toast]);

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    if (!user || !course) return;
    
    try {
      console.log('Payment successful, creating purchase record...');
      
      const purchaseData = {
        user_id: user.id,
        course_id: course.id,
        amount: course.price, // Add the missing amount field
        payment_id: paymentId,
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
        title: "Success",
        description: "Payment successful! You now have access to the course.",
      });
      
      navigate(`/course/${courseId}`);
      
    } catch (error) {
      console.error('Error in payment success handler:', error);
      toast({
        title: "Error",
        description: "Payment was successful but there was an error processing your purchase. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const handleDemoPayment = async () => {
    if (!user || !course) return;
    
    try {
      console.log('Processing demo payment...');
      
      const purchaseData = {
        user_id: user.id,
        course_id: course.id,
        amount: 0, // Demo payment has 0 amount
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
        title: "Success",
        description: "Demo access granted! You can now preview the course.",
      });
      
      navigate(`/course/${courseId}`);
      
    } catch (error) {
      console.error('Error in demo payment:', error);
      toast({
        title: "Error",
        description: "There was an error processing your demo access. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment</h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading course details...</p>
          </div>
        ) : course ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:order-2">
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="rounded-lg shadow-md" 
              />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{course.title}</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 font-medium">Price:</span>
                  <span className="text-xl font-bold text-gray-900">₹{course.price}</span>
                </div>
                
                <div className="mb-3">
                  <Label htmlFor="referralCode" className="text-sm text-gray-600">Referral Code (optional)</Label>
                  <Input 
                    type="text" 
                    id="referralCode" 
                    placeholder="Enter referral code" 
                    className="mt-1"
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
                
                <Button className="w-full mb-2">
                  Pay Now
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleDemoPayment}
                >
                  Get Demo Access
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Course not found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payment;
