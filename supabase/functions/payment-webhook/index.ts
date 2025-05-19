
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as crypto from "https://deno.land/std@0.132.0/node/crypto.ts";

// Define the Razorpay webhook payload interfaces
interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: RazorpayPayment;
    order?: RazorpayOrder;
    payout?: RazorpayPayout;
  };
}

interface RazorpayPayment {
  entity: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    description: string;
    notes: {
      user_id: string;
      course_id: string;
      used_referral_code?: string;
    };
  };
}

interface RazorpayOrder {
  entity: {
    id: string;
    amount: number;
    amount_paid: number;
    status: string;
    notes: {
      user_id: string;
      course_id: string;
      used_referral_code?: string;
    };
  };
}

interface RazorpayPayout {
  entity: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    notes: {
      user_id: string;
      payout_id: string;
    };
    fees: number;
    utr: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
    
    if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
      throw new Error("Required environment variables are missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body and headers
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    
    if (!signature) {
      throw new Error("Webhook signature missing");
    }
    
    // Verify the webhook signature
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }
    
    // Parse the payload
    const payload: RazorpayWebhookPayload = JSON.parse(body);
    console.log("Received webhook event:", payload.event);
    
    // Handle different webhook events
    switch (payload.event) {
      case "payment.captured":
        await handlePaymentCaptured(supabase, payload);
        break;
      case "order.paid":
        await handleOrderPaid(supabase, payload);
        break;
      case "payout.processed":
        await handlePayoutProcessed(supabase, payload);
        break;
      case "payout.failed":
        await handlePayoutFailed(supabase, payload);
        break;
      default:
        console.log("Unhandled webhook event:", payload.event);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

// Function to verify webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const generatedSignature = hmac.digest("hex");
  return crypto.timingSafeEqual(
    new TextEncoder().encode(generatedSignature),
    new TextEncoder().encode(signature)
  );
}

// Handle payment.captured event
async function handlePaymentCaptured(supabase: any, payload: RazorpayWebhookPayload) {
  if (!payload.payload.payment) return;
  
  const payment = payload.payload.payment.entity;
  const { user_id, course_id, used_referral_code } = payment.notes;
  
  if (payment.status === "captured") {
    // Create a purchase entry
    const purchaseData = {
      user_id,
      course_id,
      has_used_referral_code: !!used_referral_code,
      used_referral_code,
      purchased_at: new Date().toISOString(),
      payment_id: payment.id,
      payment_status: "completed"
    };
    
    const { error } = await supabase.from("purchases").insert(purchaseData);
    
    if (error) {
      console.error("Error creating purchase:", error);
      throw error;
    }
    
    console.log(`Payment captured for user ${user_id}, course ${course_id}`);
  }
}

// Handle order.paid event
async function handleOrderPaid(supabase: any, payload: RazorpayWebhookPayload) {
  if (!payload.payload.order) return;
  
  const order = payload.payload.order.entity;
  const { user_id, course_id, used_referral_code } = order.notes;
  
  if (order.status === "paid" && order.amount_paid === order.amount) {
    // Check if a purchase entry already exists
    const { data, error: fetchError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user_id)
      .eq("course_id", course_id)
      .order("purchased_at", { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error("Error fetching purchase:", fetchError);
      throw fetchError;
    }
    
    if (data && data.length > 0) {
      // Update existing purchase
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: "completed",
          order_id: order.id
        })
        .eq("id", data[0].id);
        
      if (updateError) {
        console.error("Error updating purchase:", updateError);
        throw updateError;
      }
    } else {
      // Create a new purchase entry
      const purchaseData = {
        user_id,
        course_id,
        has_used_referral_code: !!used_referral_code,
        used_referral_code,
        purchased_at: new Date().toISOString(),
        order_id: order.id,
        payment_status: "completed"
      };
      
      const { error } = await supabase.from("purchases").insert(purchaseData);
      
      if (error) {
        console.error("Error creating purchase:", error);
        throw error;
      }
    }
    
    console.log(`Order paid for user ${user_id}, course ${course_id}`);
  }
}

// Handle payout.processed event
async function handlePayoutProcessed(supabase: any, payload: RazorpayWebhookPayload) {
  if (!payload.payload.payout) return;
  
  const payout = payload.payload.payout.entity;
  const { user_id, payout_id } = payout.notes;
  
  if (payout.status === "processed") {
    // Update the payout status in the database
    const { error } = await supabase
      .from("payouts")
      .update({
        status: "success",
        processed_at: new Date().toISOString(),
        razorpay_payout_id: payout.id,
        utr: payout.utr || null
      })
      .eq("id", payout_id);
      
    if (error) {
      console.error("Error updating payout status:", error);
      throw error;
    }
    
    console.log(`Payout processed for user ${user_id}, payout ID ${payout_id}`);
  }
}

// Handle payout.failed event
async function handlePayoutFailed(supabase: any, payload: RazorpayWebhookPayload) {
  if (!payload.payload.payout) return;
  
  const payout = payload.payload.payout.entity;
  const { user_id, payout_id } = payout.notes;
  
  // Update the payout status in the database
  const { data: payoutData, error: fetchError } = await supabase
    .from("payouts")
    .select("amount")
    .eq("id", payout_id)
    .single();
    
  if (fetchError) {
    console.error("Error fetching payout:", fetchError);
    throw fetchError;
  }
  
  // Mark the payout as failed
  const { error: updateError } = await supabase
    .from("payouts")
    .update({
      status: "failed",
      failure_reason: "Razorpay payout processing failed",
      processed_at: new Date().toISOString(),
      razorpay_payout_id: payout.id
    })
    .eq("id", payout_id);
    
  if (updateError) {
    console.error("Error updating payout status:", updateError);
    throw updateError;
  }
  
  // Restore the amount to the user's wallet
  if (payoutData) {
    const { error: walletError } = await supabase
      .from("wallet")
      .update({
        balance: supabase.rpc("increment", { amount: payoutData.amount }),
        last_updated: new Date().toISOString()
      })
      .eq("user_id", user_id);
      
    if (walletError) {
      console.error("Error updating wallet balance:", walletError);
      throw walletError;
    }
  }
  
  console.log(`Payout failed for user ${user_id}, payout ID ${payout_id}`);
}
