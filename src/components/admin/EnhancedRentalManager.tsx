import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Upload, ImageIcon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cleanupRecordFiles } from "@/utils/storageUtils";

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

const EnhancedRentalManager = ({ rentals }: EnhancedRentalManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ 
      ...item, 
      categories: item.categories || [],
      image_urls: item.image_urls || []
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ 
      title: '',
      short_description: '',
      description: '',
      price_range: '',
      categories: [],
      search_keywords: '',
      display_order: 0,
      rating: 4.5,
      quantity: 1,
      is_active: true,
      show_on_home: true,
      image_url: '',
      image_urls: []
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `rental-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
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
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({ 
        ...prev, 
        image_urls: [...(prev.image_urls || []), ...uploadedUrls]
      }));
      
      toast({
        title: "Success",
        description: `${uploadedUrls.length} images uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: (prev.image_urls || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.short_description || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      const rentalData = {
        title: formData.title,
        short_description: formData.short_description,
        description: formData.description,
        price_range: formData.price_range || null,
        categories: formData.categories || [],
        search_keywords: formData.search_keywords || null,
        display_order: formData.display_order || 0,
        rating: formData.rating || 4.5,
        quantity: formData.quantity || 1,
        is_active: formData.is_active !== false,
        show_on_home: formData.show_on_home !== false,
        image_url: formData.image_url || null,
        image_urls: formData.image_urls || []
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('rentals')
          .update(rentalData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Rental item updated successfully",
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('rentals')
          .insert(rentalData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Rental item created successfully",
        });
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['all-rentals'] });
      
      // Reset form
      setEditingItem(null);
      setIsCreating(false);
      setFormData({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rental item? This will also delete the associated image from storage.')) return;
    
    try {
      // First, get the rental item to clean up its files
      const { data: rentalItem } = await supabase
        .from('rentals')
        .select('*')
        .eq('id', id)
        .single();

      if (rentalItem && rentalItem.image_url) {
        // Clean up storage files
        try {
          const results = await cleanupRecordFiles(rentalItem, ['image_url']);
          if (results.success.length > 0) {
            console.log(`Successfully deleted image for rental ${id}`);
          }
        } catch (error) {
          console.error(`Failed to delete image for rental ${id}:`, error);
          // Continue with database deletion even if file cleanup fails
        }
      }

      // Then delete the database record
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Rental item and associated files deleted successfully",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['rentals'] });
      await queryClient.invalidateQueries({ queryKey: ['all-rentals'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
  };

  const addCategory = (category: string) => {
    if (!formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...(prev.categories || []), category]
      }));
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter((c: string) => c !== category)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Rental Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage rental items with categories, images, and detailed specifications
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />
          Add Rental Item
        </Button>
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Rental Item" : "Create New Rental Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Rental item title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description <span className="text-red-500">*</span></Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  value={formData.price_range || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                  placeholder="e.g., AED 500 - 2,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search_keywords">Search Keywords</Label>
                <Input
                  value={formData.search_keywords || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, search_keywords: e.target.value }))}
                  placeholder="Keywords for search (space separated)"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_upload">Single Product Image</Label>
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    disabled={uploading}
                  />
                  {formData.image_url && (
                    <div className="relative inline-block">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <Button
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiple_images">Multiple Product Images</Label>
                  <Input
                    id="multiple_images"
                    type="file"
                    accept="image/*"
                    multiple
                    ref={multipleFileInputRef}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleMultipleImageUpload(files);
                      }
                    }}
                    disabled={uploading}
                  />
                  
                  {formData.image_urls && formData.image_urls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {formData.image_urls.map((url: string, index: number) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            onClick={() => removeImage(index)}
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="space-y-2">
                  <Select onValueChange={addCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add category" />
                    </SelectTrigger>
                    <SelectContent>
                      {RENTAL_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {(formData.categories || []).map((category: string) => (
                      <Badge key={category} variant="secondary" className="cursor-pointer"
                        onClick={() => removeCategory(category)}>
                        {category} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating || 4.5}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.5 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="Display order (0 = first)"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.show_on_home !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_on_home: checked }))}
                  />
                  <Label>Show on Home</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSave} 
              className="flex-1" 
              disabled={uploading}
            >
              <Save className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Save"}
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rental Items Grid */}
      <div className="grid gap-4">
        {rentals && rentals.length > 0 ? rentals.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    {item.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Short:</span> {item.short_description}</p>
                    <p><span className="font-medium">Price:</span> {item.price_range || 'N/A'}</p>
                    <p><span className="font-medium">Qty:</span> {item.quantity}</p>
                    <p><span className="font-medium">Order:</span> {item.display_order}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {item.categories && item.categories.map((category: string) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                    {item.is_active && <Badge variant="default">Active</Badge>}
                    {item.show_on_home && <Badge variant="secondary">Home Page</Badge>}
                  </div>

                  {item.image_url && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      <span>Image uploaded</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button 
                    onClick={() => handleEdit(item)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(item.id)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No rental items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRentalManager;