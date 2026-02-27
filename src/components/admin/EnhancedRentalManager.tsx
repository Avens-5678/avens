import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, ImageIcon, Star, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cleanupRecordFiles } from "@/utils/storageUtils";
import { useSaveVariants } from "@/hooks/useRentalVariants";

interface EnhancedRentalManagerProps {
  rentals: any[];
}

const RENTAL_CATEGORIES = [
  "Event Structures & Venues",
  "Exhibition & Stalls",
  "Climate Control",
  "Event Production Equipment",
  "Branding & Décor"
];

const PRICING_UNITS = ["Per Hour", "Per Day", "Per Week", "Per Event", "Fixed Price", "Per Sq.Ft", "Per Sq.M"];

interface VariantRow {
  attribute_value: string;
  price_value: number | null;
  pricing_unit: string;
  stock_quantity: number;
  image_url: string | null;
}

const EnhancedRentalManager = ({ rentals }: EnhancedRentalManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveVariants = useSaveVariants();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // Variant state
  const [hasVariants, setHasVariants] = useState(false);
  const [attributeType, setAttributeType] = useState("Size");
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [newAttributeValue, setNewAttributeValue] = useState("");

  const filteredRentals = useMemo(() => {
    if (!rentals) return [];
    return rentals.filter((item) => {
      const matchesSearch = !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" ||
        (item.categories && item.categories.includes(filterCategory));
      const matchesStatus = filterStatus === "all" ||
        (filterStatus === "active" && item.is_active) ||
        (filterStatus === "inactive" && !item.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rentals, searchQuery, filterCategory, filterStatus]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...item,
      categories: item.categories || [],
      image_urls: item.image_urls || [],
      price_value: item.price_value ?? '',
      pricing_unit: item.pricing_unit || 'Per Day',
    });
    setHasVariants(item.has_variants || false);
    // Load variants if editing
    if (item.has_variants) {
      loadVariants(item.id);
    } else {
      setVariantRows([]);
    }
  };

  const loadVariants = async (rentalId: string) => {
    const { data } = await (supabase.from("rental_variants" as any) as any)
      .select("*")
      .eq("rental_id", rentalId)
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

  const handleCreate = () => {
    setIsCreating(true);
    setHasVariants(false);
    setVariantRows([]);
    setAttributeType("Size");
    setFormData({
      title: '', short_description: '', description: '', address: '',
      price_value: '', pricing_unit: 'Per Day', price_range: '',
      categories: [], search_keywords: '', display_order: 0,
      rating: 4.5, quantity: 1, is_active: true, show_on_home: true,
      image_url: '', image_urls: [],
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `rental-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Success", description: "Image uploaded successfully" });
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
        const fileName = `rental-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
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
      const fileName = `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
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

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.short_description || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      const rentalData: Record<string, any> = {
        title: formData.title,
        short_description: formData.short_description,
        description: formData.description,
        price_range: formData.price_range || null,
        price_value: hasVariants ? null : (formData.price_value ? parseFloat(formData.price_value) : null),
        pricing_unit: hasVariants ? null : (formData.pricing_unit || 'Per Day'),
        has_variants: hasVariants,
        categories: formData.categories || [],
        search_keywords: formData.search_keywords || null,
        display_order: formData.display_order || 0,
        rating: formData.rating || 4.5,
        quantity: formData.quantity || 1,
        is_active: formData.is_active !== false,
        show_on_home: formData.show_on_home !== false,
        image_url: formData.image_url || null,
        image_urls: formData.image_urls || [],
        address: formData.address || null,
      };

      let rentalId: string;

      if (editingItem) {
        const { error } = await supabase.from('rentals').update(rentalData).eq('id', editingItem.id);
        if (error) throw error;
        rentalId = editingItem.id;
      } else {
        const { data, error } = await supabase.from('rentals').insert(rentalData as any).select('id').single();
        if (error) throw error;
        rentalId = data.id;
      }

      // Save variants if enabled
      if (hasVariants && variantRows.length > 0) {
        await saveVariants.mutateAsync({
          rentalId,
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
        // Clear variants if toggled off
        await saveVariants.mutateAsync({ rentalId, variants: [] });
      }

      toast({ title: "Success", description: editingItem ? "Item updated" : "Item created" });
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['all-rentals'] });
      handleCancel();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rental item?')) return;
    try {
      const { data: rentalItem } = await supabase.from('rentals').select('*').eq('id', id).single();
      if (rentalItem?.image_url) {
        try { await cleanupRecordFiles(rentalItem, ['image_url']); } catch {}
      }
      const { error } = await supabase.from('rentals').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Item removed successfully" });
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['all-rentals'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
    setHasVariants(false);
    setVariantRows([]);
  };

  const addCategory = (category: string) => {
    if (!formData.categories.includes(category)) {
      setFormData(prev => ({ ...prev, categories: [...(prev.categories || []), category] }));
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({ ...prev, categories: (prev.categories || []).filter((c: string) => c !== category) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Rental Management</h2>
          <p className="text-muted-foreground mt-1">Manage rental items with variants, dynamic pricing, and images</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />Add Rental Item
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rentals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {RENTAL_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(searchQuery || filterCategory !== "all" || filterStatus !== "all") && (
        <p className="text-sm text-muted-foreground">Showing {filteredRentals.length} of {rentals?.length || 0} items</p>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Rental Item" : "Create New Rental Item"}</DialogTitle>
          </DialogHeader>

          {/* Step 1: Base Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Step 1: Base Product Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input value={formData.title || ''} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. German Tent" />
                </div>
                <div className="space-y-1">
                  <Label>Short Description *</Label>
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
                    <SelectContent>{RENTAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                  <Label>Base Product Images</Label>
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label>Rating</Label><Input type="number" min="0" max="5" step="0.1" value={formData.rating || 4.5} onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.5 }))} /></div>
                  <div className="space-y-1"><Label>Display Order</Label><Input type="number" value={formData.display_order || 0} onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))} /></div>
                  <div className="space-y-1"><Label>Keywords</Label><Input value={formData.search_keywords || ''} onChange={(e) => setFormData(prev => ({ ...prev, search_keywords: e.target.value }))} /></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><Switch checked={formData.is_active !== false} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))} /><Label>Active</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={formData.show_on_home !== false} onCheckedChange={(c) => setFormData(prev => ({ ...prev, show_on_home: c }))} /><Label>Home</Label></div>
                </div>
              </div>
            </div>
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
              /* Standard pricing fields */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Price Value</Label>
                  <Input type="number" value={formData.price_value || ''} onChange={(e) => setFormData(prev => ({ ...prev, price_value: e.target.value }))} placeholder="e.g. 500" />
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
            ) : (
              /* Variant Builder */
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

          {/* Legacy price_range field */}
          <div className="space-y-1">
            <Label>Price Range Text (legacy, optional)</Label>
            <Input value={formData.price_range || ''} onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))} placeholder="e.g. 500 - 2,000" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1" disabled={uploading}>
              <Save className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Save"}
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1"><X className="mr-2 h-4 w-4" />Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Items Grid */}
      <div className="grid gap-4">
        {filteredRentals.length > 0 ? filteredRentals.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    {item.has_variants && <Badge variant="outline" className="text-xs">Has Variants</Badge>}
                    {item.rating && <div className="flex items-center"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm ml-1">{item.rating}</span></div>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Short:</span> {item.short_description}</p>
                    <p><span className="font-medium">Price:</span> {item.price_value ? `₹${item.price_value} / ${item.pricing_unit || 'Per Day'}` : item.price_range || 'N/A'}</p>
                    <p><span className="font-medium">Qty:</span> {item.quantity}</p>
                    <p><span className="font-medium">Order:</span> {item.display_order}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.categories?.map((c: string) => <Badge key={c} variant="outline">{c}</Badge>)}
                    {item.is_active && <Badge variant="default">Active</Badge>}
                    {item.show_on_home && <Badge variant="secondary">Home Page</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button onClick={() => handleEdit(item)} variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button onClick={() => handleDelete(item.id)} variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{searchQuery || filterCategory !== "all" || filterStatus !== "all" ? "No items match your filters" : "No rental items found"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRentalManager;
