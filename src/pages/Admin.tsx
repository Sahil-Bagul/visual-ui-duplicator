
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseSetup from '@/components/admin/CourseSetup';
import LessonContentManager from '@/components/admin/LessonContentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const adminEmails = ['admin@example.com']; // Replace with actual admin emails

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!user) {
      navigate('/');
      return;
    }

    const userEmail = user.email;
    if (userEmail && !adminEmails.includes(userEmail)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full flex-grow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">Course Setup</TabsTrigger>
            <TabsTrigger value="lessons">Lesson Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <CourseSetup />
          </TabsContent>
          
          <TabsContent value="lessons" className="space-y-6">
            <LessonContentManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
