import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";
import type { QuoteLineItem } from "@/hooks/useQuotes";

interface QuotePicklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItems: (items: Omit<QuoteLineItem, "id" | "quote_id">[]) => void;
}

const QuotePicklistDialog = ({ open, onOpenChange, onAddItems }: QuotePicklistDialogProps) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: rentals } = useQuery({
    queryKey: ["rentals-picklist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rentals").select("id, title, short_description, price_value, pricing_unit").eq("is_active", true).order("title");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: services } = useQuery({
    queryKey: ["services-picklist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("id, title, short_description").eq("is_active", true).order("title");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const filteredRentals = (rentals || []).filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  const filteredServices = (services || []).filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const handleAddSelected = () => {
    const items: Omit<QuoteLineItem, "id" | "quote_id">[] = [];
    
    filteredRentals.filter(r => selected.has(`rental-${r.id}`)).forEach(r => {
      items.push({
        item_description: r.title,
        quantity: 1,
        unit: r.pricing_unit || "Nos",
        unit_price: r.price_value || 0,
        total_price: r.price_value || 0,
      });
    });

    filteredServices.filter(s => selected.has(`service-${s.id}`)).forEach(s => {
      items.push({
        item_description: s.title,
        quantity: 1,
        unit: "Event",
        unit_price: 0,
        total_price: 0,
      });
    });

    if (items.length > 0) {
      onAddItems(items);
      setSelected(new Set());
      onOpenChange(false);
    }
  };

  const toggleItem = (key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const addSingle = (item: Omit<QuoteLineItem, "id" | "quote_id">) => {
    onAddItems([item]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pick from Catalog</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Tabs defaultValue="rentals" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rentals">Rentals ({filteredRentals.length})</TabsTrigger>
            <TabsTrigger value="services">Services ({filteredServices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="rentals" className="max-h-[40vh] overflow-y-auto space-y-2 mt-2">
            {filteredRentals.map(r => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(`rental-${r.id}`) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`} onClick={() => toggleItem(`rental-${r.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.short_description}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {r.price_value ? <Badge variant="secondary">₹{r.price_value.toLocaleString()}</Badge> : <Badge variant="outline">Quote</Badge>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); addSingle({ item_description: r.title, quantity: 1, unit: r.pricing_unit || "Nos", unit_price: r.price_value || 0, total_price: r.price_value || 0 }); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredRentals.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No rentals found</p>}
          </TabsContent>

          <TabsContent value="services" className="max-h-[40vh] overflow-y-auto space-y-2 mt-2">
            {filteredServices.map(s => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(`service-${s.id}`) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`} onClick={() => toggleItem(`service-${s.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.short_description}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); addSingle({ item_description: s.title, quantity: 1, unit: "Event", unit_price: 0, total_price: 0 }); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {filteredServices.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No services found</p>}
          </TabsContent>
        </Tabs>

        {selected.size > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">{selected.size} item(s) selected</span>
            <Button onClick={handleAddSelected}>Add Selected Items</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuotePicklistDialog;
