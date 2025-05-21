
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Course, createCourse, updateCourse } from "@/services/courseManagementService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  referral_reward: z.coerce.number().min(0, "Referral reward must be a positive number"),
  pdf_url: z.string().url("PDF URL must be a valid URL").optional().or(z.literal("")),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  course?: Course;
  onSuccess: () => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  course,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!course;
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      price: course?.price || 0,
      referral_reward: course?.referral_reward || 0,
      pdf_url: course?.pdf_url || "",
    },
  });
  
  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Course, "id">) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course created successfully');
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Failed to create course: ${error.message}`);
      setIsSubmitting(false);
    },
  });
  
  // Update course mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) => 
      updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course updated successfully');
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Failed to update course: ${error.message}`);
      setIsSubmitting(false);
    },
  });
  
  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && course) {
        await updateMutation.mutateAsync({ 
          id: course.id, 
          data: {
            title: data.title,
            description: data.description,
            price: data.price,
            referral_reward: data.referral_reward,
            pdf_url: data.pdf_url || null,
          }
        });
      } else {
        await createMutation.mutateAsync({
          title: data.title,
          description: data.description,
          price: data.price,
          referral_reward: data.referral_reward,
          pdf_url: data.pdf_url || null,
        });
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AI Tools for Students" {...field} />
              </FormControl>
              <FormDescription>
                The main title of your course
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what students will learn in this course..." 
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A detailed description of the course content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Set the course price in rupees
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="referral_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Reward (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Reward amount for referrals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/course.pdf" {...field} />
              </FormControl>
              <FormDescription>
                Link to the course PDF content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
