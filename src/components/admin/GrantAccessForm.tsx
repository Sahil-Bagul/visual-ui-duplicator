
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { grantCourseAccessToUser, GrantCourseResult } from '@/utils/demoAccess';
import { useToast } from '@/hooks/use-toast';

const GrantAccessForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrantCourseResult | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      // Grant access to both courses
      const result = await grantCourseAccessToUser(
        userEmail,
        [
          'f9ef47ca-7003-4801-903a-79de8dd005aa', // AI Tools Mastery
          '46f0b0fa-6cc1-482e-adca-6d50eab9538f'  // Stock Market Fundamentals
        ]
      );
      
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error granting access:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Error",
        description: "Failed to grant course access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Grant Course Access</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            User Email
          </label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#00C853] hover:bg-[#00B248] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Grant Access to All Courses'
          )}
        </Button>
      </form>
      
      {result && (
        <Alert className={`mt-4 ${result.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          <AlertDescription>
            {result.message}
            
            {result.success && result.purchases && Array.isArray(result.purchases) && result.purchases.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Courses granted:</p>
                <ul className="list-disc list-inside mt-1">
                  {result.purchases.map((purchase, idx) => (
                    <li key={idx}>Course ID: {purchase.course_id || 'Unknown'}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GrantAccessForm;
