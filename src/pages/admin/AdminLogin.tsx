import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Mail, KeyRound, Loader2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'choose' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { toast } = useToast();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const { data: isValidAdmin, error: validationError } = await supabase
        .rpc('validate_admin_email', { check_email: values.email });

      if (validationError) throw validationError;

      if (!isValidAdmin) {
        toast({
          title: "Access Denied",
          description: "This email is not authorized for admin access.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setEmail(values.email);
      setStep('choose');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to validate email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseOTP = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;

      setStep('otp');
      toast({ title: "OTP Sent", description: "Check your email for the login code." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the complete 6-digit code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      toast({ title: "Login Successful", description: "Welcome to the admin dashboard." });
      onLoginSuccess();
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message || "Invalid OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: values.password });
      if (error) throw error;
      toast({ title: "Login Successful", description: "Welcome to the admin dashboard." });
      onLoginSuccess();
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast({ title: "OTP Resent", description: "Check your email for the new code." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to resend OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Website
          </Link>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription className="mt-2">
              {step === 'email' && 'Enter your admin email to continue'}
              {step === 'choose' && 'Choose how you want to sign in'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'password' && 'Enter your password to sign in'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Email */}
          {step === 'email' && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="admin@evnting.com" className="pl-10" disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : <><Mail className="mr-2 h-4 w-4" />Continue</>}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: Choose method */}
          {step === 'choose' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">Signing in as <span className="font-medium text-foreground">{email}</span></p>
              <Button onClick={handleChooseOTP} className="w-full" variant="default" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Sign in with OTP
              </Button>
              <Button onClick={() => setStep('password')} className="w-full" variant="outline" disabled={isLoading}>
                <Lock className="mr-2 h-4 w-4" />
                Sign in with Password
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { setStep('email'); setEmail(''); }} disabled={isLoading}>
                <ArrowLeft className="mr-1 h-4 w-4" />Change Email
              </Button>
            </div>
          )}

          {/* Step 3a: OTP */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <KeyRound className="h-4 w-4" />
                  <span>Code sent to: {email}</span>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button onClick={handleVerifyOTP} className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Login'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button type="button" variant="ghost" onClick={() => { setStep('choose'); setOtp(''); }} disabled={isLoading}>
                  <ArrowLeft className="mr-1 h-4 w-4" />Back
                </Button>
                <Button type="button" variant="link" onClick={handleResendOTP} disabled={isLoading}>Resend Code</Button>
              </div>
            </div>
          )}

          {/* Step 3b: Password */}
          {step === 'password' && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">Signing in as <span className="font-medium text-foreground">{email}</span></p>
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="Enter your password" className="pl-10" disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <><Lock className="mr-2 h-4 w-4" />Sign In</>}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setStep('choose')} disabled={isLoading}>
                  <ArrowLeft className="mr-1 h-4 w-4" />Back
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
