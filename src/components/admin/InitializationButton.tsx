
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerInitialization } from '@/utils/autoSetupCourses';

interface InitializationButtonProps {
  // Optional admin email array
  adminEmails?: string[];
}

const InitializationButton: React.FC<InitializationButtonProps> = ({ 
  adminEmails = ['admin@learnandearn.in'] 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if current user is admin
  const checkIfAdmin = async (): Promise<boolean> => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.auth.getUser();
      return data.user ? adminEmails.includes(data.user.email || '') : false;
    } catch {
      return false;
    }
  };

  const handleReinitialization = async () => {
    try {
      // Check if user is admin
      const isAdmin = await checkIfAdmin();
      if (!isAdmin) {
        console.log("Non-admin attempted to use initialization button");
        return;
      }

      setIsLoading(true);
      toast({
        title: "Initializing Courses",
        description: "Please wait while course data is being processed...",
      });
      
      const result = await triggerInitialization();
      
      if (result.success) {
        toast({
          title: "Initialization Complete",
          description: "Course data has been successfully set up with enhanced content.",
          variant: "default"
        });
      } else {
        toast({
          title: "Initialization Failed",
          description: "There was a problem setting up course data. Check console for details.",
          variant: "destructive"
        });
        console.error("Initialization error details:", result.error);
      }
    } catch (error) {
      console.error("Error during manual initialization:", error);
      toast({
        title: "Initialization Error",
        description: "An unexpected error occurred during the process.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleReinitialization}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 hidden" // Hidden by default
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing Enhanced Content...</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Reinitialize Enhanced Courses</span>
        </>
      )}
    </Button>
  );
};

export default InitializationButton;
