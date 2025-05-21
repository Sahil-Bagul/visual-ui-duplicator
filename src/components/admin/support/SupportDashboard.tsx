
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, MessageCircle, CheckCircle, XCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  rating?: number;
  status: 'pending' | 'responded' | 'resolved';
  submitted_at: string;
  responded_at: string | null;
  admin_response: string | null;
}

const SupportDashboard: React.FC = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();
  
  // Fetch all feedback/support items
  const { data: feedbackItems = [], isLoading } = useQuery({
    queryKey: ['admin-support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, users(email, name)')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as (FeedbackItem & { users: { email: string; name: string } })[];
    },
  });
  
  // Submit admin response mutation
  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({
          admin_response: response,
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-requests'] });
      toast.success('Response submitted successfully');
      setResponseDialogOpen(false);
      setResponseText('');
    },
    onError: (error) => {
      toast.error(`Failed to submit response: ${error.message}`);
    },
  });
  
  // Change feedback status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-requests'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
  
  // Filter the feedback items based on status and search term
  const filteredItems = feedbackItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });
  
  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    await respondMutation.mutateAsync({ 
      id: selectedFeedback.id, 
      response: responseText 
    });
  };
  
  const handleStatusChange = async (id: string, status: string) => {
    await changeStatusMutation.mutateAsync({ id, status });
  };
  
  // Count items by status
  const pendingCount = feedbackItems.filter(item => item.status === 'pending').length;
  const respondedCount = feedbackItems.filter(item => item.status === 'responded').length;
  const resolvedCount = feedbackItems.filter(item => item.status === 'resolved').length;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Pending</Badge>;
      case 'responded':
        return <Badge variant="outline" className="bg-blue-100">Responded</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
                <SelectItem value="responded">Responded ({respondedCount})</SelectItem>
                <SelectItem value="resolved">Resolved ({resolvedCount})</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>Pending: {pendingCount}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Responded: {respondedCount}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>Resolved: {resolvedCount}</span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No support requests found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 
                'Try adjusting your filters' : 
                'When users submit support requests, they will appear here'}
            </p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(item.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{item.users.email}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setResponseDialogOpen(true);
                            setResponseText(item.admin_response || '');
                          }}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          Reply
                        </Button>
                        {item.status !== 'resolved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleStatusChange(item.id, 'resolved')}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Resolve
                          </Button>
                        )}
                        {item.status === 'resolved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600"
                            onClick={() => handleStatusChange(item.id, 'pending')}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reopen
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
        
        {/* Response Dialog */}
        {selectedFeedback && (
          <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Respond to Support Request</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <Label className="text-gray-500 text-xs">FROM</Label>
                        <div className="font-medium">{selectedFeedback.users.email}</div>
                      </div>
                      <div className="text-right">
                        <Label className="text-gray-500 text-xs">SUBMITTED</Label>
                        <div className="font-mono text-sm">
                          {new Date(selectedFeedback.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-500 text-xs">SUBJECT</Label>
                      <div className="font-semibold">{selectedFeedback.subject}</div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-500 text-xs">MESSAGE</Label>
                      <div className="whitespace-pre-wrap bg-white p-3 rounded-md border mt-1">
                        {selectedFeedback.message}
                      </div>
                    </div>
                    
                    {selectedFeedback.rating && (
                      <div>
                        <Label className="text-gray-500 text-xs">RATING</Label>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i}
                              className={`h-5 w-5 text-lg ${i < selectedFeedback.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="response">Your Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Type your response here..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setResponseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || respondMutation.isPending}
                >
                  {respondMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Response
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportDashboard;
