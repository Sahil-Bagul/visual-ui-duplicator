
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setupAIToolsCourse } from '@/utils/courseSetupHelper';
import { useToast } from '@/hooks/use-toast';

const CourseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupCourse = async () => {
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Course Setup: AI Tools for Students</CardTitle>
        <CardDescription>
          Add the "AI Tools for Students" course to the database with all modules and lesson placeholders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          This will create:
        </p>
        <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
          <li>The course "AI Tools for Students" with price ₹500</li>
          <li>5 modules (Introduction to AI, AI Tools for Studying, etc.)</li>
          <li>14 lessons with placeholder content</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSetupCourse} 
          disabled={isLoading}
          className="bg-[#00C853] hover:bg-green-700"
        >
          {isLoading ? "Setting up course..." : "Setup Course"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseSetup;
