
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
  created_at?: string;
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
    console.log('Creating support ticket:', subject);
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.error('Authentication error:', authError);
      return { 
        success: false, 
        error: "Authentication error: " + (authError?.message || "Not authenticated") 
      };
    }

    console.log('Authenticated user ID:', authData.user.id);
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: authData.user.id,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating support ticket:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log('Support ticket created successfully:', data.id);
    return { 
      success: true, 
      ticketId: data.id 
    };
  } catch (error) {
    console.error('Exception creating support ticket:', error);
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user support tickets:', error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} user support tickets`);
    
    return (data || []).map(ticket => ({
      ...ticket,
      submitted_at: ticket.created_at
    })) as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching user support tickets:', error);
    return [];
  }
}

// Get all support tickets (admin only) - Fixed to properly join with users table
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching all support tickets (admin)');
    
    // Check if current user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
    
    if (adminError || !isAdmin) {
      console.error('Admin check failed:', adminError);
      return [];
    }
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        users!inner(email, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all support tickets:', error);
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} support tickets for admin`);
    
    return (data || []).map(ticket => ({
      ...ticket,
      submitted_at: ticket.created_at,
      user: {
        email: ticket.users?.email || 'No email',
        name: ticket.users?.name || 'Unknown User'
      }
    })) as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching all support tickets:', error);
    return [];
  }
}

// Respond to a support ticket (admin only)
export async function respondToSupportTicket(
  ticketId: string,
  adminResponse: string,
  status: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`Responding to ticket ${ticketId} with status: ${status}`);
    
    // Check if current user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user');
    
    if (adminError || !isAdmin) {
      console.error('Admin check failed:', adminError);
      return { 
        success: false, 
        error: 'Admin privileges required' 
      };
    }
    
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status: status,
        admin_response: adminResponse.trim(),
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
    
    console.log('Support ticket response saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Exception responding to support ticket:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Alias for backward compatibility
export const submitSupportTicket = createSupportTicket;
