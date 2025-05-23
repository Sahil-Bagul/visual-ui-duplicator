
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  joined_at: string;
  is_admin: boolean;
  is_suspended: boolean;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  operation_type: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  created_at: string;
}

// Get all users (admin only)
export async function getAllUsers(): Promise<User[]> {
  try {
    console.log('Fetching all users...');
    
    // First check if current user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_current_user_admin');
    
    if (adminError || !isAdmin) {
      console.error('Not authorized to fetch users:', adminError);
      return [];
    }
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    console.log('Successfully fetched users:', data?.length || 0);
    return data as User[];
  } catch (error) {
    console.error("Exception fetching users:", error);
    return [];
  }
}

// Get a single user by ID using safe function
export async function getUserById(userId: string): Promise<User | null> {
  try {
    if (!userId) return null;

    console.log(`Fetching user ${userId}...`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }

    console.log('Successfully fetched user:', data?.id);
    return data as User;
  } catch (error) {
    console.error(`Exception fetching user ${userId}:`, error);
    return null;
  }
}

// Get current user details
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First get the authenticated user ID
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return null;

    // Use the userId to get the user details
    return await getUserById(authData.user.id);
  } catch (error) {
    console.error("Exception fetching current user:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception updating user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Grant admin privileges to a user
export async function grantAdminPrivileges(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc("grant_admin_privileges", {
      admin_email: email,
    });

    const response = data as any;
    
    if (error) {
      console.error("Error granting admin privileges:", error);
      return { success: false, message: error.message };
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) {
        return { success: true, message: response.message || "Admin privileges granted successfully" };
      } else {
        return { success: false, message: response.message || "Failed to grant admin privileges" };
      }
    }
    
    return { success: true, message: "Admin privileges granted successfully" };
  } catch (error) {
    console.error("Exception granting admin privileges:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

// Revoke admin privileges from a user
export async function revokeAdminPrivileges(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc("revoke_admin_privileges", {
      admin_email: email,
    });

    const response = data as any;
    
    if (error) {
      console.error("Error revoking admin privileges:", error);
      return { success: false, message: error.message };
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) {
        return { success: true, message: response.message || "Admin privileges revoked successfully" };
      } else {
        return { success: false, message: response.message || "Failed to revoke admin privileges" };
      }
    }
    
    return { success: true, message: "Admin privileges revoked successfully" };
  } catch (error) {
    console.error("Exception revoking admin privileges:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

// Toggle user suspension status
export async function toggleUserSuspension(
  userId: string,
  suspend: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the current user's ID to use as admin_id
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return { success: false, message: "Not authenticated" };
    }

    const { data, error } = await supabase.rpc("toggle_user_suspension", {
      admin_id: authData.user.id,
      target_user_id: userId,
      suspend: suspend,
    });

    const response = data as any;
    
    if (error) {
      console.error("Error toggling user suspension:", error);
      return { success: false, message: error.message };
    }
    
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) {
        return { success: true, message: response.message || `User ${suspend ? "suspended" : "unsuspended"} successfully` };
      } else {
        return { success: false, message: response.message || `Failed to ${suspend ? "suspend" : "unsuspend"} user` };
      }
    }
    
    return { 
      success: true, 
      message: `User ${suspend ? "suspended" : "unsuspended"} successfully` 
    };
  } catch (error) {
    console.error("Exception toggling user suspension:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message };
  }
}

// Get content management logs (admin only)
export async function getContentManagementLogs(): Promise<AdminLog[]> {
  try {
    const { data, error } = await supabase
      .from("content_management_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching admin logs:", error);
      return [];
    }

    return data as AdminLog[];
  } catch (error) {
    console.error("Exception fetching admin logs:", error);
    return [];
  }
}
