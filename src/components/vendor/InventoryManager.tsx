import { useState, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  useVendorInventory,
  useDeleteInventoryItem,
  useToggleAvailability,
  useSaveVendorVariants,
  VendorInventoryItem,
} from "@/hooks/useVendorInventory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Plus, Edit, Trash2, Save, X, ImageIcon, Search, Filter, ShieldCheck, IndianRupee, CalendarDays } from "lucide-react";
import CSVUploader from "./CSVUploader";
import VenueFormFields from "./VenueFormFields";
import ItemAvailabilityCalendar from "./ItemAvailabilityCalendar";

const RENTAL_CATEGORIES = [
  "Event Structures & Venues",
  "Exhibition & Stalls",
  "Climate Control",
  "Event Production Equipment",
  "Branding & Décor",
  "General",
];

const VENUE_CATEGORIES = [
  "Banquet Halls",
  "Open Lawns",
  "Farmhouses",
  "Convention Centers",
  "Rooftop Venues",
  "Resort & Hotels",
];

const CREW_CATEGORIES = [
  "Photographers",
  "Videographers",
  "Event Managers",
  "Decorators",
  "DJs & Musicians",
  "Anchors & Emcees",
  "Catering Staff",
  "Security",
];

const SERVICE_TYPE_OPTIONS = [
  { value: "rental", label: "Insta-Rent (Equipment)" },
  { value: "venue", label: "Venue" },
  { value: "crew", label: "Crew / Manpower" },
];

const VENUE_AMENITY_OPTIONS = [
  "In-house Catering",
  "Without Catering",
  "In-house Decor",
  "AC Halls",
  "Parking Available",
  "DJ Allowed",
  "Valet Parking",
];

const CREW_EXPERIENCE_OPTIONS = [
  { label: "1–3 Years", value: "junior" },
  { label: "3–5 Years", value: "mid" },
  { label: "5–10 Years", value: "senior" },
  { label: "10+ Years", value: "expert" },
];

const getCategoriesForService = (serviceType: string) => {
  switch (serviceType) {
    case "venue": return VENUE_CATEGORIES;
    case "crew": return CREW_CATEGORIES;
    default: return RENTAL_CATEGORIES;
  }
};

const PRICING_UNITS = ["Per Hour", "Per Day", "Per Week", "Per Event", "Fixed Price", "Per Sq.Ft", "Per Sq.M"];

interface VariantRow {
  attribute_value: string;
  price_value: number | null;
  pricing_unit: string;
  stock_quantity: number;
  image_url: string | null;
}

