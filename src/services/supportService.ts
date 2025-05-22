
import { supabase } from '@/integrations/supabase/client';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response?: string;
  submitted_at: string;
  responded_at?: string;
  created_at?: string; // Added for compatibility with DB response
  user?: {
    email: string;
    name: string;
  };
}

// Submit a new support ticket
export async function submitSupportTicket(
  subject: string,
  message: string
): Promise<{
  success: boolean;
  ticketId?: string;
  error?: string;
}> {
  try {
    console.log(`Submitting support ticket: ${subject}`);
    
    const { data, error } = await supabase.rpc('submit_support_ticket', {
      subject_param: subject,
      message_param: message
    });
    
    if (error) {
      console.error('Error submitting support ticket:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      ticketId: data as string 
    };
  } catch (error) {
    console.error('Exception submitting support ticket:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Get support tickets for the current user
export async function getUserSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching user support tickets');
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
    
    console.log(`Retrieved ${data.length} support tickets`);
    
    // Map database response to SupportTicket interface
    return data.map(ticket => ({
      ...ticket,
      submitted_at: ticket.created_at
    })) as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching support tickets:', error);
    return [];
  }
}

// Get all support tickets (admin only)
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching all support tickets');
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, user:users(email, name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all support tickets:', error);
      return [];
    }
    
    console.log(`Retrieved ${data.length} support tickets`);
    
    // Map database response to SupportTicket interface
    return data.map(ticket => ({
      ...ticket,
      submitted_at: ticket.created_at
    })) as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching all support tickets:', error);
    return [];
  }
}

// Respond to a support ticket (admin only)
export async function respondToSupportTicket(
  ticketId: string,
  status: string,
  adminResponse: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`Responding to ticket ${ticketId} with status: ${status}`);
    
    const { error } = await supabase.rpc('respond_to_support_ticket', {
      ticket_id_param: ticketId,
      status_param: status,
      admin_response_param: adminResponse
    });
    
    if (error) {
      console.error('Error responding to support ticket:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exception responding to support ticket:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
