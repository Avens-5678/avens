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
  message: z.string().min(10, "Message must be at least 10 characters")
});
interface InquiryFormProps {
  formType?: "inquiry" | "contact" | "rental";
  eventType?: string;
  rentalId?: string;
  rentalTitle?: string;
  title?: string;
}
const InquiryForm = ({
  formType = "inquiry",
  eventType,
  rentalId,
  rentalTitle,
  title = "Get In Touch"
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
      message: ""
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from("form_submissions").insert({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        message: values.message,
        form_type: formType,
        event_type: values.eventType as any || null,
        rental_id: rentalId || null,
        rental_title: rentalTitle || null
      });
      if (error) throw error;

      // Note: We don't trigger notifications here since we can't read the submission ID
      // due to RLS policies. The notification will be handled via database triggers
      // or the admin panel when the submission is processed.

      setShowSuccess(true);
      form.reset();
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
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <CardHeader className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <CardTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <Sparkles className="w-6 h-6 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-sm text-muted-foreground">Ready to create something amazing together?</p>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
            <FormField control={form.control} name="name" render={({
            field
          }) => <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      className="border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      {...field} 
                      className="border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="phone" render={({
            field
          }) => <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      {...field} 
                      className="border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            {!eventType && <FormField control={form.control} name="eventType" render={({
            field
          }) => <FormItem className="space-y-2">
                    <FormLabel className="text-foreground font-medium">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                  </FormItem>} />}

            <FormField control={form.control} name="eventDate" render={({
            field
          }) => <FormItem className="flex flex-col space-y-2">
                  <FormLabel className="text-foreground font-medium">Event Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant={"outline"} 
                          className={cn(
                            "w-full pl-3 text-left font-normal border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick your event date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="message" render={({
            field
          }) => <FormItem className="space-y-2">
                  <FormLabel className="text-foreground font-medium">Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your event requirements..." 
                      className="min-h-[120px] border-2 border-border/50 focus:border-primary transition-all duration-300 bg-background/50 backdrop-blur-sm resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold py-3 relative overflow-hidden group" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center">
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
              </div>
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