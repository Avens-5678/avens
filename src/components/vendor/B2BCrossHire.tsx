import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, HandshakeIcon, Loader2, CalendarIcon } from "lucide-react";

interface B2BRequest {
  id: string;
  requesting_vendor_id: string;
  item_name: string;
  quantity_needed: number;
  needed_date: string;
  needed_till_date: string | null;
  budget_per_unit: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface B2BOffer {
  id: string;
  request_id: string;
  offering_vendor_id: string;
  price_per_unit: number;
  quantity_available: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const B2BCrossHire = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newReq, setNewReq] = useState({
    item_name: "", quantity_needed: 1, needed_date: "", needed_till_date: "", budget_per_unit: "", notes: "",
  });
  const [offerData, setOfferData] = useState({ price: "", qty: 1, notes: "" });
  const [offeringForId, setOfferingForId] = useState<string | null>(null);

  const { data: allRequests = [] } = useQuery({
    queryKey: ["b2b-requests"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_hire_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as B2BRequest[];
    },
  });

  const { data: myOffers = [] } = useQuery({
    queryKey: ["b2b-my-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_hire_offers")
        .select("*")
        .eq("offering_vendor_id", user!.id);
      if (error) throw error;
      return data as B2BOffer[];
    },
  });

  const myRequests = allRequests.filter((r) => r.requesting_vendor_id === user?.id);
  const openRequests = allRequests.filter((r) => r.requesting_vendor_id !== user?.id && r.status === "open");
  const myOfferRequestIds = new Set(myOffers.map((o) => o.request_id));

  const createRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("b2b_hire_requests").insert({
        requesting_vendor_id: user!.id,
        item_name: newReq.item_name,
        quantity_needed: newReq.quantity_needed,
        needed_date: newReq.needed_date,
        needed_till_date: newReq.needed_till_date || null,
        budget_per_unit: newReq.budget_per_unit ? parseFloat(newReq.budget_per_unit) : null,
        notes: newReq.notes || null,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2b-requests"] });
      setShowNewRequest(false);
      setNewReq({ item_name: "", quantity_needed: 1, needed_date: "", needed_till_date: "", budget_per_unit: "", notes: "" });
      toast({ title: "Request posted to vendor network!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submitOffer = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("b2b_hire_offers").insert({
        request_id: offeringForId!,
        offering_vendor_id: user!.id,
        price_per_unit: parseFloat(offerData.price),
        quantity_available: offerData.qty,
        notes: offerData.notes || null,
        status: "offered",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["b2b-my-offers"] });
      setOfferingForId(null);
      setOfferData({ price: "", qty: 1, notes: "" });
      toast({ title: "Offer submitted!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HandshakeIcon className="h-5 w-5 text-primary" /> B2B Cross-Hire
          </h2>
          <p className="text-sm text-muted-foreground">Rent equipment from other verified vendors at wholesale rates</p>
        </div>
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Post Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Need Equipment?</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Item name (e.g. White Chiavari Chairs)" value={newReq.item_name} onChange={(e) => setNewReq(p => ({ ...p, item_name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Qty needed" value={newReq.quantity_needed} onChange={(e) => setNewReq(p => ({ ...p, quantity_needed: parseInt(e.target.value) || 1 }))} />
                <Input type="number" placeholder="Budget/unit (₹)" value={newReq.budget_per_unit} onChange={(e) => setNewReq(p => ({ ...p, budget_per_unit: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" placeholder="Needed from" value={newReq.needed_date} onChange={(e) => setNewReq(p => ({ ...p, needed_date: e.target.value }))} />
                <Input type="date" placeholder="Needed till" value={newReq.needed_till_date} onChange={(e) => setNewReq(p => ({ ...p, needed_till_date: e.target.value }))} />
              </div>
              <Textarea placeholder="Additional details" value={newReq.notes} onChange={(e) => setNewReq(p => ({ ...p, notes: e.target.value }))} rows={2} />
              <Button onClick={() => createRequest.mutate()} disabled={!newReq.item_name || !newReq.needed_date || createRequest.isPending} className="w-full">
                {createRequest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Post to Network
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="marketplace">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace ({openRequests.length})</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="marketplace" className="space-y-3 mt-4">
          {openRequests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No open requests from other vendors</CardContent></Card>
          ) : openRequests.map((req) => (
            <Card key={req.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{req.item_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{req.quantity_needed} units</Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <CalendarIcon className="h-2.5 w-2.5 mr-0.5" />
                        {new Date(req.needed_date).toLocaleDateString()}
                      </Badge>
                      {req.budget_per_unit && (
                        <Badge variant="secondary" className="text-[10px]">Budget: ₹{req.budget_per_unit}/unit</Badge>
                      )}
                    </div>
                    {req.notes && <p className="text-xs text-muted-foreground mt-1">{req.notes}</p>}
                  </div>
                  {myOfferRequestIds.has(req.id) ? (
                    <Badge className="text-[10px] bg-green-500/10 text-green-600">Offered</Badge>
                  ) : (
                    <Dialog open={offeringForId === req.id} onOpenChange={(o) => setOfferingForId(o ? req.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs">Make Offer</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Offer for: {req.item_name}</DialogTitle></DialogHeader>
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <Input type="number" placeholder="Price/unit (₹)" value={offerData.price} onChange={(e) => setOfferData(p => ({ ...p, price: e.target.value }))} />
                            <Input type="number" placeholder="Qty available" value={offerData.qty} onChange={(e) => setOfferData(p => ({ ...p, qty: parseInt(e.target.value) || 1 }))} />
                          </div>
                          <Textarea placeholder="Notes" value={offerData.notes} onChange={(e) => setOfferData(p => ({ ...p, notes: e.target.value }))} rows={2} />
                          <Button onClick={() => submitOffer.mutate()} disabled={!offerData.price || submitOffer.isPending} className="w-full">Submit Offer</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="my-requests" className="space-y-3 mt-4">
          {myRequests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">You haven't posted any requests yet</CardContent></Card>
          ) : myRequests.map((req) => (
            <Card key={req.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{req.item_name}</h3>
                    <p className="text-xs text-muted-foreground">{req.quantity_needed} units · {new Date(req.needed_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={req.status === "open" ? "default" : "secondary"} className="text-[10px]">{req.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default B2BCrossHire;
