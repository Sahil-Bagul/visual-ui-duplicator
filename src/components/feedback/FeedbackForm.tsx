
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long' }).max(255),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long' }),
});

type FeedbackFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, onCancel, className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          subject: values.subject,
          message: values.message,
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-100 shadow-sm ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Send Us Feedback</h2>
      <p className="text-gray-500 mb-6">Your suggestions help us improve our platform to serve you better.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Subject of your feedback" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your thoughts, suggestions or report issues..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3 justify-end pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="bg-[#00C853] hover:bg-[#00A846] text-white">
              Submit Feedback
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FeedbackForm;
