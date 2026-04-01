import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, User, Building2, MapPin, FileText, BadgeCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import MapPinPicker from "@/components/ecommerce/MapPinPicker";

const VendorProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    bio: "",
    address: "",
    godown_address: "",
    city: "",
    gst_number: "",
    pan_number: "",
    warehouse_pincode: "",
    warehouse_lat: 0,
    warehouse_lng: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          company_name: data.company_name || "",
          bio: data.bio || "",
          address: (data as any).address || "",
          godown_address: (data as any).godown_address || "",
          city: (data as any).city || "",
          gst_number: (data as any).gst_number || "",
          pan_number: (data as any).pan_number || "",
          warehouse_pincode: (data as any).warehouse_pincode || "",
        });
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        bio: profile.bio,
        address: profile.address,
        godown_address: profile.godown_address,
        city: profile.city,
        gst_number: profile.gst_number,
        pan_number: profile.pan_number,
        warehouse_pincode: profile.warehouse_pincode,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verification progress
  const verificationChecks = [
    { label: "Full Name", done: !!profile.full_name },
    { label: "Phone Number", done: !!profile.phone },
    { label: "Company Name", done: !!profile.company_name },
    { label: "Business Address", done: !!profile.address },
    { label: "City", done: !!profile.city },
  ];
  const verifiedCount = verificationChecks.filter(c => c.done).length;
  const verifiedPercent = Math.round((verifiedCount / verificationChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Verification Progress */}
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-sm">Evnting Verified Progress</h3>
            <span className="ml-auto text-xs font-bold text-amber-700">{verifiedPercent}%</span>
          </div>
          <Progress value={verifiedPercent} className="h-2" />
          <div className="flex flex-wrap gap-2">
            {verificationChecks.map((check) => (
              <span key={check.label} className={`text-[10px] px-2 py-0.5 rounded-full ${check.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {check.done ? "✓" : "○"} {check.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Complete your profile + add a virtual tour + get 3 reviews to earn the <strong className="text-amber-700">Evnting Verified</strong> badge.</p>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                This will be shared with clients once assigned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Business / Company Name *</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                value={profile.gst_number}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value.toUpperCase() })}
                placeholder="e.g. 22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                value={profile.pan_number}
                onChange={(e) => setProfile({ ...profile, pan_number: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="e.g. Hyderabad"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Your office / business address"
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="godown_address">Godown / Warehouse Address</Label>
              <Textarea
              id="godown_address"
              value={profile.godown_address}
              onChange={(e) => setProfile({ ...profile, godown_address: e.target.value })}
              placeholder="Where your equipment / inventory is stored"
              className="min-h-[80px]"
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse_pincode">Warehouse / Godown PIN Code</Label>
              <Input
                id="warehouse_pincode"
                value={profile.warehouse_pincode}
                onChange={(e) => setProfile({ ...profile, warehouse_pincode: e.target.value })}
                placeholder="e.g. 500081"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Used for transport cost calculation to client delivery address.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About Your Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Description</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Describe your services, specialties, and experience..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
};

export default VendorProfileSettings;
