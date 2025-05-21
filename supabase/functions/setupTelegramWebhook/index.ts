
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

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
    // This should be an admin-only function, check for admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];
    const adminToken = Deno.env.get("ADMIN_API_TOKEN");
    
    if (!adminToken || token !== adminToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid admin token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!telegramBotToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Telegram bot token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the base URL for this edge function
    const { webhook_url, secret } = await req.json();
    
    if (!webhook_url) {
      return new Response(
        JSON.stringify({ success: false, message: "Webhook URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Set webhook with Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhook_url,
          secret_token: secret || undefined,
        }),
      }
    );
    
    const responseData = await response.json();
    
    if (!response.ok || !responseData.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to set webhook", 
          telegram_response: responseData 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook set successfully", 
        telegram_response: responseData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting webhook:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
