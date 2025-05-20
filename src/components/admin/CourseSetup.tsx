
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setupAIToolsCourse, setupStockInvestmentCourse, setupAllCourses, clearAllLessonContent } from '@/utils/courseSetupHelper';
import { useToast } from '@/hooks/use-toast';

const CourseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupAIToolsCourse = async () => {
    setIsLoading(true);
    try {
      const result = await setupAIToolsCourse();
      
      if (result.success) {
        toast({
          title: "Course setup successful",
          description: `"AI Tools for Students" course has been created with all modules and lesson placeholders.`,
        });
      } else {
        toast({
          title: "Failed to setup course",
          description: "Check the console for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting up course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while setting up the course.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupStockInvestmentCourse = async () => {
    setIsLoading(true);
    try {
      const result = await setupStockInvestmentCourse();
      
      if (result.success) {
        toast({
          title: "Course setup successful",
          description: `"Introduction to Stock Investment" course has been created with all modules and lesson placeholders.`,
        });
      } else {
        toast({
          title: "Failed to setup course",
          description: "Check the console for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting up course:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while setting up the course.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAllCourses = async () => {
    setIsLoading(true);
    try {
      const result = await setupAllCourses();
      
      if (result.success) {
        toast({
          title: "Courses setup successful",
          description: "Both courses have been created with all modules and empty lesson content.",
        });
      } else {
        toast({
          title: "Failed to setup courses",
          description: "Check the console for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting up courses:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while setting up the courses.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLessonContent = async () => {
    setIsLoading(true);
    try {
      const result = await clearAllLessonContent();
      
      if (result.success) {
        toast({
          title: "Content cleared",
          description: "All lesson content has been cleared to empty strings.",
        });
      } else {
        toast({
          title: "Failed to clear content",
          description: "Check the console for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error clearing lesson content:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing lesson content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Course Setup</CardTitle>
        <CardDescription>
          Setup course structures with modules and lessons (with empty content).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2">Setup Options:</h3>
            <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
              <li>Setup both courses with all modules and lessons</li>
              <li>Setup individual courses separately</li>
              <li>Clear all lesson content (set to empty strings)</li>
            </ul>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-md font-semibold mb-2">Course Details:</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium">AI Tools for Students (₹500)</h4>
                <p className="text-sm text-gray-600">4 modules with 13 lessons</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium">Introduction to Stock Investment (₹1000)</h4>
                <p className="text-sm text-gray-600">4 modules with 12 lessons</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button 
          onClick={handleSetupAllCourses} 
          disabled={isLoading}
          className="bg-[#00C853] hover:bg-green-700 w-full"
        >
          {isLoading ? "Setting up courses..." : "Setup Both Courses"}
        </Button>
        
        <div className="flex gap-3 w-full">
          <Button 
            onClick={handleSetupAIToolsCourse} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Setup AI Course
          </Button>
          
          <Button 
            onClick={handleSetupStockInvestmentCourse} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Setup Stock Course
          </Button>
        </div>
        
        <Button 
          onClick={handleClearLessonContent} 
          disabled={isLoading}
          variant="destructive"
          className="w-full mt-2"
        >
          Clear All Lesson Content
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseSetup;