const InventoryManager = () => {
  const { data: inventory, isLoading } = useVendorInventory();
  const { mutate: deleteItem } = useDeleteInventoryItem();
  const { mutate: toggleAvailability } = useToggleAvailability();
  const saveVariants = useSaveVendorVariants();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingItem, setEditingItem] = useState<VendorInventoryItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Variant state
  const [hasVariants, setHasVariants] = useState(false);
  const [attributeType, setAttributeType] = useState("Size");
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [newAttributeValue, setNewAttributeValue] = useState("");

  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" ||
        (item.categories && item.categories.includes(filterCategory));
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, filterCategory]);

  const handleCreate = () => {
    setIsCreating(true);
    setHasVariants(false);
    setVariantRows([]);
    setAttributeType("Size");
    setFormData({
      name: '', short_description: '', description: '', address: '',
      vendor_base_price: '', labor_weight: 1,
      price_value: '', pricing_unit: 'Per Day', price_per_day: 0,
      categories: [], search_keywords: '', display_order: 0,
      quantity: 1, is_available: true,
      image_url: '', image_urls: [],
      service_type: 'rental', amenities: [], guest_capacity: '', experience_level: '',
    });
  };

  const handleEdit = (item: VendorInventoryItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      categories: item.categories || [],
      image_urls: item.image_urls || [],
      price_value: item.price_value ?? '',
      vendor_base_price: (item as any).vendor_base_price ?? '',
      labor_weight: (item as any).labor_weight ?? 1,
      pricing_unit: item.pricing_unit || 'Per Day',
      service_type: item.service_type || 'rental',
      amenities: item.amenities || [],
      guest_capacity: item.guest_capacity || '',
      experience_level: item.experience_level || '',
    });
    setHasVariants(item.has_variants || false);
    if (item.has_variants) {
      loadVariants(item.id);
    } else {
      setVariantRows([]);
    }
  };

  const loadVariants = async (itemId: string) => {
    const { data } = await (supabase.from("vendor_inventory_variants" as any) as any)
      .select("*")
      .eq("inventory_item_id", itemId)
      .order("display_order");
    if (data) {
      setVariantRows(data.map((v: any) => ({
        attribute_value: v.attribute_value,
        price_value: v.price_value,
        pricing_unit: v.pricing_unit || "Per Day",
        stock_quantity: v.stock_quantity || 1,
        image_url: v.image_url,
      })));
      if (data.length > 0) setAttributeType(data[0].attribute_type || "Size");
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
    setHasVariants(false);
    setVariantRows([]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `vendor-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        return publicUrl;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, image_urls: [...(prev.image_urls || []), ...uploadedUrls] }));
      toast({ title: "Success", description: `${uploadedUrls.length} images uploaded` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVariantImageUpload = async (file: File, index: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `vendor-variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      setVariantRows(prev => prev.map((row, i) => i === index ? { ...row, image_url: publicUrl } : row));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, image_urls: (prev.image_urls || []).filter((_: string, i: number) => i !== index) }));
  };

  const addVariantRow = () => {
    if (!newAttributeValue.trim()) return;
    setVariantRows(prev => [...prev, {
      attribute_value: newAttributeValue.trim(),
      price_value: null,
      pricing_unit: "Per Day",
      stock_quantity: 1,
      image_url: null,
    }]);
    setNewAttributeValue("");
  };

  const removeVariantRow = (index: number) => {
    setVariantRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: keyof VariantRow, value: any) => {
    setVariantRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const addCategory = (category: string) => {
    if (!formData.categories?.includes(category)) {
      setFormData(prev => ({ ...prev, categories: [...(prev.categories || []), category] }));
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({ ...prev, categories: (prev.categories || []).filter((c: string) => c !== category) }));
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.description) {
        throw new Error("Please fill in all required fields (Name, Description)");
      }
      if (!user) throw new Error("Not authenticated");

      const vendorBasePrice = hasVariants ? null : (formData.vendor_base_price ? parseFloat(formData.vendor_base_price) : null);
      // Auto-calculate retail price from base price with 30% markup
      const calculatedRetail = vendorBasePrice != null ? Math.round(vendorBasePrice * 1.3) : null;
      const manualPrice = hasVariants ? null : (formData.price_value ? parseFloat(formData.price_value) : null);
      
      const itemData: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description || null,
        address: formData.address || null,
        vendor_base_price: vendorBasePrice,
        labor_weight: formData.labor_weight || 1,
        price_per_day: hasVariants ? null : (formData.price_per_day ? parseFloat(formData.price_per_day) : null),
        price_value: calculatedRetail || manualPrice,
        pricing_unit: hasVariants ? null : (formData.pricing_unit || 'Per Day'),
        has_variants: hasVariants,
        categories: formData.categories || [],
        search_keywords: formData.search_keywords || null,
        display_order: formData.display_order || 0,
        quantity: formData.quantity || 1,
        is_available: formData.is_available !== false,
        image_url: formData.image_url || null,
        image_urls: formData.image_urls || [],
      service_type: formData.service_type || 'rental',
      amenities: formData.service_type === 'venue' ? (formData.amenities || []) : [],
      guest_capacity: formData.service_type === 'venue' ? (formData.guest_capacity || null) : null,
      experience_level: formData.service_type === 'crew' ? (formData.experience_level || null) : null,
      // Venue-specific fields
      venue_type: formData.venue_type || null,
      min_capacity: formData.min_capacity || null,
      max_capacity: formData.max_capacity || null,
      num_halls: formData.num_halls || null,
      seating_types: formData.seating_types || [],
      pricing_packages: formData.pricing_packages || [],
      weekday_price: formData.weekday_price || null,
      weekend_price: formData.weekend_price || null,
      catering_type: formData.catering_type || null,
      parking_available: formData.parking_available || false,
      rooms_available: formData.rooms_available || 0,
      av_equipment: formData.av_equipment || false,
      cancellation_policy: formData.cancellation_policy || null,
      advance_amount: formData.advance_amount || null,
      refund_rules: formData.refund_rules || null,
      video_url: formData.video_url || null,
      slot_types: formData.slot_types || [],
    };

      let itemId: string;

      if (editingItem) {
        const { error } = await supabase.from('vendor_inventory').update(itemData).eq('id', editingItem.id);
        if (error) throw error;
        itemId = editingItem.id;
      } else {
        const { data, error } = await supabase.from('vendor_inventory').insert({ ...itemData, vendor_id: user.id } as any).select('id').single();
        if (error) throw error;
        itemId = data.id;
      }

      // Save variants
      if (hasVariants && variantRows.length > 0) {
        await saveVariants.mutateAsync({
          itemId,
          variants: variantRows.map(v => ({
            attribute_type: attributeType,
            attribute_value: v.attribute_value,
            price_value: v.price_value,
            pricing_unit: v.pricing_unit,
            stock_quantity: v.stock_quantity,
            image_url: v.image_url,
          })),
        });
      } else if (hasVariants === false && editingItem?.has_variants) {
        await saveVariants.mutateAsync({ itemId, variants: [] });
      }

      toast({ title: "Success", description: editingItem ? "Item updated" : "Item created" });
      await queryClient.invalidateQueries({ queryKey: ['vendor_inventory'] });
      handleCancel();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSV Upload Section */}
      <CSVUploader />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Inventory</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage items with variants, dynamic pricing, and images</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />Add Item
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {[...RENTAL_CATEGORIES, ...VENUE_CATEGORIES, ...CREW_CATEGORIES].filter((v, i, a) => a.indexOf(v) === i).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {(searchQuery || filterCategory !== "all") && (
          <p className="text-sm text-muted-foreground">Showing {filteredInventory.length} of {inventory?.length || 0} items</p>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>

            {/* Service Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">What are you listing?</Label>
              <div className="grid grid-cols-3 gap-3">
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, service_type: opt.value, categories: [] }))}
                    className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                      formData.service_type === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Step 1: Base Product */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Step 1: Item Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Item Name *</Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. LED Stage Light" />
                  </div>
                  <div className="space-y-1">
                    <Label>Short Description</Label>
                    <Input value={formData.short_description || ''} onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))} placeholder="Brief description" />
                  </div>
                  <div className="space-y-1">
                    <Label>Full Description *</Label>
                    <Textarea value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                  </div>
                  <div className="space-y-1">
                    <Label>Address / Location</Label>
                    <Input value={formData.address || ''} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="e.g. Warehouse 5, HITEC City, Hyderabad" />
                  </div>
                  <div className="space-y-1">
                    <Label>Categories</Label>
                    <Select onValueChange={addCategory}>
                      <SelectTrigger><SelectValue placeholder="Add category" /></SelectTrigger>
                      <SelectContent>{getCategoriesForService(formData.service_type || 'rental').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(formData.categories || []).map((c: string) => (
                        <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(c)}>{c} ×</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Product Images</Label>
                    <Input type="file" accept="image/*" multiple ref={multipleFileInputRef}
                      onChange={(e) => { if (e.target.files?.length) handleMultipleImageUpload(e.target.files); }}
                      disabled={uploading}
                    />
                    {formData.image_urls?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {formData.image_urls.map((url: string, i: number) => (
                          <div key={i} className="relative">
                            <img src={url} alt="" className="w-full h-16 object-cover rounded border" />
                            <Button onClick={() => removeImage(i)} variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full"><X className="h-3 w-3" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Single Thumbnail</Label>
                    <Input type="file" accept="image/*" ref={fileInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                      disabled={uploading}
                    />
                    {formData.image_url && (
                      <div className="relative inline-block mt-1">
                        <img src={formData.image_url} alt="" className="w-20 h-20 object-cover rounded border" />
                        <Button onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5 rounded-full"><X className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Display Order</Label><Input type="number" value={formData.display_order || 0} onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
                    <div className="space-y-1"><Label>Keywords</Label><Input value={formData.search_keywords || ''} onChange={(e) => setFormData(prev => ({ ...prev, search_keywords: e.target.value }))} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_available !== false} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_available: c }))} />
                    <Label>Available</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue-specific fields */}
            {formData.service_type === 'venue' && (
              <VenueFormFields formData={formData} setFormData={setFormData} />
            )}

            {/* Crew-specific fields */}
            {formData.service_type === 'crew' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Crew Details</h3>
                  <div className="space-y-1">
                    <Label>Experience Level</Label>
                    <Select value={formData.experience_level || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, experience_level: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                      <SelectContent>
                        {CREW_EXPERIENCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Availability Slots — for all service types */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Availability & Time Slots</h3>
              <p className="text-xs text-muted-foreground">Select when this item/service is available for booking</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "morning", label: "Morning (8AM – 2PM)" },
                  { value: "evening", label: "Evening (4PM – 11PM)" },
                  { value: "full_day", label: "Full Day" },
                ].map(slot => (
                  <Badge
                    key={slot.value}
                    variant={(formData.slot_types || []).includes(slot.value) ? "default" : "outline"}
                    className="cursor-pointer transition-all px-4 py-2 text-sm"
                    onClick={() => {
                      const current: string[] = formData.slot_types || [];
                      const updated = current.includes(slot.value)
                        ? current.filter((v: string) => v !== slot.value)
                        : [...current, slot.value];
                      setFormData(prev => ({ ...prev, slot_types: updated }));
                    }}
                  >
                    {slot.label}
                  </Badge>
                ))}
              </div>
              {(formData.slot_types || []).length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">⚠ No slots selected — item will default to Full Day availability</p>
              )}
            </div>

            <Separator />

            {/* Step 2: Variant Toggle */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Step 2: Pricing & Variants</h3>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
                <div>
                  <Label className="text-sm font-medium">Does this item have variations? (e.g. Size, Material)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable to add different sizes, materials, or options with individual pricing</p>
                </div>
              </div>

              {!hasVariants ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Your Base Price (per unit) *</Label>
                      <Input type="number" value={formData.vendor_base_price || ''} onChange={(e) => setFormData(prev => ({ ...prev, vendor_base_price: e.target.value }))} placeholder="e.g. 10" />
                      <p className="text-xs text-muted-foreground">This is your cost. Hidden from clients.</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Pricing Unit</Label>
                      <Select value={formData.pricing_unit || 'Per Day'} onValueChange={(v) => setFormData(prev => ({ ...prev, pricing_unit: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PRICING_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Stock Quantity</Label>
                      <Input type="number" min="1" value={formData.quantity || 1} onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
                    </div>
                  </div>
                  {formData.vendor_base_price && parseFloat(formData.vendor_base_price) > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="text-sm">Client will see: <span className="font-bold text-primary">₹{Math.round(parseFloat(formData.vendor_base_price) * 1.3).toLocaleString()}</span> / {formData.pricing_unit || 'Per Day'}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>Volume Units (for manpower calc)</Label>
                    <Input type="number" min="1" value={formData.labor_weight || 1} onChange={(e) => setFormData(prev => ({ ...prev, labor_weight: parseInt(e.target.value) || 1 }))} placeholder="1" />
                    <p className="text-xs text-muted-foreground">Weight/volume per unit: 1 chair = 1, 1 sofa = 10, 1 truss = 20</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Step 3: Define attribute type and values */}
                  <div className="flex items-end gap-3">
                    <div className="space-y-1 w-40">
                      <Label>Attribute Type</Label>
                      <Input value={attributeType} onChange={(e) => setAttributeType(e.target.value)} placeholder="e.g. Size" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label>Add Value</Label>
                      <div className="flex gap-2">
                        <Input value={newAttributeValue} onChange={(e) => setNewAttributeValue(e.target.value)} placeholder="e.g. 20m Width" onKeyDown={(e) => e.key === 'Enter' && addVariantRow()} />
                        <Button onClick={addVariantRow} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Variant rows table */}
                  {variantRows.length > 0 && (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <div className="grid grid-cols-[1fr_100px_120px_80px_80px_40px] gap-2 p-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                        <span>{attributeType}</span>
                        <span>Price</span>
                        <span>Unit</span>
                        <span>Stock</span>
                        <span>Image</span>
                        <span></span>
                      </div>
                      {variantRows.map((row, i) => (
                        <div key={i} className="grid grid-cols-[1fr_100px_120px_80px_80px_40px] gap-2 p-3 border-t border-border items-center">
                          <span className="text-sm font-medium">{row.attribute_value}</span>
                          <Input type="number" className="h-8 text-sm" value={row.price_value ?? ''} onChange={(e) => updateVariantRow(i, 'price_value', e.target.value ? parseFloat(e.target.value) : null)} placeholder="500" />
                          <Select value={row.pricing_unit} onValueChange={(v) => updateVariantRow(i, 'pricing_unit', v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{PRICING_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input type="number" className="h-8 text-sm" min="1" value={row.stock_quantity} onChange={(e) => updateVariantRow(i, 'stock_quantity', parseInt(e.target.value) || 1)} />
                          <div className="relative">
                            {row.image_url ? (
                              <img src={row.image_url} alt="" className="w-10 h-10 object-cover rounded border cursor-pointer" onClick={() => updateVariantRow(i, 'image_url', null)} />
                            ) : (
                              <label className="flex items-center justify-center w-10 h-10 rounded border border-dashed border-border cursor-pointer hover:bg-muted transition-colors">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleVariantImageUpload(e.target.files[0], i); }} />
                              </label>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVariantRow(i)}><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">💡 Variants without images will fallback to the base product images.</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1" disabled={uploading}>
                <Save className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Save"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1"><X className="mr-2 h-4 w-4" />Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Items Grid */}
        {!filteredInventory || filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterCategory !== "all" ? "No items match your filters." : "Add your rental equipment manually or upload a CSV."}
              </p>
              {!searchQuery && filterCategory === "all" && (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-medium text-lg">{item.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{item.service_type || 'rental'}</Badge>
                        {item.has_variants && <Badge variant="outline" className="text-xs">Has Variants</Badge>}
                        {(item as any).is_verified && (
                          <Badge className="bg-emerald-500 text-white">
                            <ShieldCheck className="h-3 w-3 mr-1" />Verified
                          </Badge>
                        )}
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        {item.description && <p className="text-muted-foreground line-clamp-2">{item.description}</p>}
                        <p><span className="font-medium">Price:</span> {item.price_value ? <span className="inline-flex items-center"><IndianRupee className="h-3 w-3" />{item.price_value} / {item.pricing_unit || 'Per Day'}</span> : item.price_per_day ? <span className="inline-flex items-center"><IndianRupee className="h-3 w-3" />{item.price_per_day}/day</span> : 'N/A'}</p>
                        <p><span className="font-medium">Qty:</span> {item.quantity}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {item.categories?.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked) => toggleAvailability({ id: item.id, is_available: checked })}
                      />
                      <Button onClick={() => handleEdit(item)} variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button onClick={() => handleDelete(item.id)} variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
