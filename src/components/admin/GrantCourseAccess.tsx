
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { grantCourseAccessToUser } from '@/utils/demoAccess';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GrantCourseAccess: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGrantAccess = async () => {
    if (!userEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const courseIds = [
        'f9ef47ca-7003-4801-903a-79de8dd005aa', // AI Tools Mastery
        '46f0b0fa-6cc1-482e-adca-6d50eab9538f'  // Stock Market Fundamentals
      ];
      
      // Call the function to grant access
      const { success, message, purchases } = await grantCourseAccessToUser(userEmail, courseIds);
      
      if (success) {
        toast.success(message);
        setResult(`Successfully granted access to ${purchases ? purchases.length : 'all'} courses for user ${userEmail}`);
        setUserEmail(''); // Clear the input field on success
      } else {
        toast.error(message);
        setResult(`Error: ${message}`);
      }
    } catch (error) {
      console.error("Error in grant access handler:", error);
      toast.error("Failed to grant course access");
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-white shadow-sm">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium">Grant Course Access</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mb-4">
          <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
            User Email
          </label>
          <Input
            id="userEmail"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter user email"
            className="w-full mb-4"
          />
        </div>
        
        <Button 
          onClick={handleGrantAccess} 
          disabled={isLoading}
          className="bg-[#00C853] hover:bg-green-600 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Grant Access to Courses"
          )}
        </Button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded border text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrantCourseAccess;
