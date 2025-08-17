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
import { Plus, Edit, Trash2, Save, X, ExternalLink, ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { uploadPortfolioImage, uploadBulkPortfolioImages } from "@/utils/storageUtils";

interface EnhancedPortfolioManagerProps {
  portfolio: any[];
  events: any[];
}

const EnhancedPortfolioManager = ({ portfolio, events }: EnhancedPortfolioManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ 
      display_order: 0, 
      is_before_after: false, 
      is_before: false,
      tag: '',
      album_url: '',
      image_url: ''
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !formData.event_id) {
      toast({
        title: "Error",
        description: "Please select an event first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadPortfolioImage(file, formData.event_id);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      
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

  const handleBulkImageUpload = async (files: FileList) => {
    if (!files || files.length === 0 || !formData.event_id) {
      toast({
        title: "Error",
        description: "Please select an event and files first",
        variant: "destructive",
      });
      return;
    }

    setBulkUploading(true);
    try {
      const imageUrls = await uploadBulkPortfolioImages(files, formData.event_id);
      const albumUrl = imageUrls.join(','); // Store as comma-separated string
      setFormData(prev => ({ ...prev, album_url: albumUrl }));
      
      toast({
        title: "Success",
        description: `${files.length} images uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading bulk images:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setBulkUploading(false);
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked, formData:', formData);
    try {
      if (editingItem) {
        console.log('Updating existing item:', editingItem.id);
        // Update existing item
        const { error } = await supabase
          .from('portfolio')
          .update(formData)
          .eq('id', editingItem.id);
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Portfolio item updated successfully",
        });
      } else {
        console.log('Creating new item with data:', formData);
        // Create new item - ensure required fields are present
        if (!formData.title || !formData.event_id || !formData.image_url) {
          const missingFields = [];
          if (!formData.title) missingFields.push('Title');
          if (!formData.event_id) missingFields.push('Event');
          if (!formData.image_url) missingFields.push('Cover Image');
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        const portfolioData = {
          title: formData.title,
          image_url: formData.image_url,
          event_id: formData.event_id,
          album_url: formData.album_url || null,
          tag: formData.tag || null,
          display_order: formData.display_order || 0,
          is_before_after: formData.is_before_after || false,
          is_before: formData.is_before || false
        };
        
        console.log('Inserting portfolio data:', portfolioData);
        const { error } = await supabase
          .from('portfolio')
          .insert(portfolioData);
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Portfolio item created successfully",
        });
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      await queryClient.refetchQueries({ queryKey: ['portfolio'] });
      
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
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
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

  const getEventTitle = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Gallery Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage portfolio images with individual URLs or bulk album links
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />
          Add Gallery Item
        </Button>
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Portfolio Item" : "Create New Portfolio Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Portfolio item title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_id">Associated Event <span className="text-red-500">*</span></Label>
              <Select
                value={formData.event_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.event_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_upload">Cover Image Upload <span className="text-red-500">*</span></Label>
              <div className="space-y-3">
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
                  disabled={!formData.event_id || uploading}
                />
                {!formData.event_id && (
                  <p className="text-sm text-muted-foreground">Please select an event first to enable image upload</p>
                )}
                {formData.image_url && (
                  <div className="mt-3">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center space-x-1">
                  <ImageIcon className="h-3 w-3" />
                  <span>This image will be used as the cover/tile for this portfolio item</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk_upload">Bulk Image Upload</Label>
              <div className="space-y-3">
                <Input
                  id="bulk_upload"
                  type="file"
                  accept="image/*"
                  multiple
                  ref={bulkFileInputRef}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleBulkImageUpload(files);
                    }
                  }}
                  disabled={!formData.event_id || bulkUploading}
                />
                {!formData.event_id && (
                  <p className="text-sm text-muted-foreground">Please select an event first to enable bulk upload</p>
                )}
                {formData.album_url && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      {formData.album_url.split(',').length} images uploaded to gallery
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center space-x-1">
                  <Upload className="h-3 w-3" />
                  <span>Upload multiple images for the gallery. These will be displayed in the event lightbox.</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Tag/Category</Label>
              <Input
                value={formData.tag || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                placeholder="e.g., decoration, flowers, lighting, etc."
              />
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

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_before_after || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_before_after: checked }))}
              />
              <Label>Before/After Comparison</Label>
            </div>

            {formData.is_before_after && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_before || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_before: checked }))}
                />
                <Label>This is the "Before" image</Label>
              </div>
            )}
            
            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1" 
                disabled={uploading || bulkUploading || (!formData.image_url && !editingItem)}
              >
                <Save className="mr-2 h-4 w-4" />
                {uploading || bulkUploading ? "Uploading..." : "Save"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portfolio Items Grid */}
      <div className="grid gap-4">
        {portfolio && portfolio.length > 0 ? portfolio.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{item.title}</p>
                    {item.tag && (
                      <Badge variant="outline" className="text-xs">
                        {item.tag}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Event: {getEventTitle(item.event_id)}
                  </p>
                  
                  <div className="space-y-1">
                    {item.image_url && (
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>Individual image URL provided</span>
                      </p>
                    )}
                   {item.album_url && (
                     <div className="text-xs text-muted-foreground flex items-center space-x-1">
                       <Upload className="h-3 w-3" />
                       <span>Gallery images: {item.album_url.split(',').length} images uploaded</span>
                     </div>
                   )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {item.is_before_after && (
                      <Badge variant="secondary">
                        {item.is_before ? 'Before Image' : 'After Image'}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      Order: {item.display_order}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2">
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
            <p className="text-muted-foreground">No portfolio items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPortfolioManager;