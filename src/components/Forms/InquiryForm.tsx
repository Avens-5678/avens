import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    // Gate: require authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to submit this form.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

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

      // Auto-create a rental order when form type is rental
      if (formType === "rental") {
        try {
          await supabase.from("rental_orders").insert({
            title: rentalTitle || `Rental Inquiry: ${values.eventType || "General"}`,
            equipment_category: values.eventType || "General",
            equipment_details: values.message,
            location: values.location || null,
            event_date: values.eventDate ? values.eventDate.toISOString().split('T')[0] : null,
            client_name: values.name,
            client_phone: values.phone || null,
            client_email: values.email,
            notes: rentalTitle ? `Rental item: ${rentalTitle}` : null,
            status: "new",
          });
        } catch (rentalErr) {
          console.error("Failed to create rental order:", rentalErr);
        }
      }

      // Send to Zoho CRM
      try {
        const zohoResponse = await supabase.functions.invoke('zoho-crm', {
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

        if (zohoResponse.error) {
          console.error('Zoho CRM sync error:', zohoResponse.error);
        } else {
          console.log('Successfully synced to Zoho CRM');
        }
      } catch (zohoError) {
        console.error('Zoho CRM integration failed:', zohoError);
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
      <Card className="w-full">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="px-5 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField 
              control={form.control} 
              name="name" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={form.control} 
              name="email" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField 
                control={form.control} 
                name="phone" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <FormField 
                control={form.control} 
                name="location" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City/Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
            </div>

            {!eventType && (
              <FormField 
                control={form.control} 
                name="eventType" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )} 
            />
            )}

            <FormField 
              control={form.control} 
              name="eventDate" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "w-full pl-3 text-left font-normal", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                      placeholder="Tell us about your event requirements..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <Button 
              type="submit" 
              className="w-full mt-2" 
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