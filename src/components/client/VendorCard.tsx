import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, User, Phone, Mail, Building } from "lucide-react";

interface VendorCardProps {
  vendorId: string;
}

const VendorCard = ({ vendorId }: VendorCardProps) => {
  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor_profile", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", vendorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <Card className="bg-green-500/5 border-green-500/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="bg-green-500/10 p-3 rounded-full">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{vendor.full_name || "Assigned Vendor"}</h4>
              <Badge variant="outline" className="text-green-600 border-green-500/30">
                Assigned
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {vendor.company_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{vendor.company_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${vendor.email}`} className="hover:text-foreground transition-colors">
                  {vendor.email}
                </a>
              </div>
              {vendor.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-foreground transition-colors">
                    {vendor.phone}
                  </a>
                </div>
              )}
            </div>

            {vendor.bio && (
              <p className="text-sm text-muted-foreground mt-2">{vendor.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
