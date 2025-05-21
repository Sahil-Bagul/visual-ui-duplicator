
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'resolved';
  submitted_at: string;
  admin_response: string | null;
}

const UserSupportTickets: React.FC = () => {
  const { user } = useAuth();
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
      }
      
      return data as FeedbackItem[];
    },
    enabled: !!user?.id,
  });
  
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <h3 className="text-lg font-medium">No support tickets yet</h3>
        <p className="text-sm text-gray-500">
          Your support requests will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{ticket.subject}</h3>
            {getStatusBadge(ticket.status)}
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            Submitted: {new Date(ticket.submitted_at).toLocaleString()}
          </div>
          
          <div className="bg-gray-50 p-3 rounded text-sm mb-3">
            {ticket.message}
          </div>
          
          {ticket.admin_response && (
            <>
              <div className="text-sm font-medium text-gray-700 mt-3 mb-1">
                Response from Support:
              </div>
              <div className="bg-blue-50 p-3 rounded text-sm">
                {ticket.admin_response}
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UserSupportTickets;
