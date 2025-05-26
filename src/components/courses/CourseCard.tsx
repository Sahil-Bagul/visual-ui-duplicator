
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle } from 'lucide-react';

interface CourseCardProps {
  title: string;
  description: string;
  price: number;
  type: string;
  onClick: () => void;
  isPurchased?: boolean;
  thumbnail?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  price,
  type,
  onClick,
  isPurchased = false,
  thumbnail
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white border border-gray-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-[#00C853] to-[#2962FF] rounded-t-lg flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white opacity-80" />
            </div>
          )}
          
          {/* Course Type Badge */}
          <Badge className="absolute top-3 left-3 bg-white text-gray-700 border border-gray-200">
            {type}
          </Badge>
          
          {/* Purchase Status */}
          {isPurchased && (
            <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>
          
          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#00C853]">
              ₹{price}
            </div>
            
            <div className="text-sm text-gray-500">
              {isPurchased ? (
                <span className="text-green-600 font-medium">Purchased</span>
              ) : (
                <span>Click to view</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
