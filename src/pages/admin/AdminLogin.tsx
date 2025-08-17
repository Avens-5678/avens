import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle auth state changes (for magic link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError || !adminData) {
          // Sign out if not admin
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Admin privileges required.",
            variant: "destructive",
          });
          return;
        }

        // Success! Login complete
        onLoginSuccess(adminData);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard!",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [onLoginSuccess, toast]);

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);

    try {
      // Send magic link (simpler than OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          shouldCreateUser: false,
        }
      });

      if (error) {
        throw error;
      }

      setEmail(values.email);
      setEmailSent(true);
      
      toast({
        title: "Magic Link Sent",
        description: "Please check your email and click the link to sign in.",
      });
    } catch (error: any) {
      console.error("Email submission error:", error);
      toast({
        title: "Error", 
        description: error.message || "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          shouldCreateUser: false,
        }
      });

      if (error) throw error;

      toast({
        title: "Magic Link Resent",
        description: "A new magic link has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setEmailSent(false);
    setEmail('');
    emailForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link
              to="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website
            </Link>
          </div>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {!emailSent ? (
              <Shield className="h-6 w-6 text-primary" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {!emailSent ? 'Admin Login' : 'Check Your Email'}
          </CardTitle>
          <p className="text-muted-foreground">
            {!emailSent 
              ? 'Enter your admin email to receive a magic link'
              : `We sent a magic link to ${email}. Click the link in your email to sign in.`
            }
          </p>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your admin email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Magic Link
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Magic Link Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email inbox and click the login link to access the admin dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Magic Link
                </Button>
                
                <Button 
                  type="button"
                  variant="link" 
                  className="w-full text-sm text-muted-foreground"
                  onClick={handleBackToEmail}
                >
                  Use Different Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;