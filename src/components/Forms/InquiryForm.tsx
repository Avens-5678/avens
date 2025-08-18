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
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-xl relative overflow-hidden animate-scale-in">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 animate-pulse"></div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-primary/15 to-accent/15 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-slow-spin"></div>
        
        <CardHeader className="relative z-10 text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-twinkle" />
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-text">
              {title}
            </CardTitle>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent animate-twinkle-delayed" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Ready to create something amazing together?</p>
        </CardHeader>
        
        <CardContent className="relative z-10 p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 lg:space-y-5">
            <FormField control={form.control} name="name" render={({
            field
          }) => <FormItem className="space-y-1 sm:space-y-2 animate-fade-in">
                  <FormLabel className="text-foreground font-medium text-sm">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      className="h-10 sm:h-11 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm rounded-lg hover:border-primary/60"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>} />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem className="space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <FormLabel className="text-foreground font-medium text-sm">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      {...field} 
                      className="h-10 sm:h-11 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm rounded-lg hover:border-primary/60"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>} />

            <FormField control={form.control} name="phone" render={({
            field
          }) => <FormItem className="space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <FormLabel className="text-foreground font-medium text-sm">Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      {...field} 
                      className="h-10 sm:h-11 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm rounded-lg hover:border-primary/60"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>} />

            {!eventType && <FormField control={form.control} name="eventType" render={({
            field
          }) => <FormItem className="space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <FormLabel className="text-foreground font-medium text-sm">Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-11 border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm rounded-lg hover:border-primary/60">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50 bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-lg">
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
                  </FormItem>} />}

            <FormField control={form.control} name="eventDate" render={({
            field
          }) => <FormItem className="flex flex-col space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <FormLabel className="text-foreground font-medium text-sm">Event Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant={"outline"} 
                          className={cn(
                            "w-full h-10 sm:h-11 pl-3 text-left font-normal border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm rounded-lg hover:border-primary/60", 
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span className="text-sm">Pick your event date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-background/95 backdrop-blur-xl border-2 border-border/50 rounded-lg shadow-2xl animate-scale-in" align="start" sideOffset={5}>
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>} />

            <FormField control={form.control} name="message" render={({
            field
          }) => <FormItem className="space-y-1 sm:space-y-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <FormLabel className="text-foreground font-medium text-sm">Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your event requirements..." 
                      className="min-h-[100px] sm:min-h-[120px] border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm resize-none rounded-lg hover:border-primary/60 text-sm" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>} />

            <Button 
              type="submit" 
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold relative overflow-hidden group animate-fade-in rounded-lg" 
              disabled={isLoading}
              style={{ animationDelay: '0.6s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-sm sm:text-base">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    <span className="text-sm sm:text-base">Send Message</span>
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