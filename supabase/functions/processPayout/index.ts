
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Required environment variables are missing");
    }

    if (!telegramBotToken || !telegramChatId) {
      console.warn("Telegram credentials not set, notifications will not be sent");
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

    // Get user info for the notification
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", user_id)
      .single();
      
    if (userError) {
      console.warn(`Could not fetch user details: ${userError.message}`);
    }
    
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

    // Send notification to Telegram
    if (telegramBotToken && telegramChatId) {
      try {
        // Format payment details for Telegram message
        const paymentDetails = payoutMethod.method_type === "UPI" 
          ? `UPI ID: ${payoutMethod.upi_id}`
          : `Bank Account: ${payoutMethod.account_number?.slice(-4).padStart(payoutMethod.account_number.length, '*')}\nIFSC: ${payoutMethod.ifsc_code}`;
          
        const userInfo = userData 
          ? `User: ${userData.name || 'Unknown'} (${userData.email || 'No email'})`
          : `User ID: ${user_id}`;
          
        const telegramMessage = `
🔔 *NEW PAYOUT REQUEST*

${userInfo}
Amount: ₹${walletData.balance}
${paymentDetails}

*Payout ID:* \`${payoutRecord.id}\`

To confirm after payment:
\`/confirm_payout ${payoutRecord.id}\`
        `.trim();
        
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: telegramMessage,
              parse_mode: "Markdown",
            }),
          }
        );
        
        if (!telegramResponse.ok) {
          const errorData = await telegramResponse.json();
          console.error("Telegram API error:", JSON.stringify(errorData));
        } else {
          console.log("Telegram notification sent successfully");
        }
      } catch (telegramError) {
        console.error("Failed to send Telegram notification:", telegramError);
        // Continue processing even if Telegram notification fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payout request submitted and notification sent", 
        payout_id: payoutRecord.id 
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
