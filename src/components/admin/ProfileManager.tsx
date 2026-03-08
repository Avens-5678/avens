import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCompanySettings, useUpdateCompanySettings } from "@/hooks/useCompanySettings";
import { User, Lock, Mail, Building2, Upload, Image } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

interface ProfileManagerProps {
  adminUser: any;
  onProfileUpdate: (user: any) => void;
}

const ProfileManager = ({ adminUser, onProfileUpdate }: ProfileManagerProps) => {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { toast } = useToast();

  const { data: companySettings, isLoading: companyLoading } = useCompanySettings();
  const updateCompany = useUpdateCompanySettings();

  // Company form state
  const [companyName, setCompanyName] = useState("");
  const [companyGst, setCompanyGst] = useState("");
  const [companyPan, setCompanyPan] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.company_name || "");
      setCompanyGst(companySettings.gst_number || "");
      setCompanyPan(companySettings.pan_number || "");
      setCompanyAddress(companySettings.address || "");
      setCompanyPhone(companySettings.phone || "");
      setCompanyEmail(companySettings.email || "");
      setGstEnabled(companySettings.gst_enabled);
      setLogoUrl(companySettings.logo_url || "");
    }
  }, [companySettings]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: adminUser.full_name || "",
      email: adminUser.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsProfileLoading(true);
    try {
      const updatedUser = { ...adminUser, full_name: values.full_name, email: values.email };
      onProfileUpdate(updatedUser);
      toast({ title: "Profile Updated", description: "Your profile information has been successfully updated." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminUser.email,
        password: values.current_password,
      });
      if (signInError) {
        toast({ title: "Incorrect Password", description: "The current password is incorrect.", variant: "destructive" });
        setIsPasswordLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: values.new_password });
      if (error) throw error;
      toast({ title: "Password Changed", description: "Your password has been successfully updated." });
      passwordForm.reset();
    } catch (error: any) {
      toast({ title: "Password Change Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `company-logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("general-uploads")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("general-uploads").getPublicUrl(path);
      setLogoUrl(publicUrl);
      toast({ title: "Logo Uploaded", description: "Save company settings to apply." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCompany = () => {
    updateCompany.mutate({
      company_name: companyName,
      gst_number: companyGst,
      pan_number: companyPan,
      address: companyAddress,
      phone: companyPhone,
      email: companyEmail,
      gst_enabled: gstEnabled,
      logo_url: logoUrl || null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Profile & Company Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your admin profile and company details for quotes & invoices</p>
      </div>

      {/* Company Details */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Building2 className="h-4 w-4" />
            <span>Company Details</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">These details appear on quotations, invoices and emails</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30">
              {logoUrl ? (
                <img src={logoUrl} alt="Company logo" className="h-full w-full object-contain" />
              ) : (
                <Image className="h-6 w-6 text-muted-foreground/50" />
              )}
            </div>
            <div>
              <Label htmlFor="logo-upload" className="text-sm font-medium">Company Logo</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="h-3 w-3 mr-1" />{uploading ? "Uploading..." : "Upload Logo"}
                  </label>
                </Button>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="h-9" />
            </div>
            <div>
              <Label className="text-sm">Company Email</Label>
              <Input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="company@email.com" className="h-9" />
            </div>
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+91 ..." className="h-9" />
            </div>
            <div>
              <Label className="text-sm">Address</Label>
              <Input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Full address" className="h-9" />
            </div>
          </div>

          {/* GST Fields always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">GSTIN</Label>
              <Input value={companyGst} onChange={e => setCompanyGst(e.target.value)} placeholder="e.g. 36AABCA1234B1Z5" className="h-9" />
            </div>
            <div>
              <Label className="text-sm">PAN Number</Label>
              <Input value={companyPan} onChange={e => setCompanyPan(e.target.value)} placeholder="e.g. AABCA1234B" className="h-9" />
            </div>
          </div>

          <Button onClick={handleSaveCompany} disabled={updateCompany.isPending || companyLoading} size="sm">
            {updateCompany.isPending ? "Saving..." : "Save Company Details"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <User className="h-4 w-4" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
                <FormField control={profileForm.control} name="full_name" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm">Full Name</FormLabel>
                    <FormControl><Input placeholder="Enter your full name" {...field} className="h-9" /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="email" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm">Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="Enter your email" {...field} className="h-9" /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isProfileLoading} size="sm">
                  {isProfileLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
                <FormField control={passwordForm.control} name="current_password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm">Current Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Enter current password" {...field} className="h-9" /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="new_password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm">New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Enter new password" {...field} className="h-9" /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirm_password" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm">Confirm New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Confirm new password" {...field} className="h-9" /></FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isPasswordLoading} variant="outline" size="sm">
                  {isPasswordLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{adminUser.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">{adminUser.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;
