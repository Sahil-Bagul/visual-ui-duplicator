
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin commands
enum AdminCommand {
  ConfirmPayout = "/confirm_payout",
  Help = "/help"
}

// Telegram message structure
interface TelegramUpdate {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      username?: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID") || "";
    const telegramWebhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";
    
    if (!supabaseUrl || !supabaseServiceKey || !telegramBotToken || !telegramChatId) {
      throw new Error("Required environment variables are missing");
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook secret if provided
    const secretHeader = req.headers.get("x-telegram-webhook-secret");
    if (telegramWebhookSecret && secretHeader !== telegramWebhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse update from Telegram
    const update: TelegramUpdate = await req.json();
    
    // Verify the message is from the authorized admin
    if (update.message.chat.id.toString() !== telegramChatId) {
      console.error("Unauthorized chat ID:", update.message.chat.id);
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized chat ID" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const messageText = update.message.text.trim();
    
    // Process different admin commands
    if (messageText.startsWith(AdminCommand.ConfirmPayout)) {
      // Expected format: /confirm_payout [payout_id]
      const parts = messageText.split(" ");
      if (parts.length !== 2) {
        await sendTelegramMessage(telegramBotToken, telegramChatId, 
          "❌ Invalid format. Use: /confirm_payout [payout_id]");
        return new Response(JSON.stringify({ success: false }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      const payoutId = parts[1].trim();
      
      // Update the payout status in the database
      const { data, error } = await supabase
        .from("payouts")
        .update({
          status: "success",
          processed_at: new Date().toISOString()
        })
        .eq("id", payoutId)
        .eq("status", "pending")
        .select("id, amount, user_id");
        
      if (error) {
        await sendTelegramMessage(telegramBotToken, telegramChatId, 
          `❌ Failed to update payout: ${error.message}`);
          
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!data || data.length === 0) {
        await sendTelegramMessage(telegramBotToken, telegramChatId, 
          "❌ Payout not found or already processed");
          
        return new Response(
          JSON.stringify({ success: false, message: "Payout not found or already processed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update wallet balance to 0
      const { error: walletError } = await supabase
        .from("wallet")
        .update({
          balance: 0,
          last_updated: new Date().toISOString()
        })
        .eq("user_id", data[0].user_id);
        
      if (walletError) {
        await sendTelegramMessage(telegramBotToken, telegramChatId, 
          `⚠️ Payout marked as successful but failed to update wallet: ${walletError.message}`);
      } else {
        await sendTelegramMessage(telegramBotToken, telegramChatId, 
          `✅ Payout #${payoutId.substring(0, 8)}... confirmed! Amount: ₹${data[0].amount}`);
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (messageText === AdminCommand.Help) {
      await sendTelegramMessage(telegramBotToken, telegramChatId, 
        "Available commands:\n\n" +
        "/confirm_payout [payout_id] - Mark a payout as paid\n" +
        "/help - Show this help message");
        
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await sendTelegramMessage(telegramBotToken, telegramChatId, 
        "Unknown command. Type /help for available commands.");
        
      return new Response(
        JSON.stringify({ success: false, message: "Unknown command" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to send Telegram messages
async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", JSON.stringify(errorData));
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    throw error;
  }
}
