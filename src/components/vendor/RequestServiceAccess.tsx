import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const ALL_SERVICES = [
  { key: "rental", label: "Equipment Rental", desc: "Stages, lighting, sound, furniture, structures" },
  { key: "venue", label: "Venue", desc: "Banquet, lawn, rooftop, hotel, resort" },
  { key: "crew", label: "Crew / Manpower", desc: "Photography, catering, decoration, DJ, security" },
  { key: "essentials", label: "Event Essentials", desc: "Shop products: balloons, return gifts, etc." },
];

interface Props {
  approved: string[];
  onChange: (services: string[]) => void;
}

const RequestServiceAccess = ({ approved, onChange }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Array<{ service: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase.from as any)("vendor_service_access")
      .select("service,status").eq("vendor_id", user.id);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const request = async (service: string) => {
    if (!user) return;
    // Upsert so re-requesting after a rejection or cancel resets the row
    const { error } = await (supabase.from as any)("vendor_service_access").upsert(
      { vendor_id: user.id, service, status: "pending", reviewed_at: null, reviewed_by: null },
      { onConflict: "vendor_id,service" }
    );
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Request sent", description: "Admin will review your request shortly." });
    await load();
  };

  const cancel = async (service: string) => {
    if (!user) return;
    const { error } = await (supabase.from as any)("vendor_service_access")
      .delete().eq("vendor_id", user.id).eq("service", service).eq("status", "pending");
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Request cancelled" });
    await load();
  };

  const statusOf = (key: string) => rows.find((r) => r.service === key)?.status;

  return (
    <div className="space-y-4 p-4 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold">Service Access</h2>
        <p className="text-sm text-muted-foreground">Request access to additional service categories. Admin must approve before tools appear.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ALL_SERVICES.map((s) => {
          const status = statusOf(s.key);
          return (
            <Card key={s.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {s.label}
                  {status === "approved" && <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>}
                  {status === "pending" && <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                  {status === "rejected" && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                {!status && (
                  <Button size="sm" onClick={() => request(s.key)} disabled={loading}>Request Access</Button>
                )}
                {status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => cancel(s.key)}>Cancel request</Button>
                  </div>
                )}
                {status === "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => request(s.key)}>Re-request</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RequestServiceAccess;
