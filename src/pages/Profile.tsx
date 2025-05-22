import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUserProfile } from '@/services/userManagementService';
import PageLayout from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // If no authenticated user, return null
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('name, email, is_admin')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // When profile data is loaded, set the form state
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return await updateUserProfile(user.id, { name, email });
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({ name, email });
  };

  return (
    <PageLayout title="Profile" backTo="/dashboard">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-t-primary border-gray-200 rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || updateProfileMutation.isPending}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing || updateProfileMutation.isPending}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-2">
                  {!isEditing ? (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      variant="default"
                      className="bg-[#00C853] hover:bg-[#00A846] text-white"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to original values
                          if (profile) {
                            setName(profile.name || '');
                            setEmail(profile.email || '');
                          }
                        }}
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="default"
                        className="bg-[#00C853] hover:bg-[#00A846] text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Profile;
