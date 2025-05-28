
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
}

const Payment: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          console.error('Error loading course:', error);
          toast.error('Course not found');
          navigate('/dashboard');
          return;
        }

        setCourse(data);
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course details');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate]);

  const handlePayment = async () => {
    if (!course || !user) return;

    setIsProcessing(true);
    
    try {
      // For now, simulate a successful payment
      // In production, this would integrate with Razorpay
      
      // Create a purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount: course.price,
          payment_status: 'completed',
          payment_id: `demo_${Date.now()}`
        });

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        toast.error('Failed to process payment');
        return;
      }

      toast.success('Payment successful! Course access granted.');
      navigate(`/course/${course.id}`);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UnifiedHeader />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <UnifiedHeader />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The requested course could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UnifiedHeader />
      <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Course Price:</span>
                    <span className="text-2xl font-bold text-[#00C853]">₹{course.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Course Fee:</span>
                    <span>₹{course.price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Platform Fee:</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-[#00C853]">₹{course.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Instant course access after payment
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Lifetime access to course content
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Progress tracking and completion certificates
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#00C853] hover:bg-[#00B248] text-white py-3 text-lg"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${course.price}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                  This is a demo payment system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
