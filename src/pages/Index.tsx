import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Header from '@/components/layout/Header';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import CourseCard from '@/components/courses/CourseCard';

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toggle between login and dashboard views for demo purposes
  const toggleView = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      
      {!isLoggedIn ? (
        // Login/Signup View
        <div className="flex justify-center items-center min-h-screen">
          <div className="max-w-[993px] w-full h-screen flex justify-center items-center mx-auto max-md:max-w-[991px] max-sm:max-w-screen-sm">
            <div className="flex flex-col items-center gap-8 w-full max-w-md">
              <div className="text-center pt-6">
                <h1 className="text-[26px] text-gray-900 mb-2">Learn &amp; Earn</h1>
                <p className="text-xs text-gray-600">Learn new skills and earn through referrals</p>
              </div>
              <AuthForm />
              <button 
                onClick={toggleView} 
                className="text-xs text-blue-600 underline mt-4"
              >
                Demo: View Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard View
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4">
            <WelcomeCard userName="Rahul" walletBalance={0} />
            <section>
              <h2 className="text-[17px] font-semibold text-gray-800 mb-4">Available Courses</h2>
              <div className="flex gap-6 max-md:flex-col">
                <CourseCard
                  title="AI Tools Mastery"
                  description="Learn how to leverage AI tools to boost your productivity and creativity. This comprehensive guide covers the most popular AI tools and how to use them effectively."
                  price={500}
                  type="PDF Course"
                />
                <CourseCard
                  title="Stock Market Fundamentals"
                  description="A beginner's guide to understanding the stock market. Learn about different investment strategies, how to read financial statements, and make informed investment decisions."
                  price={1000}
                  type="PDF Course"
                />
              </div>
            </section>
            <button 
              onClick={toggleView} 
              className="text-xs text-blue-600 underline mt-8 block"
            >
              Demo: Back to Login
            </button>
          </main>
        </div>
      )}
    </>
  );
};

export default Index;
