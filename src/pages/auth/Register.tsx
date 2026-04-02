import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, ArrowLeft, Building2, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { motion, AnimatePresence } from "framer-motion";

const baseSchema = {
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone number is required (min 10 digits)"),
  role: z.enum(["client", "vendor"], {
    required_error: "Please select a role",
  }),
  // Client fields
  eventInterest: z.string().optional(),
  // Vendor fields
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  gstNumber: z.string().optional(),
  godownAddress: z.string().optional(),
};

const registerSchema = z.object(baseSchema).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "vendor") {
    return !!data.companyName && data.companyName.length >= 2;
  }
  return true;
}, {
  message: "Company name is required for vendors",
  path: ["companyName"],
}).refine((data) => {
  if (data.role === "vendor") {
    return !!data.address && data.address.length >= 5;
  }
  return true;
}, {
  message: "Address is required for vendors",
  path: ["address"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      companyName: "",
      address: "",
      city: "",
      gstNumber: "",
      godownAddress: "",
      eventInterest: "",
      role: undefined as any,
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (values: RegisterForm) => {
    setIsLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            email: values.email,
            full_name: values.fullName,
            phone: values.phone ? normalizePhoneNumber(values.phone) : null,
            company_name: values.companyName || null,
            address: values.address || null,
            city: values.city || null,
            gst_number: values.gstNumber || null,
            godown_address: values.godownAddress || null,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: values.role,
          });

        if (roleError) {
          console.error("Role assignment error:", roleError);
        }

        // Handle referral code from URL
        const refCode = localStorage.getItem("evnting_referral_code");
        if (refCode && authData.user) {
          try {
            const { data: refData } = await supabase.from("referral_codes").select("id, user_id").eq("code", refCode).eq("is_active", true).maybeSingle();
            if (refData && refData.user_id !== authData.user.id) {
              await supabase.from("referral_redemptions").insert({
                referral_code_id: refData.id, referrer_id: refData.user_id,
                referred_id: authData.user.id, status: "signed_up",
              } as any);
              // Award 100 points to new user
              await supabase.rpc("award_loyalty_points", {
                p_user_id: authData.user.id, p_points: 100, p_type: "referral_bonus",
                p_description: "Welcome bonus from referral",
              });
              localStorage.removeItem("evnting_referral_code");
            }
          } catch (refErr) { console.error("Referral processing error:", refErr); }
        }

        // Create loyalty account + referral code
        try {
          const { data: silverTier } = await supabase.from("loyalty_tiers").select("id").eq("name", "Silver").single();
          if (silverTier && authData.user) {
            await supabase.from("loyalty_accounts").insert({ user_id: authData.user.id, current_tier_id: silverTier.id } as any);
            const code = "EVNT-" + authData.user.id.slice(0, 6).toUpperCase();
            await supabase.from("referral_codes").insert({ user_id: authData.user.id, code } as any);
          }
        } catch {}
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link
              to="/auth"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <p className="text-muted-foreground">Join the Evnting Platform</p>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Role Selection - always visible first */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <label
                          htmlFor="client"
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            field.value === "client"
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value="client" id="client" className="sr-only" />
                          <User className={`h-8 w-8 ${field.value === "client" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-sm">Customer</span>
                          <span className="text-xs text-muted-foreground text-center">Request Events</span>
                        </label>
                        <label
                          htmlFor="vendor"
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            field.value === "vendor"
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                          <Building2 className={`h-8 w-8 ${field.value === "vendor" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-sm">Vendor</span>
                          <span className="text-xs text-muted-foreground text-center">Provide Services</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Step 2: Role-specific fields appear after selection */}
              <AnimatePresence mode="wait">
                {selectedRole && (
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Common fields */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
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
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 XXXXX XXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Client-specific fields */}
                    {selectedRole === "client" && (
                      <FormField
                        control={form.control}
                        name="eventInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What type of event are you planning? (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Wedding, Corporate Event, Exhibition" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Vendor-specific fields */}
                    {selectedRole === "vendor" && (
                      <>
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company / Business Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your business name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Address *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Full business address" className="min-h-[80px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Hyderabad" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gstNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GST Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="22AAAAA0000A1Z5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="godownAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Godown / Warehouse Address (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Warehouse or storage location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Password fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Min 8 characters" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Repeat password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

              <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-accent text-lg py-5"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <UserPlus className="mr-2 h-5 w-5" />
                      {selectedRole === "client" ? "Create Customer Account" : "Register as Vendor"}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: { redirectTo: `${window.location.origin}/auth` },
                        });
                        if (error) {
                          toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
                        }
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign up with Google
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
