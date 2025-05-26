
import { supabase } from '@/integrations/supabase/client';

// Razorpay configuration - these should be moved to environment variables in production
const RAZORPAY_KEY_ID = 'rzp_test_uMvpbB0vwPADDJ'; // Test key for development
const RAZORPAY_KEY_SECRET = '8duTFh22qI2D8gAL8ewUVVKs'; // This should be in backend only

export interface RazorpayOrderData {
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
  courseId: string;
  referralCode?: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Create Razorpay order
export async function createRazorpayOrder(
  courseId: string,
  amount: number,
  userId: string,
  referralCode?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('Creating Razorpay order for course:', courseId);
    
    // Create order through our backend (you may want to create an edge function for this)
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: userId,
        course_id: courseId,
        used_referral_code: referralCode || null
      }
    };
    
    // For now, we'll create a simple order object
    // In production, this should go through your backend
    const order = {
      id: `order_${Date.now()}`,
      amount: orderData.amount,
      currency: orderData.currency,
      notes: orderData.notes
    };
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: 'Failed to create payment order' };
  }
}

// Initialize Razorpay payment
export function initializeRazorpayPayment(
  orderData: RazorpayOrderData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
) {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    order_id: orderData.orderId,
    name: 'Learn & Earn',
    description: 'Course Purchase',
    theme: {
      color: '#00C853'
    },
    handler: function (response: RazorpayResponse) {
      console.log('Payment successful:', response);
      onSuccess(response);
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed');
      }
    }
  };

  // Check if Razorpay is loaded
  if (typeof (window as any).Razorpay !== 'undefined') {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', onError);
    rzp.open();
  } else {
    console.error('Razorpay SDK not loaded');
    onError({ error: 'Payment system not available' });
  }
}

// Process successful payment
export async function processPaymentSuccess(
  paymentResponse: RazorpayResponse,
  userId: string,
  courseId: string,
  amount: number,
  referralCode?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Processing payment success...');
    
    // Create purchase record
    const purchaseData = {
      user_id: userId,
      course_id: courseId,
      amount: amount,
      payment_id: paymentResponse.razorpay_payment_id,
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
      
    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError);
      return { success: false, error: 'Failed to record purchase' };
    }
    
    // Process referral reward if applicable
    if (referralCode) {
      await processReferralReward(referralCode, courseId, amount);
    }
    
    console.log('Payment processed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: 'Failed to process payment' };
  }
}

// Process referral reward
async function processReferralReward(referralCode: string, courseId: string, amount: number) {
  try {
    // Find the referrer
    const { data: referrerData, error: referrerError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single();
      
    if (referrerError || !referrerData) {
      console.log('Referrer not found for code:', referralCode);
      return;
    }
    
    // Calculate reward (50% of course price)
    const rewardAmount = amount * 0.5;
    
    // Update referrer's wallet
    const { error: walletError } = await supabase
      .from('wallet')
      .update({
        balance: supabase.sql`balance + ${rewardAmount}`,
        total_earned: supabase.sql`total_earned + ${rewardAmount}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', referrerData.id);
      
    if (walletError) {
      console.error('Error updating referrer wallet:', walletError);
    } else {
      console.log(`Referral reward of ₹${rewardAmount} credited to user ${referrerData.id}`);
    }
    
    // Create wallet transaction record
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: referrerData.id,
        type: 'credit',
        amount: rewardAmount,
        description: `Referral reward for course purchase`,
        status: 'completed'
      });
      
  } catch (error) {
    console.error('Error processing referral reward:', error);
  }
}
