import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, MapPin, Trash2, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface ServiceCity {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  launch_date: string | null;
  min_vendor_count: number;
  current_vendor_count: number;
  delivery_base_fare: number;
  delivery_per_km: number;
  seo_title: string | null;
  seo_description: string | null;
  display_order: number;
  created_at: string;
}

const AdminCityManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", state: "", delivery_base_fare: "200", delivery_per_km: "15", min_vendor_count: "5", seo_title: "", seo_description: "" });

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["admin-service-cities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_cities").select("*").order("display_order");
      if (error) throw error;
      return data as ServiceCity[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("service_cities").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-service-cities"] }),
  });

  const addCity = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("service_cities").insert({
        name: form.name, state: form.state,
        delivery_base_fare: parseFloat(form.delivery_base_fare) || 200,
        delivery_per_km: parseFloat(form.delivery_per_km) || 15,
        min_vendor_count: parseInt(form.min_vendor_count) || 5,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        display_order: cities.length,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-cities"] });
      setDialogOpen(false);
      setForm({ name: "", state: "", delivery_base_fare: "200", delivery_per_km: "15", min_vendor_count: "5", seo_title: "", seo_description: "" });
      toast({ title: "City added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteCity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_cities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-service-cities"] }); toast({ title: "City removed" }); },
  });

  const activeCount = cities.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5" />Service Cities</h2>
          <p className="text-sm text-muted-foreground">{activeCount} active cities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add City</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Service City</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">City Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mumbai" /></div>
                <div className="space-y-1.5"><Label className="text-xs">State *</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Base Fare (₹)</Label><Input type="number" value={form.delivery_base_fare} onChange={(e) => setForm({ ...form, delivery_base_fare: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Per Km (₹)</Label><Input type="number" value={form.delivery_per_km} onChange={(e) => setForm({ ...form, delivery_per_km: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Min Vendors</Label><Input type="number" value={form.min_vendor_count} onChange={(e) => setForm({ ...form, min_vendor_count: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">SEO Title</Label><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="Event Rentals in Mumbai" /></div>
              <div className="space-y-1.5"><Label className="text-xs">SEO Description</Label><Input value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder="Book event equipment, venues..." /></div>
              <Button onClick={() => addCity.mutate()} disabled={!form.name || !form.state || addCity.isPending} className="w-full" size="sm">
                {addCity.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}Add City
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">City</TableHead>
                <TableHead className="text-xs w-[80px]">Vendors</TableHead>
                <TableHead className="text-xs w-[100px]">Delivery Rates</TableHead>
                <TableHead className="text-xs w-[80px]">Status</TableHead>
                <TableHead className="text-xs w-[60px]">Active</TableHead>
                <TableHead className="text-xs w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => {
                const meetsMinVendors = city.current_vendor_count >= city.min_vendor_count;
                return (
                  <TableRow key={city.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{city.name}</p>
                      <p className="text-[10px] text-muted-foreground">{city.state}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${meetsMinVendors ? "text-emerald-600" : "text-amber-600"}`}>{city.current_vendor_count}</span>
                      <span className="text-[10px] text-muted-foreground">/{city.min_vendor_count}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      ₹{city.delivery_base_fare} base + ₹{city.delivery_per_km}/km
                    </TableCell>
                    <TableCell>
                      {meetsMinVendors ? (
                        <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-700 gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" />Ready</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700 gap-0.5"><Clock className="h-2.5 w-2.5" />Need vendors</Badge>
                      )}
                    </TableCell>
                    <TableCell><Switch checked={city.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: city.id, is_active: v })} className="scale-75" /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-1.5 text-destructive" onClick={() => { if (confirm("Delete?")) deleteCity.mutate(city.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCityManager;
