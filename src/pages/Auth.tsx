import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, ArrowLeft, UserPlus, ArrowRight, Shield, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Step = "email" | "password" | "role-select" | "forgot-password";

interface UserTypeInfo {
  is_admin: boolean;
  exists: boolean;
  roles: string[];
}

const Auth = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [userTypeInfo, setUserTypeInfo] = useState<UserTypeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { signIn, user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  // Redirect based on user role
  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (user && role) {
      switch (role) {
        case "admin": navigate("/admin"); break;
        case "client": navigate("/client/dashboard"); break;
        case "vendor": navigate("/vendor/dashboard"); break;
        default: navigate("/");
      }
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-user-type", {
        body: { email: values.email },
      });

      if (error) throw error;

      setEmail(values.email);
      setUserTypeInfo(data);

      if (data.is_admin) {
        // Redirect to admin OTP login
        navigate("/admin");
        return;
      }

      if (data.exists) {
        setStep("password");
      } else {
        toast({
          title: "Account Not Found",
          description: "No account found with this email. Create one below.",
        });
        navigate("/auth/register");
      }
    } catch (error: any) {
      console.error("Check email error:", error);
      toast({
        title: "Error",
        description: "Could not verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, values.password);
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message.includes("Invalid login credentials")
            ? "Invalid password. Please try again."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      // If user has multiple roles, show role selector
      if (userTypeInfo && userTypeInfo.roles && userTypeInfo.roles.length > 1) {
        setStep("role-select");
        return;
      }

      toast({ title: "Welcome back!", description: "You have successfully signed in." });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    switch (selectedRole) {
      case "client": navigate("/client/dashboard"); break;
      case "vendor": navigate("/vendor/dashboard"); break;
      case "admin": navigate("/admin"); break;
      default: navigate("/");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter Email First", description: "Please enter your email address above.", variant: "destructive" });
      setStep("email");
      return;
    }
    setIsForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast({ title: "Reset Link Sent", description: "Check your email for the password reset link." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Evnting.com
          </CardTitle>
          <p className="text-muted-foreground">
            {step === "email" && "Enter your email to continue"}
            {step === "password" && `Signing in as ${email}`}
            {step === "role-select" && "Choose your dashboard"}
            {step === "forgot-password" && "Reset your password"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-8">
          {/* Step 1: Email */}
          {step === "email" && (
            <>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Continue
                  </Button>
                </form>
              </Form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
                <Link to="/auth/register">
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Password */}
          {step === "password" && (
            <>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </form>
              </Form>

              <div className="flex items-center justify-between text-sm">
                <Button variant="ghost" size="sm" onClick={() => { setStep("email"); setEmail(""); }}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Change Email
                </Button>
                <Button variant="link" size="sm" onClick={handleForgotPassword} disabled={isForgotLoading}>
                  {isForgotLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  Forgot Password?
                </Button>
              </div>

              {forgotSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Mail className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-700">Reset link sent to {email}</p>
                </div>
              )}
            </>
          )}

          {/* Step 3: Role Select (dual-role users) */}
          {step === "role-select" && userTypeInfo && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                You have multiple roles. Choose which dashboard to open:
              </p>
              {userTypeInfo.roles.map((r) => (
                <Button
                  key={r}
                  variant="outline"
                  className="w-full h-14 text-left justify-start"
                  onClick={() => handleRoleSelect(r)}
                >
                  {r === "client" && <UserPlus className="mr-3 h-5 w-5 text-primary" />}
                  {r === "vendor" && <Shield className="mr-3 h-5 w-5 text-accent" />}
                  {r === "admin" && <Shield className="mr-3 h-5 w-5 text-destructive" />}
                  <div>
                    <div className="font-medium capitalize">{r} Dashboard</div>
                    <div className="text-xs text-muted-foreground">
                      {r === "client" ? "Manage your events" : r === "vendor" ? "Manage inventory & jobs" : "Full admin access"}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
