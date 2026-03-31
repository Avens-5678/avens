import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, Mail, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const SiteVisitManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ["site_visits_vendor", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_visit_requests" as any)
        .select("*, vendor_inventory!inner(name, vendor_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateVisit = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from("site_visit_requests" as any) as any)
        .update({ visit_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_visits_vendor"] });
      toast({ title: "Visit Updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No Site Visit Requests</h3>
        <p className="text-xs text-muted-foreground mt-1">When clients schedule visits to your venues, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Site Visit Requests</h2>
      <div className="grid gap-3">
        {visits.map((visit: any) => (
          <Card key={visit.id} className="border border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{visit.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Venue: {(visit as any).vendor_inventory?.name || "Unknown"}
                  </p>
                </div>
                <Badge className={`text-[10px] ${STATUS_COLORS[visit.visit_status] || "bg-muted text-muted-foreground"}`}>
                  {visit.visit_status?.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {visit.preferred_date ? format(new Date(visit.preferred_date), "dd MMM yyyy") : "—"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {visit.preferred_slot?.replace("_", " ") || "Morning"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {visit.client_phone}
                </div>
                {visit.client_email && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {visit.client_email}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Deposit:</span>
                <span className="font-semibold text-foreground">₹{visit.deposit_amount}</span>
                <Badge variant="outline" className="text-[10px]">{visit.deposit_status}</Badge>
              </div>

              {visit.visit_status === "scheduled" && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => updateVisit.mutate({ id: visit.id, status: "completed" })}
                    disabled={updateVisit.isPending}
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1 text-destructive"
                    onClick={() => updateVisit.mutate({ id: visit.id, status: "no_show" })}
                    disabled={updateVisit.isPending}
                  >
                    <XCircle className="h-3 w-3" /> No Show
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteVisitManager;
