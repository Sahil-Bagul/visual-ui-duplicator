
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendPayoutResponse {
  success: boolean;
  message: string;
}

const TelegramBot: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SendPayoutResponse | null>(null);
  
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim() || !amount.trim() || !upiId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('sendTelegramPayout', {
        body: {
          user_id: userId,
          amount: Number(amount),
          upi_id: upiId
        }
      });
      
      if (error) {
        console.error('Error sending payout notification:', error);
        setResult({
          success: false,
          message: `Error: ${error.message}`
        });
        toast.error('Failed to send payout notification');
        return;
      }
      
      console.log('Payout notification result:', data);
      setResult({
        success: true,
        message: 'Payout notification sent successfully'
      });
      toast.success('Payout notification sent successfully');
      
      // Clear form on success
      setUserId('');
      setAmount('');
      setUpiId('');
    } catch (error) {
      console.error('Exception sending payout notification:', error);
      setResult({
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSqlTest = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.rpc('send_telegram_test_message');
      
      if (error) {
        console.error('Error sending test message:', error);
        setResult({
          success: false,
          message: `Error: ${error.message}`
        });
        toast.error('Failed to send test message');
        return;
      }
      
      console.log('Test message result:', data);
      setResult({
        success: true,
        message: 'Test message sent successfully via SQL function'
      });
      toast.success('Test message sent successfully');
    } catch (error) {
      console.error('Exception sending test message:', error);
      setResult({
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Telegram Payout Bot</CardTitle>
            <CardDescription>Send payout notifications to users via Telegram</CardDescription>
          </CardHeader>
          <form onSubmit={handleSendTest}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium">
                  User ID
                </label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Payout Amount (₹)
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="upiId" className="text-sm font-medium">
                  UPI ID
                </label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="user@ybl"
                  disabled={isLoading}
                  required
                />
              </div>
              
              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.success ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-[#00C853] hover:bg-[#00A846]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Payout Notification'
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleSqlTest}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Send Test Message (SQL Function)'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Telegram Bot Guide</CardTitle>
            <CardDescription>How to set up and use the Telegram Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Configuration</h3>
              <p className="text-sm text-gray-600">
                The Telegram Bot is configured with the following environment variables:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>TELEGRAM_BOT_TOKEN:</strong> API token for the bot</li>
                <li><strong>TELEGRAM_CHAT_ID:</strong> Chat ID to send messages to</li>
                <li><strong>TELEGRAM_WEBHOOK_SECRET:</strong> Secret for webhook verification</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Usage</h3>
              <p className="text-sm text-gray-600">
                The Telegram Bot can be used to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Send payout notifications to users</li>
                <li>Notify admins about important system events</li>
                <li>Alert admins about suspicious activities</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Message Format</h3>
              <div className="bg-gray-50 p-3 rounded border text-sm">
                <p><strong>💸 Payout Initiated</strong></p>
                <p>👤 User: [user_id]</p>
                <p>💰 Amount: ₹[amount]</p>
                <p>📤 UPI ID: [upi_id]</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramBot;
