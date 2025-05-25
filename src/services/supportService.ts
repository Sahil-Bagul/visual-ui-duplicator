
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

// Create a new support ticket
export async function createSupportTicket(
  subject: string,
  message: string
): Promise<{
  success: boolean;
  ticketId?: string;
  error?: string;
}> {
  try {
    console.log(`Creating support ticket: ${subject}`);
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { 
        success: false, 
        error: "Authentication error: " + (authError?.message || "Not authenticated") 
      };
    }
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: authData.user.id,
        subject: subject,
        message: message,
        status: 'open'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error submitting support ticket:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: true, 
      ticketId: data.id 
    };
  } catch (error) {
    console.error('Exception submitting support ticket:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Submit a new support ticket (alias for createSupportTicket)
export const submitSupportTicket = createSupportTicket;

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
    
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status: status,
        admin_response: adminResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);
    
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
