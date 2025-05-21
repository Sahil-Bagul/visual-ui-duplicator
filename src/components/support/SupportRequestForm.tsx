
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Send } from 'lucide-react';

// Define the form schema
const supportFormSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.string().optional(),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

interface SupportRequestFormProps {
  onSubmitSuccess: () => void;
}

const SupportRequestForm: React.FC<SupportRequestFormProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      subject: '',
      message: '',
      rating: undefined,
    },
  });

  const onSubmit = async (values: SupportFormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a support request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert string rating to number if provided
      const ratingValue = values.rating ? parseInt(values.rating) : null;
      
      // Insert into feedback table
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          subject: values.subject,
          message: values.message,
          rating: ratingValue,
          status: 'pending',
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success("Your support request has been submitted successfully");
      form.reset();
      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Failed to submit your support request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of your issue" {...field} />
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
                  placeholder="Please describe your issue in detail" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Rate your experience (optional)</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-2"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} className="sr-only" />
                      <Label
                        htmlFor={`rating-${rating}`}
                        className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer ${
                          field.value === rating.toString() ? 'bg-[#00C853] text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {rating}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#00C853] hover:bg-green-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> 
              Submit Request
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SupportRequestForm;
