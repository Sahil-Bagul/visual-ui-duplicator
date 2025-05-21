
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Search, Download, CreditCard, CheckCircle2, AlertTriangle, X, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  has_used_referral_code: boolean;
  used_referral_code: string | null;
  user: {
    email: string | null;
    name: string | null;
  };
  course: {
    title: string;
    price: number;
    referral_reward: number;
  };
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at: string | null;
  payout_method_id: string;
  failure_reason: string | null;
  user: {
    email: string | null;
    name: string | null;
  };
}

const PaymentsDashboard: React.FC = () => {
  const [tab, setTab] = useState('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [payoutDetailsOpen, setPayoutDetailsOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch purchases
  const { data: purchases = [], isLoading: isPurchasesLoading } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          user:user_id(email, name),
          course:course_id(title, price, referral_reward)
        `)
        .order('purchased_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching purchases:", error);
        throw new Error(error.message);
      }
      
      // Handle possible relation errors by providing default values
      return (data || []).map(item => ({
        ...item,
        user: item.user || { email: 'Unknown User', name: 'Unknown' },
        course: item.course || { title: 'Unknown Course', price: 0, referral_reward: 0 }
      })) as Purchase[];
    },
    enabled: tab === 'purchases',
  });
  
  // Fetch payouts
  const { data: payouts = [], isLoading: isPayoutsLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          user:user_id(email, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching payouts:", error);
        throw new Error(error.message);
      }
      
      // Handle possible relation errors by providing default values
      return (data || []).map(item => ({
        ...item,
        user: item.user || { email: 'Unknown User', name: 'Unknown' }
      })) as Payout[];
    },
    enabled: tab === 'payouts',
  });
  
  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data, error } = await supabase
        .from('payouts')
        .update({
          status: 'processing',
        })
        .eq('id', payoutId)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a real application, you would call a serverless function here
      // to process the payout via your payment provider
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      toast.success('Payout marked as processing');
      setPayoutDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to process payout: ${error.message}`);
    },
  });
  
  // Complete payout mutation
  const completePayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data, error } = await supabase
        .from('payouts')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      toast.success('Payout marked as completed');
      setPayoutDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to complete payout: ${error.message}`);
    },
  });
  
  // Filter purchases based on search term and date filter
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = !searchTerm || 
      (purchase.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       purchase.course.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = purchase.purchased_at.startsWith(today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(purchase.purchased_at) >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(purchase.purchased_at) >= monthAgo;
    }
    
    return matchesSearch && matchesDate;
  });
  
  // Filter payouts based on search term and status filter
  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = !searchTerm || 
      payout.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate total amounts
  const totalRevenue = filteredPurchases.reduce((sum, purchase) => sum + purchase.course.price, 0);
  const totalReferralAmount = filteredPurchases
    .filter(p => p.has_used_referral_code)
    .reduce((sum, purchase) => sum + purchase.course.referral_reward, 0);
  const totalPayoutsAmount = filteredPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  
  // Get counts by status for payouts
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const processingPayouts = payouts.filter(p => p.status === 'processing').length;
  const completedPayouts = payouts.filter(p => p.status === 'completed').length;
  const failedPayouts = payouts.filter(p => p.status === 'failed').length;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleProcessPayout = async (payoutId: string) => {
    await processPayoutMutation.mutateAsync(payoutId);
  };
  
  const handleCompletePayout = async (payoutId: string) => {
    await completePayoutMutation.mutateAsync(payoutId);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by email or title..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>
              
              {tab === 'purchases' && (
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {tab === 'payouts' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending ({pendingPayouts})</SelectItem>
                    <SelectItem value="processing">Processing ({processingPayouts})</SelectItem>
                    <SelectItem value="completed">Completed ({completedPayouts})</SelectItem>
                    <SelectItem value="failed">Failed ({failedPayouts})</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="purchases" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <CreditCard className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Purchases</p>
                      <h3 className="text-2xl font-bold mt-1">{filteredPurchases.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Referral Rewards</p>
                      <h3 className="text-2xl font-bold mt-1">₹{totalReferralAmount.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {isPurchasesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No purchase records found</h3>
                <p className="text-gray-500">
                  {searchTerm || dateFilter !== 'all' ? 
                    'Try adjusting your filters' : 
                    'When users purchase courses, they will appear here'}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Referral Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{purchase.user?.email || 'Unknown'}</TableCell>
                        <TableCell>{purchase.course.title}</TableCell>
                        <TableCell>₹{purchase.course.price}</TableCell>
                        <TableCell>
                          {purchase.has_used_referral_code ? (
                            <Badge variant="outline" className="bg-green-50">
                              Yes - ₹{purchase.course.referral_reward}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payouts" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Payouts</p>
                      <h3 className="text-2xl font-bold mt-1">₹{totalPayoutsAmount.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <h3 className="text-2xl font-bold mt-1">{pendingPayouts}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Processing</p>
                      <h3 className="text-2xl font-bold mt-1">{processingPayouts}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completed</p>
                      <h3 className="text-2xl font-bold mt-1">{completedPayouts}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {isPayoutsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No payout records found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' ? 
                    'Try adjusting your filters' : 
                    'When users request payouts, they will appear here'}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payout.user?.email || 'Unknown'}</TableCell>
                        <TableCell>₹{payout.amount}</TableCell>
                        <TableCell>
                          {getStatusBadge(payout.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setPayoutDetailsOpen(true);
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            
                            {payout.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleProcessPayout(payout.id)}
                              >
                                Process
                              </Button>
                            )}
                            
                            {payout.status === 'processing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCompletePayout(payout.id)}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Payout Details Dialog */}
        {selectedPayout && (
          <Dialog open={payoutDetailsOpen} onOpenChange={setPayoutDetailsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Payout Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span>{getStatusBadge(selectedPayout.status)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold">₹{selectedPayout.amount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">User</span>
                  <span>{selectedPayout.user?.email || 'Unknown'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Requested On</span>
                  <span>{new Date(selectedPayout.created_at).toLocaleString()}</span>
                </div>
                
                {selectedPayout.processed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Processed On</span>
                    <span>{new Date(selectedPayout.processed_at).toLocaleString()}</span>
                  </div>
                )}
                
                {selectedPayout.failure_reason && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <span className="text-gray-500 block">Failure Reason:</span>
                    <span className="text-red-600">{selectedPayout.failure_reason}</span>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPayoutDetailsOpen(false)}
                >
                  Close
                </Button>
                
                {selectedPayout.status === 'pending' && (
                  <Button 
                    onClick={() => handleProcessPayout(selectedPayout.id)}
                    disabled={processPayoutMutation.isPending}
                  >
                    {processPayoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Payout'
                    )}
                  </Button>
                )}
                
                {selectedPayout.status === 'processing' && (
                  <Button 
                    onClick={() => handleCompletePayout(selectedPayout.id)}
                    disabled={completePayoutMutation.isPending}
                  >
                    {completePayoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      'Mark as Completed'
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsDashboard;
