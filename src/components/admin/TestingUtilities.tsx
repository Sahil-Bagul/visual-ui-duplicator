
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, TestTube, DollarSign } from 'lucide-react';

const TestingUtilities: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testAmount, setTestAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);

  const createTestWalletEntry = async () => {
    if (!testEmail || !testAmount) {
      toast.error('Please enter email and amount');
      return;
    }

    setIsLoading(true);
    try {
      // Get user ID by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', testEmail.trim())
        .single();

      if (userError || !userData) {
        toast.error('User not found with this email');
        return;
      }

      // Create or update wallet entry
      const { error: walletError } = await supabase
        .from('wallet')
        .upsert({
          user_id: userData.id,
          balance: parseFloat(testAmount),
          total_earned: parseFloat(testAmount)
        }, {
          onConflict: 'user_id'
        });

      if (walletError) {
        console.error('Wallet error:', walletError);
        toast.error('Failed to create wallet entry');
        return;
      }

      // Create a wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userData.id,
          type: 'credit',
          amount: parseFloat(testAmount),
          description: 'Test wallet funding for payout testing',
          status: 'completed'
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        toast.error('Failed to create transaction record');
        return;
      }

      toast.success(`Test wallet created with ₹${testAmount} for ${testEmail}`);
      setTestEmail('');
      setTestAmount('100');
    } catch (error) {
      console.error('Error creating test wallet:', error);
      toast.error('Failed to create test wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestPurchase = async () => {
    if (!testEmail) {
      toast.error('Please enter email');
      return;
    }

    setIsLoading(true);
    try {
      // Get user ID by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', testEmail.trim())
        .single();

      if (userError || !userData) {
        toast.error('User not found with this email');
        return;
      }

      // Get available courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, price')
        .eq('is_active', true)
        .limit(1);

      if (coursesError || !courses || courses.length === 0) {
        toast.error('No active courses found');
        return;
      }

      const course = courses[0];

      // Create test purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userData.id,
          course_id: course.id,
          amount: course.price,
          payment_status: 'completed',
          payment_id: `test_${Date.now()}`
        });

      if (purchaseError) {
        console.error('Purchase error:', purchaseError);
        toast.error('Failed to create test purchase');
        return;
      }

      toast.success(`Test purchase created for ${testEmail}: ${course.title}`);
    } catch (error) {
      console.error('Error creating test purchase:', error);
      toast.error('Failed to create test purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Testing Utilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">User Email</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="testAmount">Test Amount (₹)</Label>
              <Input
                id="testAmount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={createTestWalletEntry}
              disabled={isLoading}
              className="flex items-center"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Create Test Wallet
            </Button>
            
            <Button 
              onClick={createTestPurchase}
              disabled={isLoading}
              variant="outline"
              className="flex items-center"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Create Test Purchase
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Testing Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Enter a user's email address</li>
              <li>2. Click "Create Test Wallet" to give them test money</li>
              <li>3. Click "Create Test Purchase" to simulate a course purchase</li>
              <li>4. The user can now test withdrawal functionality</li>
              <li>5. Check admin panel for payout requests</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingUtilities;
