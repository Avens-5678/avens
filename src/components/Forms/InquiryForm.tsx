import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.date().optional(),
  location: z.string().min(2, "Location is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});
interface InquiryFormProps {
  formType?: "inquiry" | "contact" | "rental";
  eventType?: string;
  rentalId?: string;
  rentalTitle?: string;
  title?: string;
  onSuccess?: () => void;
}
const InquiryForm = ({
  formType = "inquiry",
  eventType,
  rentalId,
  rentalTitle,
  title = "Get In Touch",
  onSuccess
}: InquiryFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    toast
  } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventType: eventType || "",
      eventDate: undefined,
      location: "",
      message: ""
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // First save to Supabase
      const { data: submission, error } = await supabase
        .from("form_submissions")
        .insert({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          message: values.message,
          form_type: formType,
          event_type: values.eventType as any || null,
          event_date: values.eventDate ? values.eventDate.toISOString().split('T')[0] : null,
          rental_id: rentalId || null,
          rental_title: rentalTitle || null,
          location: values.location,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      // Send to HubSpot CRM
      try {
        const hubspotResponse = await supabase.functions.invoke('hubspot-integration', {
          body: {
            submissionId: submission.id,
            name: values.name,
            email: values.email,
            phone: values.phone,
            message: values.message,
            formType: formType,
            eventType: values.eventType,
            eventDate: values.eventDate ? values.eventDate.toISOString().split('T')[0] : null,
            rentalTitle: rentalTitle,
            location: values.location,
          },
        });

        if (hubspotResponse.error) {
          console.error('HubSpot sync error:', hubspotResponse.error);
        } else {
          console.log('Successfully synced to HubSpot');
        }
      } catch (hubspotError) {
        console.error('HubSpot integration failed:', hubspotError);
        // Continue anyway - form is saved locally
      }

      setShowSuccess(true);
      form.reset();
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000); // Wait 2 seconds for the success animation
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField 
              control={form.control} 
              name="name" 
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} className="h-8" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="email" 
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} className="h-8" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} 
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField 
                control={form.control} 
                name="phone" 
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-xs">Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
              />

              <FormField 
                control={form.control} 
                name="location" 
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-xs">Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City/Location" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
              />
            </div>

            {!eventType && (
              <FormField 
                control={form.control} 
                name="eventType" 
                render={({ field }) => (
                  <FormItem className="space-y-0.5">
                    <FormLabel className="text-xs">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50">
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="government">Government Event</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="social">Social Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} 
            />
            )}

            <FormField 
              control={form.control} 
              name="eventDate" 
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Event Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "w-full h-8 pl-3 text-left font-normal text-xs", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar 
                        mode="single" 
                        selected={field.value} 
                        onSelect={field.onChange} 
                        disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                        initialFocus 
                        className="p-3 pointer-events-auto" 
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="message" 
              render={({ field }) => (
                <FormItem className="space-y-0.5">
                  <FormLabel className="text-xs">Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your event requirements..." 
                      className="min-h-[60px] resize-none text-xs" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} 
            />

            <Button 
              type="submit" 
              className="w-full h-8 text-xs" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    
    <SuccessAnimation 
      show={showSuccess} 
      title="Message Sent!" 
      message="We'll get back to you within 24 hours. Thank you for choosing us!"
      onComplete={() => setShowSuccess(false)}
    />
  </>
  );
};
export default InquiryForm;