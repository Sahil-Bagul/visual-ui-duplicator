
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface RazorpayPayout {
  id: string;
  entity: string;
  fund_account_id: string;
  amount: number;
  currency: string;
  notes: Record<string, string>;
  fees: number;
  tax: number;
  status: string;
  utr: string;
  mode: string;
  purpose: string;
  reference_id: string;
  narration: string;
  batch_id: string;
  failure_reason: string | null;
  created_at: number;
}

interface PayoutMethod {
  id: string;
  user_id: string;
  method_type: "UPI" | "BANK";
  upi_id: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  is_default: boolean;
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
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user ID from request
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error("User ID is required");
    }
    
    // Check if user has sufficient balance
    const { data: walletData, error: walletError } = await supabase
      .from("wallet")
      .select("balance")
      .eq("user_id", user_id)
      .single();
      
    if (walletError) {
      throw new Error(`Failed to fetch wallet: ${walletError.message}`);
    }
    
    if (!walletData || walletData.balance < 250) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Insufficient balance. Minimum withdrawal amount is ₹250." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Get user's default payout method
    const { data: payoutMethodData, error: payoutMethodError } = await supabase
      .from("payout_methods")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_default", true)
      .single();
      
    if (payoutMethodError || !payoutMethodData) {
      throw new Error("No default payout method found");
    }
    
    const payoutMethod = payoutMethodData as PayoutMethod;
    
    // Create payout record with pending status
    const { data: payoutRecord, error: payoutInsertError } = await supabase
      .from("payouts")
      .insert({
        user_id,
        amount: walletData.balance,
        payout_method_id: payoutMethod.id,
        status: "pending",
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (payoutInsertError || !payoutRecord) {
      throw new Error(`Failed to create payout record: ${payoutInsertError?.message}`);
    }
    
    // Simulate a successful payout since Razorpay KYC is not complete yet
    console.log("Simulating payout until Razorpay KYC is complete");
    
    const mockRazorpayResponse: RazorpayPayout = {
      id: `payout_${Math.random().toString(36).substr(2, 9)}`,
      entity: "payout",
      fund_account_id: `fa_${Math.random().toString(36).substr(2, 9)}`,
      amount: walletData.balance * 100, // Razorpay uses amount in paise
      currency: "INR",
      notes: {
        user_id,
        payout_id: payoutRecord.id,
      },
      fees: 0,
      tax: 0,
      status: "processed", // In real implementation, this would be "processing" initially
      utr: Math.random().toString(36).substr(2, 9).toUpperCase(),
      mode: payoutMethod.method_type === "UPI" ? "UPI" : "NEFT",
      purpose: "payout",
      reference_id: payoutRecord.id,
      narration: "Learn And Earn Payout",
      batch_id: `batch_${Math.random().toString(36).substr(2, 9)}`,
      failure_reason: null,
      created_at: Math.floor(Date.now() / 1000),
    };
    
    // Update payout record with mock Razorpay payout ID
    await supabase
      .from("payouts")
      .update({
        razorpay_payout_id: mockRazorpayResponse.id,
        status: "success", // In real implementation, this would be updated after webhook confirmation
        processed_at: new Date().toISOString(),
      })
      .eq("id", payoutRecord.id);
    
    // Update wallet balance to 0
    await supabase
      .from("wallet")
      .update({
        balance: 0,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", user_id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payout processed successfully", 
        payout: mockRazorpayResponse 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Payout processing error:", error.message);
    
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
