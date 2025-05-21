
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Check, Loader2, MoreHorizontal, Search, Shield, User, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
      
      // First get basic user information
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joined_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }
      
      // Process and enhance user data
      const enhancedUsers = await Promise.all(data.map(async (user) => {
        // Get last login info
        const { data: activityData } = await supabase
          .from('user_activity_logs')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('activity_type', 'login')
          .order('created_at', { ascending: false })
          .limit(1);
        
        // Get course purchase count
        const { count: purchaseCount } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get referral stats
        const { data: referralData } = await supabase
          .from('referrals')
          .select('successful_referrals, total_earned')
          .eq('user_id', user.id)
          .order('total_earned', { ascending: false })
          .limit(1);
          
        return {
          ...user,
          last_login: activityData?.[0]?.created_at,
          courses_purchased: purchaseCount || 0,
          successful_referrals: referralData?.[0]?.successful_referrals || 0,
          total_earned: referralData?.[0]?.total_earned || 0
        };
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
      // Get the email for the selected user
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
      
      // Call the RPC function to grant admin privileges
      const { data: result, error: rpcError } = await supabase
        .rpc('grant_admin_privileges', {
          admin_email: data.email
        });
      
      if (rpcError) {
        console.error('Error granting admin privileges:', rpcError);
        toast.error('Failed to grant admin privileges');
        return;
      }
      
      console.log('Admin privileges granted:', result);
      toast.success(`Admin privileges granted to ${data.email}`);
      
      // Refresh the user list
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
      // Get the email for the selected user
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
      
      // Call the RPC function to revoke admin privileges
      const { data: result, error: rpcError } = await supabase
        .rpc('revoke_admin_privileges', {
          admin_email: data.email
        });
      
      if (rpcError) {
        console.error('Error revoking admin privileges:', rpcError);
        toast.error('Failed to revoke admin privileges');
        return;
      }
      
      console.log('Admin privileges revoked:', result);
      toast.success(`Admin privileges revoked from ${data.email}`);
      
      // Refresh the user list
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
      // Get the email for the selected user
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
      
      // Call the grant_one_time_access_to_user function
      const { data: result, error: rpcError } = await supabase
        .rpc('grant_one_time_access_to_user', {
          user_email: data.email
        });
      
      if (rpcError) {
        console.error('Error granting course access:', rpcError);
        toast.error(`Failed to grant course access: ${rpcError.message}`);
        return;
      }
      
      console.log('Course access granted:', result);
      toast.success(`Course access granted to ${data.email}`);
      
      // Refresh the user list
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
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="active">Active Users</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <TabsContent value="all">
                {renderUsersTable(filteredUsers)}
              </TabsContent>
            )}
            
            <TabsContent value="admins">
              {renderUsersTable(filteredUsers.filter(user => user.is_admin))}
            </TabsContent>
            
            <TabsContent value="active">
              {renderUsersTable(filteredUsers.filter(user => user.last_login))}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      {/* Admin Action Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'makeAdmin' 
                ? 'Grant Admin Privileges' 
                : 'Remove Admin Privileges'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'makeAdmin'
                ? `Are you sure you want to grant admin privileges to ${selectedUser?.name || selectedUser?.email}? This will give them access to all administrative functions.`
                : `Are you sure you want to remove admin privileges from ${selectedUser?.name || selectedUser?.email}? They will no longer have access to administrative functions.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, action: null, processing: false })}
              disabled={confirmDialog.processing}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === 'makeAdmin' ? "default" : "destructive"}
              onClick={() => confirmDialog.action === 'makeAdmin' 
                ? handleMakeAdmin(selectedUser!.id)
                : handleRemoveAdmin(selectedUser!.id)
              }
              disabled={confirmDialog.processing}
            >
              {confirmDialog.processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmDialog.action === 'makeAdmin' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Remove Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
  
  function renderUsersTable(usersToDisplay: UserData[]) {
    if (usersToDisplay.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No users found
        </div>
      );
    }
    
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersToDisplay.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || 'Unnamed User'}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100">
                      User
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {user.joined_at && formatDistanceToNow(new Date(user.joined_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {user.last_login 
                    ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true })
                    : 'Never'}
                </TableCell>
                <TableCell>{user.courses_purchased || 0}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{user.successful_referrals || 0}</span>
                    {user.total_earned ? (
                      <span className="text-xs text-green-600">₹{user.total_earned} earned</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      
                      {user.is_admin ? (
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user);
                            setConfirmDialog({ open: true, action: 'removeAdmin', processing: false });
                          }}
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user);
                            setConfirmDialog({ open: true, action: 'makeAdmin', processing: false });
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onClick={() => handleGrantCourseAccess(user.id)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Grant Course Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default UserManagement;
