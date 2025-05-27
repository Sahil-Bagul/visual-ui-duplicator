
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lock } from 'lucide-react';

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
    <Card className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            {type}
          </Badge>
          {isPurchased && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Purchased
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">₹{price}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <Lock className="h-4 w-4 mr-1" />
            <span>Unlock referrals after purchase</span>
          </div>
        </div>
        
        <Button 
          onClick={onClick}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPurchased ? (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              View Course
            </>
          ) : (
            'Buy Now'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
