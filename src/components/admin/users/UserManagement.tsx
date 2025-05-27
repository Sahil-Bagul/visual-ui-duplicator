
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { UserTable } from './UserTable';
import { AdminActionDialog } from './AdminActionDialog';

interface UserData {
  id: string;
  email: string;
  name: string;
  joined_at: string;
  is_admin: boolean;
  last_login?: string;
  courses_purchased?: number;
  successful_referrals?: number;
  total_earned?: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'makeAdmin' | 'removeAdmin' | null;
    processing: boolean;
  }>({ open: false, action: null, processing: false });
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // First check if current user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError || !isAdmin) {
        console.error('Not authorized to fetch users:', adminError);
        toast.error('You are not authorized to view users');
        return;
      }
      
      // Get basic user information with optimized query
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, joined_at, is_admin')
        .order('joined_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }
      
      if (!data || data.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Batch process additional data for better performance
      const userIds = data.map(user => user.id);
      
      // Get all additional data in parallel
      const [activityPromise, purchasesPromise, referralsPromise] = await Promise.allSettled([
        supabase
          .from('user_activity_logs')
          .select('user_id, created_at')
          .in('user_id', userIds)
          .eq('activity_type', 'login')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('purchases')
          .select('user_id')
          .in('user_id', userIds),
        
        supabase
          .from('referrals')
          .select('user_id, commission_amount')
          .in('user_id', userIds)
          .eq('status', 'completed')
      ]);
      
      // Process results efficiently
      const activityData = activityPromise.status === 'fulfilled' ? activityPromise.value.data || [] : [];
      const purchasesData = purchasesPromise.status === 'fulfilled' ? purchasesPromise.value.data || [] : [];
      const referralsData = referralsPromise.status === 'fulfilled' ? referralsPromise.value.data || [] : [];
      
      // Create maps for O(1) lookup
      const lastLoginMap = new Map();
      const purchaseCountMap = new Map();
      const referralStatsMap = new Map();
      
      // Process activity data
      activityData.forEach(activity => {
        if (!lastLoginMap.has(activity.user_id)) {
          lastLoginMap.set(activity.user_id, activity.created_at);
        }
      });
      
      // Process purchases
      purchasesData.forEach(purchase => {
        purchaseCountMap.set(purchase.user_id, (purchaseCountMap.get(purchase.user_id) || 0) + 1);
      });
      
      // Process referrals
      referralsData.forEach(referral => {
        const current = referralStatsMap.get(referral.user_id) || { count: 0, earned: 0 };
        referralStatsMap.set(referral.user_id, {
          count: current.count + 1,
          earned: current.earned + (referral.commission_amount || 0)
        });
      });
      
      // Combine all data
      const enhancedUsers = data.map(user => ({
        ...user,
        last_login: lastLoginMap.get(user.id),
        courses_purchased: purchaseCountMap.get(user.id) || 0,
        successful_referrals: referralStatsMap.get(user.id)?.count || 0,
        total_earned: referralStatsMap.get(user.id)?.earned || 0
      }));
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error in loadUsers:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
  
  const handleMakeAdmin = async (userId: string) => {
    if (!selectedUser) return;
    
    setConfirmDialog({ ...confirmDialog, processing: true });
    
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('grant_admin_privileges', {
          admin_email: selectedUser.email
        });
      
      if (rpcError) {
        console.error('Error granting admin privileges:', rpcError);
        toast.error('Failed to grant admin privileges');
        return;
      }
      
      toast.success(`Admin privileges granted to ${selectedUser.email}`);
      loadUsers();
    } catch (error) {
      console.error('Exception in handleMakeAdmin:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setConfirmDialog({ open: false, action: null, processing: false });
      setSelectedUser(null);
    }
  };
  
  const handleRemoveAdmin = async (userId: string) => {
    if (!selectedUser) return;
    
    setConfirmDialog({ ...confirmDialog, processing: true });
    
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('revoke_admin_privileges', {
          admin_email: selectedUser.email
        });
      
      if (rpcError) {
        console.error('Error revoking admin privileges:', rpcError);
        toast.error('Failed to revoke admin privileges');
        return;
      }
      
      toast.success(`Admin privileges revoked from ${selectedUser.email}`);
      loadUsers();
    } catch (error) {
      console.error('Exception in handleRemoveAdmin:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setConfirmDialog({ open: false, action: null, processing: false });
      setSelectedUser(null);
    }
  };
  
  const handleGrantCourseAccess = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.error('Error getting user email:', error);
        toast.error('Failed to find user email');
        return;
      }
      
      const { data: result, error: rpcError } = await supabase
        .rpc('grant_one_time_access_to_user', {
          user_email: data.email
        });
      
      if (rpcError) {
        console.error('Error granting course access:', rpcError);
        toast.error(`Failed to grant course access: ${rpcError.message}`);
        return;
      }
      
      toast.success(`Course access granted to ${data.email}`);
      loadUsers();
    } catch (error) {
      console.error('Exception in handleGrantCourseAccess:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage platform users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <UserTable 
            users={filteredUsers}
            onMakeAdmin={(user) => {
              setSelectedUser(user);
              setConfirmDialog({ open: true, action: 'makeAdmin', processing: false });
            }}
            onRemoveAdmin={(user) => {
              setSelectedUser(user);
              setConfirmDialog({ open: true, action: 'removeAdmin', processing: false });
            }}
            onGrantCourseAccess={handleGrantCourseAccess}
          />
        )}
      </CardContent>
      
      <AdminActionDialog
        open={confirmDialog.open}
        action={confirmDialog.action}
        user={selectedUser}
        processing={confirmDialog.processing}
        onConfirm={() => confirmDialog.action === 'makeAdmin' 
          ? handleMakeAdmin(selectedUser!.id)
          : handleRemoveAdmin(selectedUser!.id)
        }
        onCancel={() => setConfirmDialog({ open: false, action: null, processing: false })}
      />
    </Card>
  );
};

export default UserManagement;
