
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { triggerInitialization } from '@/utils/autoSetupCourses';

const InitializationButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReinitialization = async () => {
    try {
      setIsLoading(true);
      const result = await triggerInitialization();
      
      if (result.success) {
        toast({
          title: "Initialization Complete",
          description: "Course data has been successfully set up.",
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
        description: "An unexpected error occurred.",
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
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initializing...</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Reinitialize Courses</span>
        </>
      )}
    </Button>
  );
};

export default InitializationButton;
