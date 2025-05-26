
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import HeaderWithNotifications from '@/components/layout/HeaderWithNotifications';
import Footer from '@/components/layout/Footer';
import CourseContentDisplay from '@/components/courses/CourseContentDisplay';
import { getCourseWithContent, hasUserAccessToCourse, type CourseWithProgress } from '@/services/courseContentService';
import { toast } from 'sonner';
import { BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CourseContent: React.FC = () => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseWithProgress | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseContent = async () => {
      if (!courseId || !user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading course content for courseId:', courseId);
        
        // Check if user has access to this course
        const accessGranted = await hasUserAccessToCourse(courseId);
        setHasAccess(accessGranted);
        
        if (!accessGranted) {
          console.log('User does not have access to course:', courseId);
          setIsLoading(false);
          return;
        }
        
        // Load course content
        const courseData = await getCourseWithContent(courseId);
        
        if (!courseData) {
          setError('Course not found or failed to load course content.');
          return;
        }
        
        setCourse(courseData);
        console.log('Course content loaded successfully:', courseData.title);
      } catch (error) {
        console.error('Error loading course content:', error);
        setError('Failed to load course content. Please try again.');
        toast.error('Failed to load course content');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseContent();
  }, [courseId, user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!courseId) {
    return <Navigate to="/my-courses" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Loading course content...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <Card className="text-center py-12">
            <CardContent>
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h2>
              <p className="text-gray-500 mb-6">
                You don't have access to this course. Please purchase it first.
              </p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-[#00C853] hover:bg-[#00B248] text-white"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderWithNotifications />
        <main className="max-w-[993px] mx-auto w-full px-6 py-8 flex-grow">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Course Loading Error</h2>
              <p>{error || 'Failed to load course content'}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#00C853] text-white rounded-lg hover:bg-[#00B248]"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderWithNotifications />
      <main className="max-w-[993px] mx-auto w-full px-6 py-8 max-sm:p-4 flex-grow">
        <CourseContentDisplay course={course} />
      </main>
      <Footer />
    </div>
  );
};

export default CourseContent;
