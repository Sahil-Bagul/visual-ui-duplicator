
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

const MyCourses: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-[993px] mx-auto my-0 px-6 py-8 max-sm:p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Courses</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v6m0 0v14m0-14h6m-6 0H6" />
              <rect x="2" y="6" width="20" height="16" rx="2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No courses yet</h2>
          <p className="text-gray-500 text-center mb-6">Get started by purchasing your first course.</p>
          <Button asChild className="bg-[#4F46E5] hover:bg-blue-700">
            <Link to="/">Browse Courses</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MyCourses;
