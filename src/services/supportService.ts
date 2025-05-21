
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  rating?: number;
  submitted_at: string;
  admin_response?: string;
  responded_at?: string;
  user?: {
    email: string;
    name: string;
  };
}

export async function createSupportTicket(
  subject: string,
  message: string
): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  try {
    console.log('Creating new support ticket:', { subject, message });
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Error getting current user:', userError);
      return { 
        success: false, 
        error: 'You must be logged in to submit a support ticket' 
      };
    }
    
    // Insert the support ticket into the feedback table
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        user_id: userData.user.id,
        subject,
        message,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating support ticket:', error);
      return { 
        success: false, 
        error: `Failed to create support ticket: ${error.message}` 
      };
    }
    
    console.log('Support ticket created:', data);
    
    // Create a notification for the user
    await supabase.rpc('create_user_notification', {
      user_id_param: userData.user.id,
      title_param: 'Support Ticket Submitted',
      message_param: `Your support ticket "${subject}" has been submitted and will be reviewed soon.`,
      type_param: 'info'
    });
    
    return { 
      success: true, 
      ticketId: data.id 
    };
  } catch (error) {
    console.error('Exception creating support ticket:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function getUserSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching user support tickets');
    
    // Get the current user's tickets
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to load support tickets');
      return [];
    }
    
    console.log(`Retrieved ${data?.length || 0} support tickets`);
    return data as SupportTicket[];
  } catch (error) {
    console.error('Exception fetching support tickets:', error);
    toast.error('Failed to load support tickets');
    return [];
  }
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    console.log('Fetching all support tickets');
    
    // Fetch all tickets with user information
    const { data, error } = await supabase
      .from('feedback')
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
      toast.error('Failed to load support tickets');
      return [];
    }
    
    // Map the response to match our SupportTicket interface
    const tickets: SupportTicket[] = data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      subject: item.subject,
      message: item.message,
      status: item.status,
      rating: item.rating,
      submitted_at: item.submitted_at,
      admin_response: item.admin_response,
      responded_at: item.responded_at,
      user: {
        email: item.user?.email || 'Unknown',
        name: item.user?.name || 'Unknown'
      }
    }));
    
    console.log(`Retrieved ${tickets.length} support tickets with user information`);
    return tickets;
  } catch (error) {
    console.error('Exception fetching all support tickets:', error);
    toast.error('Failed to load support tickets');
    return [];
  }
}

export async function respondToSupportTicket(
  ticketId: string, 
  response: string,
  status: 'in_progress' | 'resolved' | 'closed'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Responding to ticket ${ticketId}:`, { response, status });
    
    // Get the ticket first to get the user_id
    const { data: ticketData, error: ticketError } = await supabase
      .from('feedback')
      .select('user_id, subject')
      .eq('id', ticketId)
      .single();
    
    if (ticketError || !ticketData) {
      console.error('Error fetching ticket:', ticketError);
      return { 
        success: false, 
        error: `Failed to fetch ticket: ${ticketError?.message || 'Ticket not found'}` 
      };
    }
    
    // Update the ticket
    const { error } = await supabase
      .from('feedback')
      .update({
        admin_response: response,
        status: status,
        responded_at: new Date().toISOString()
      })
      .eq('id', ticketId);
    
    if (error) {
      console.error('Error responding to support ticket:', error);
      return { 
        success: false, 
        error: `Failed to update ticket: ${error.message}` 
      };
    }
    
    console.log(`Updated support ticket ${ticketId} with admin response`);
    
    // Create a notification for the user
    await supabase.rpc('create_user_notification', {
      user_id_param: ticketData.user_id,
      title_param: `Support Ticket ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
      message_param: `Your support ticket "${ticketData.subject}" has been ${status}. Check your support tickets for the response.`,
      type_param: 'info',
      action_url_param: '/profile',
      action_text_param: 'View Ticket'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Exception responding to support ticket:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
