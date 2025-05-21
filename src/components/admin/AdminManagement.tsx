
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminResult {
  success: boolean;
  message: string;
  user_id?: string;
}

interface AdminManagementProps {
  currentAdminId: string;
}

const AdminManagement = ({ currentAdminId }: AdminManagementProps) => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminResult | null>(null);
  const { toast } = useToast();

  const grantAdminPrivileges = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.rpc('grant_admin_privileges', {
        admin_email: userEmail.trim()
      });
      
      if (error) throw error;
      
      // Cast the data to the AdminResult type since we know the structure
      const adminResult = data as AdminResult;
      setResult(adminResult);
      
      if (adminResult.success) {
        toast({
          title: "Success",
          description: adminResult.message,
        });
        setUserEmail('');
      } else {
        toast({
          title: "Error",
          description: adminResult.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error granting admin privileges:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Error",
        description: "Failed to grant admin privileges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeAdminPrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    // Prevent revoking your own admin privileges
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email?.toLowerCase() === userEmail.trim().toLowerCase()) {
      toast({
        title: "Error",
        description: "You cannot revoke your own admin privileges",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.rpc('revoke_admin_privileges', {
        admin_email: userEmail.trim()
      });
      
      if (error) throw error;
      
      // Cast the data to the AdminResult type since we know the structure
      const adminResult = data as AdminResult;
      setResult(adminResult);
      
      if (adminResult.success) {
        toast({
          title: "Success",
          description: adminResult.message,
        });
        setUserEmail('');
      } else {
        toast({
          title: "Error",
          description: adminResult.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error revoking admin privileges:', error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      toast({
        title: "Error",
        description: "Failed to revoke admin privileges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
            User Email
          </label>
          <Input
            id="admin-email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full"
          />
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={grantAdminPrivileges}
            disabled={loading}
            className="bg-[#00C853] hover:bg-[#00B248] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Grant Admin Privileges'
            )}
          </Button>
          
          <Button 
            onClick={revokeAdminPrivileges}
            disabled={loading}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Revoke Admin Privileges'
            )}
          </Button>
        </div>
      </form>
      
      {result && (
        <Alert className={`mt-4 ${result.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminManagement;
