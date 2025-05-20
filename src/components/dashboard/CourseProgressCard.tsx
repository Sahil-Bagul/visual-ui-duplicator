
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight } from 'lucide-react';
import { CourseWithProgress } from '@/types/course';

interface CourseProgressCardProps {
  course: CourseWithProgress;
}

const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">{course.title}</h3>
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full text-blue-600 text-xs">
          <BookOpen className="w-3 h-3" />
          <span>Web Course</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-700">
            {course.completedModules}/{course.totalModules} modules
          </span>
          <span className="text-xs font-medium text-gray-700">
            {course.progress}%
          </span>
        </div>
        <Progress value={course.progress} className="h-1.5" />
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-[#4F46E5] justify-between hover:bg-blue-50 hover:text-blue-700"
        onClick={() => navigate(`/course-content/${course.id}`)}
      >
        <span>
          {course.progress === 0 ? 'Start Learning' : 
           course.progress === 100 ? 'Review Course' : 
           'Continue Learning'}
        </span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default CourseProgressCard;
