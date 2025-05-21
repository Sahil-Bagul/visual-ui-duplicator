
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { grantCourseAccessToUser } from '@/utils/demoAccess';

const GrantCourseAccess: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGrantAccess = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const userEmail = 'movieskatta7641@gmail.com';
      const courseIds = [
        'f9ef47ca-7003-4801-903a-79de8dd005aa', // AI Tools Mastery
        '46f0b0fa-6cc1-482e-adca-6d50eab9538f'  // Stock Market Fundamentals
      ];
      
      const { success, message, purchases } = await grantCourseAccessToUser(userEmail, courseIds);
      
      if (success) {
        toast({
          title: "Success",
          description: message,
          variant: "default", // Changed from "success" to "default"
        });
        setResult(`Successfully granted access to ${purchases.length} courses for user ${userEmail}`);
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        setResult(`Error: ${message}`);
      }
    } catch (error) {
      console.error("Error in grant access handler:", error);
      toast({
        title: "Error",
        description: "Failed to grant course access",
        variant: "destructive",
      });
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-4">Grant Course Access</h3>
      <Button 
        onClick={handleGrantAccess} 
        disabled={isLoading}
        className="bg-[#00C853] hover:bg-green-600"
      >
        {isLoading ? "Processing..." : "Grant Access to Specified User"}
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded border text-sm">
          {result}
        </div>
      )}
    </Card>
  );
};

export default GrantCourseAccess;
