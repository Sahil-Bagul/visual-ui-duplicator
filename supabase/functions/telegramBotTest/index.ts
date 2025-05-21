
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
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    
    if (!telegramBotToken || !telegramChatId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Telegram credentials not properly configured",
          missing: {
            botToken: !telegramBotToken,
            chatId: !telegramChatId
          }
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get bot info as a first test
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/getMe`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    
    const botInfoData = await botInfoResponse.json();
    
    if (!botInfoResponse.ok || !botInfoData.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to get bot information. Token may be invalid.", 
          telegram_response: botInfoData 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Send a test message
    const testMessage = "🔔 Test message from Learn and Earn platform. If you're seeing this, your bot is configured correctly!";
    
    const sendMessageResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: testMessage,
          parse_mode: "Markdown",
        }),
      }
    );
    
    const sendMessageData = await sendMessageResponse.json();
    
    if (!sendMessageResponse.ok || !sendMessageData.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Bot is valid but failed to send message. Chat ID may be incorrect.", 
          telegram_response: sendMessageData,
          bot_info: botInfoData.result
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get webhook info
    const webhookInfoResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    
    const webhookInfoData = await webhookInfoResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Bot test successful. Message sent to your chat.", 
        bot_info: botInfoData.result,
        message_info: sendMessageData.result,
        webhook_info: webhookInfoData.result
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error testing Telegram bot:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
