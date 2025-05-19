
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PayoutMethodForm from './PayoutMethodForm';

interface PayoutMethod {
  id: string;
  method_type: 'UPI' | 'BANK';
  upi_id: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  is_default: boolean;
  added_at: string;
}

const PayoutMethodsList: React.FC = () => {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);

  const fetchPayoutMethods = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('added_at', { ascending: false });
        
      if (error) throw error;
      
      setPayoutMethods(data || []);
    } catch (error) {
      console.error('Error fetching payout methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutMethods();
  }, [user]);

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payout_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Re-fetch the data to get updated list with the new default
      fetchPayoutMethods();
    } catch (error) {
      console.error('Error setting default payout method:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('payout_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setPayoutMethods(payoutMethods.filter(method => method.id !== id));
    } catch (error) {
      console.error('Error deleting payout method:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading payout methods...</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Payout Methods</h3>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">+ Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payout Method</DialogTitle>
            </DialogHeader>
            <PayoutMethodForm onSuccess={() => {
              setOpenDialog(false);
              fetchPayoutMethods();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {payoutMethods.length === 0 ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No payout methods added yet</p>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2">Add Your First Payout Method</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payout Method</DialogTitle>
              </DialogHeader>
              <PayoutMethodForm onSuccess={() => {
                setOpenDialog(false);
                fetchPayoutMethods();
              }} />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-3">
          {payoutMethods.map((method) => (
            <div key={method.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{method.method_type}</span>
                  {method.is_default && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                  )}
                </div>
                {method.method_type === 'UPI' ? (
                  <p className="text-sm text-gray-600 mt-1">{method.upi_id}</p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Acc: {method.account_number?.slice(-4).padStart(method.account_number?.length || 0, '*')} • 
                    IFSC: {method.ifsc_code}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                {!method.is_default && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(method.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayoutMethodsList;
