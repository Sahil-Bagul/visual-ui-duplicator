
import { supabase } from '@/integrations/supabase/client';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  submitted_at: string;
  admin_response?: string;
  responded_at?: string;
  user?: {
    email: string;
    name: string;
  };
}

// Create a new support ticket
export async function createSupportTicket(
  subject: string, 
  message: string
): Promise<{ success: boolean; ticket_id?: string; error?: string; }> {
  try {
    console.log(`Creating support ticket: ${subject}`);
    
    // Call the Supabase RPC function to submit a ticket
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

    console.log('Support ticket created successfully:', data);
    return {
      success: true,
      ticket_id: data
    };
  } catch (error) {
    console.error('Exception submitting support ticket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
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
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }

    console.log(`Retrieved ${data?.length || 0} support tickets`);
    return data as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching support tickets:', error);
    return [];
  }
}

// Get all support tickets (admin only)
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching all support tickets (admin view)');
    
    // Join with users table to get user information
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:user_id (
          email,
          name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching all support tickets:', error);
      return [];
    }

    console.log(`Retrieved ${data?.length || 0} support tickets`);
    return data as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching all support tickets:', error);
    return [];
  }
}

// Admin responds to a support ticket
export async function respondToSupportTicket(
  ticketId: string,
  response: string,
  status: 'in_progress' | 'resolved' | 'closed'
): Promise<{ success: boolean; error?: string; }> {
  try {
    console.log(`Responding to ticket ${ticketId} with status ${status}`);
    
    // Call the Supabase RPC function to respond to a ticket
    const { error } = await supabase.rpc('respond_to_support_ticket', {
      ticket_id_param: ticketId,
      status_param: status,
      admin_response_param: response
    });

    if (error) {
      console.error('Error responding to support ticket:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Response submitted successfully');
    return {
      success: true
    };
  } catch (error) {
    console.error('Exception responding to support ticket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
