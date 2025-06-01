import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, ArrowUpRight, ArrowDownLeft, HelpCircle, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PayoutRequestsManagement from './PayoutRequestsManagement';

interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  has_used_referral_code: boolean;
  used_referral_code: string | null;
  amount: number;
  course?: {
    title: string;
    price: number;
  };
  user?: {
    email: string | null;
    name: string | null;
  };
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  payout_method_id: string | null;
  razorpay_payout_id: string | null;
  failure_reason: string | null;
  user?: {
    email: string | null;
    name: string | null;
  };
}

const PaymentsDashboard: React.FC = () => {
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean, data: any | null }>({ 
    open: false, 
    data: null 
  });
  
  // Fetch purchases data
  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ['admin-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          course:courses(title, price),
          user:users(email, name)
        `)
        .order('purchased_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching purchases:", error);
        throw error;
      }
      
      // Handle possible relation errors by providing default values
      return (data || []).map(item => ({
        ...item,
        course: item.course || { title: 'Unknown Course', price: 0 },
        user: item.user || { email: 'Unknown User', name: 'Unknown' },
        has_used_referral_code: item.has_used_referral_code || false,
        used_referral_code: item.used_referral_code || null
      })) as Purchase[];
    },
  });
  
  // Fetch payouts data
  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          user:users(email, name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching payouts:", error);
        throw error;
      }
      
      // Handle possible relation errors by providing default values
      return (data || []).map(item => ({
        ...item,
        user: item.user || { email: 'Unknown User', name: 'Unknown' },
        processed_at: item.processed_at || null,
        payout_method_id: item.payout_method_id || null,
        razorpay_payout_id: item.razorpay_payout_id || null,
        failure_reason: item.failure_reason || null
      })) as Payout[];
    },
  });
  
  // Calculate summary metrics
  const totalPurchaseAmount = purchases.reduce((sum, p) => sum + (p.course?.price || 0), 0);
  const totalPaidOut = payouts
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Successful</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(totalPurchaseAmount)}</h3>
                </div>
                <div className="p-2 rounded-full bg-green-50">
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Payouts</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(totalPaidOut)}</h3>
                </div>
                <div className="p-2 rounded-full bg-blue-50">
                  <ArrowDownLeft className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Pending Payouts</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(pendingPayouts)}</h3>
                </div>
                <div className="p-2 rounded-full bg-yellow-50">
                  <HelpCircle className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="payout-requests">Payout Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Purchase History</h2>
              <div className="flex space-x-2">
                <Input placeholder="Search..." className="w-[200px]" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purchases</SelectItem>
                    <SelectItem value="referral">With Referral</SelectItem>
                    <SelectItem value="no-referral">No Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loadingPurchases ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No purchases found</h3>
                <p className="text-gray-500">When users make purchases, they will appear here</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(purchase.purchased_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{purchase.user?.email || 'Unknown User'}</TableCell>
                        <TableCell>{purchase.course?.title || 'Unknown Course'}</TableCell>
                        <TableCell>{formatCurrency(purchase.course?.price || 0)}</TableCell>
                        <TableCell>
                          {purchase.has_used_referral_code ? (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                              {purchase.used_referral_code || 'Referral Used'}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDetailsDialog({ open: true, data: purchase })}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payouts" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Payout History</h2>
              <div className="flex space-x-2">
                <Input placeholder="Search..." className="w-[200px]" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loadingPayouts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No payouts found</h3>
                <p className="text-gray-500">Requested payouts will appear here</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payout.user?.email || 'Unknown User'}</TableCell>
                        <TableCell>{formatCurrency(payout.amount)}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.processed_at ? 
                            new Date(payout.processed_at).toLocaleDateString() : 
                            '-'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDetailsDialog({ open: true, data: payout })}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payout-requests" className="space-y-4">
            <PayoutRequestsManagement />
          </TabsContent>
        </Tabs>
        
        {/* Details Dialog */}
        <Dialog open={detailsDialog.open} onOpenChange={() => setDetailsDialog({ open: false, data: null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {detailsDialog.data && 'course_id' in detailsDialog.data 
                  ? 'Purchase Details' 
                  : 'Payout Details'}
              </DialogTitle>
            </DialogHeader>
            
            {detailsDialog.data && (
              <div className="space-y-4 text-sm">
                {'course_id' in detailsDialog.data ? (
                  /* Purchase Details */
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">ID:</div>
                      <div>{detailsDialog.data.id}</div>
                      
                      <div className="font-medium">Date:</div>
                      <div>{new Date(detailsDialog.data.purchased_at).toLocaleString()}</div>
                      
                      <div className="font-medium">User:</div>
                      <div>
                        {detailsDialog.data.user?.name || 'Unknown'} <br />
                        <span className="text-gray-500 text-xs">{detailsDialog.data.user?.email || 'No email'}</span>
                      </div>
                      
                      <div className="font-medium">Course:</div>
                      <div>{detailsDialog.data.course?.title || 'Unknown Course'}</div>
                      
                      <div className="font-medium">Amount:</div>
                      <div>{formatCurrency(detailsDialog.data.course?.price || 0)}</div>
                      
                      <div className="font-medium">Referral Used:</div>
                      <div>
                        {detailsDialog.data.has_used_referral_code 
                          ? detailsDialog.data.used_referral_code || 'Yes'
                          : 'No'}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Payout Details */
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">ID:</div>
                      <div>{detailsDialog.data.id}</div>
                      
                      <div className="font-medium">Date Requested:</div>
                      <div>{new Date(detailsDialog.data.created_at).toLocaleString()}</div>
                      
                      <div className="font-medium">User:</div>
                      <div>
                        {detailsDialog.data.user?.name || 'Unknown'} <br />
                        <span className="text-gray-500 text-xs">{detailsDialog.data.user?.email || 'No email'}</span>
                      </div>
                      
                      <div className="font-medium">Amount:</div>
                      <div>{formatCurrency(detailsDialog.data.amount)}</div>
                      
                      <div className="font-medium">Status:</div>
                      <div>{getStatusBadge(detailsDialog.data.status)}</div>
                      
                      {detailsDialog.data.processed_at && (
                        <>
                          <div className="font-medium">Processed On:</div>
                          <div>{new Date(detailsDialog.data.processed_at).toLocaleString()}</div>
                        </>
                      )}
                      
                      {detailsDialog.data.razorpay_payout_id && (
                        <>
                          <div className="font-medium">Payment ID:</div>
                          <div className="break-all">{detailsDialog.data.razorpay_payout_id}</div>
                        </>
                      )}
                      
                      {detailsDialog.data.failure_reason && (
                        <>
                          <div className="font-medium">Failure Reason:</div>
                          <div className="text-red-600">{detailsDialog.data.failure_reason}</div>
                        </>
                      )}
                    </div>
                    
                    {detailsDialog.data.status === 'pending' && (
                      <div className="pt-2">
                        <DialogDescription className="text-xs text-gray-500 mb-2">
                          Pending payouts can be confirmed through the Telegram bot using the payout ID.
                        </DialogDescription>
                        <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                          /confirm_payout {detailsDialog.data.id}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        
      </CardContent>
    </Card>
  );
};

export default PaymentsDashboard;
