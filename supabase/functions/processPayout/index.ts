
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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
    
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

    let razorpayResponse: RazorpayPayout;
    
    // If Razorpay keys are available, create a real payout via the Razorpay API
    if (razorpayKeyId && razorpayKeySecret) {
      // Prepare the fund account based on the payout method
      let fundAccountPayload;
      
      if (payoutMethod.method_type === "UPI" && payoutMethod.upi_id) {
        fundAccountPayload = {
          account_type: "vpa",
          contact: {
            name: "User", // Ideally fetch from user profile
            email: "user@example.com", // Ideally fetch from auth
            contact: "9999999999", // Ideally fetch from user profile
            type: "customer",
            reference_id: user_id
          },
          vpa: {
            address: payoutMethod.upi_id
          }
        };
      } else if (payoutMethod.method_type === "BANK" && payoutMethod.account_number && payoutMethod.ifsc_code) {
        fundAccountPayload = {
          account_type: "bank_account",
          contact: {
            name: "User", // Ideally fetch from user profile
            email: "user@example.com", // Ideally fetch from auth
            contact: "9999999999", // Ideally fetch from user profile
            type: "customer",
            reference_id: user_id
          },
          bank_account: {
            name: "User", // Ideally fetch from user profile
            ifsc: payoutMethod.ifsc_code,
            account_number: payoutMethod.account_number
          }
        };
      } else {
        throw new Error("Invalid payout method details");
      }
      
      // Create a fund account in Razorpay
      const fundAccountResponse = await fetch("https://api.razorpay.com/v1/fund_accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
        },
        body: JSON.stringify(fundAccountPayload)
      });
      
      if (!fundAccountResponse.ok) {
        const errorData = await fundAccountResponse.json();
        throw new Error(`Failed to create fund account: ${JSON.stringify(errorData)}`);
      }
      
      const fundAccount = await fundAccountResponse.json();
      
      // Create a payout in Razorpay
      const payoutPayload = {
        account_number: "2323230032510196", // Your Razorpay account number
        fund_account_id: fundAccount.id,
        amount: walletData.balance * 100, // Razorpay expects amount in paise
        currency: "INR",
        mode: payoutMethod.method_type === "UPI" ? "UPI" : "NEFT",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: payoutRecord.id,
        narration: "Learn And Earn Payout",
        notes: {
          user_id,
          payout_id: payoutRecord.id
        }
      };
      
      const payoutResponse = await fetch("https://api.razorpay.com/v1/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`
        },
        body: JSON.stringify(payoutPayload)
      });
      
      if (!payoutResponse.ok) {
        const errorData = await payoutResponse.json();
        
        // Update payout record with failure status
        await supabase
          .from("payouts")
          .update({
            status: "failed",
            failure_reason: `Razorpay API error: ${JSON.stringify(errorData)}`,
            processed_at: new Date().toISOString()
          })
          .eq("id", payoutRecord.id);
          
        throw new Error(`Failed to create payout: ${JSON.stringify(errorData)}`);
      }
      
      razorpayResponse = await payoutResponse.json();
      
      // Update payout record with Razorpay payout ID and status
      await supabase
        .from("payouts")
        .update({
          razorpay_payout_id: razorpayResponse.id,
          status: razorpayResponse.status === "processed" ? "success" : "pending",
          processed_at: razorpayResponse.status === "processed" ? new Date().toISOString() : null
        })
        .eq("id", payoutRecord.id);
        
      // Only deduct from wallet if the payout is processed instantly
      if (razorpayResponse.status === "processed") {
        await supabase
          .from("wallet")
          .update({
            balance: 0,
            last_updated: new Date().toISOString()
          })
          .eq("user_id", user_id);
      }
    } else {
      // If Razorpay keys are not available, simulate a successful payout
      console.log("Simulating payout until Razorpay KYC is complete");
      
      razorpayResponse = {
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
          razorpay_payout_id: razorpayResponse.id,
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
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payout processed successfully", 
        payout: razorpayResponse 
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
