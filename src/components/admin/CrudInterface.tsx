import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { createEventPage, deleteEventPage } from "@/utils/eventPageUtils";
import { uploadEventHeroImage, uploadBannerImage, uploadClientLogo } from "@/utils/storageUtils";
import { EnhancedEventForm } from "./EnhancedEventForm";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "select" | "number" | "image" | "file";
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface CrudInterfaceProps {
  title: string;
  data: any[];
  tableName: "hero_banners" | "services" | "rentals" | "trusted_clients" | "events" | "portfolio";
  fields: Field[];
}

// Validation utility
const validateFormData = (data: Record<string, any>, fields: Field[], editingItem: any): string[] => {
  console.log('=== VALIDATION START ===', { data, fields: fields.map(f => ({ name: f.name, required: f.required })) });
  
  const missingFields: string[] = [];
  
  for (const field of fields) {
    const value = data[field.name];
    
    // Skip validation for non-required fields
    if (!field.required) continue;
    
    // Skip validation for file fields that already have a value when editing
    if ((field.type === 'file' || field.type === 'image') && editingItem && editingItem[field.name]) {
      continue;
    }
    
    // Check if field is missing or empty
    const isEmpty = value === undefined || 
                   value === null || 
                   value === '' ||
                   (typeof value === 'object' && (!value || Object.keys(value).length === 0));
    
    if (isEmpty) {
      console.log(`Field ${field.name} is missing or empty:`, value);
      missingFields.push(field.label);
    }
  }
  
  console.log('=== VALIDATION RESULT ===', { missingFields });
  return missingFields;
};

// Clean form data utility - removes corrupted data and ensures proper types
const cleanFormData = (data: Record<string, any>, fields: Field[]): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  for (const field of fields) {
    const value = data[field.name];
    
    // Handle corrupted data objects
    if (value && typeof value === 'object' && value._type !== undefined) {
      console.warn(`Corrupted data detected for field ${field.name}:`, value);
      // Reset to appropriate default value
      if (field.type === 'boolean') {
        cleaned[field.name] = false;
      } else if (field.type === 'number') {
        cleaned[field.name] = 0;
      } else {
        cleaned[field.name] = '';
      }
    } else {
      // Keep clean data
      cleaned[field.name] = value;
    }
  }
  
  return cleaned;
};

const CrudInterface = ({ title, data, tableName, fields }: CrudInterfaceProps) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [isEnhancedEventFormOpen, setIsEnhancedEventFormOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form data when editing or creating
  useEffect(() => {
    if (editingItem) {
      console.log('Setting form data for editing:', editingItem);
      const cleanedData = cleanFormData(editingItem, fields);
      setFormData(cleanedData);
    } else if (isCreating) {
      console.log('Initializing form data for creation');
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        if (field.type === 'boolean') {
          initialData[field.name] = true;
        } else if (field.type === 'number') {
          initialData[field.name] = 0;
        } else {
          initialData[field.name] = '';
        }
      });
      setFormData(initialData);
    }
  }, [editingItem, isCreating, fields]);

  const handleEdit = (item: any) => {
    if (tableName === 'events') {
      setFormData(item);
      setEditingItem(item);
      setIsEnhancedEventFormOpen(true);
      return;
    }
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    if (tableName === 'events') {
      setFormData({});
      setEditingItem(null);
      setIsEnhancedEventFormOpen(true);
      return;
    }
    setIsCreating(true);
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (eventFormData?: any) => {
    console.log('=== SAVE ATTEMPT START ===');
    
    try {
      let dataToSave: Record<string, any> = {};
      
      // Use event form data if provided, otherwise use component form data
      if (eventFormData) {
        console.log('Using event form data:', eventFormData);
        dataToSave = { ...eventFormData };
      } else {
        console.log('Using component form data:', formData);
        dataToSave = cleanFormData(formData, fields);
      }
      
      console.log('=== DATA TO SAVE ===', dataToSave);
      
      // Check for and handle any File objects that need to be uploaded
      const uploadPromises: Promise<void>[] = [];
      
      for (const [key, value] of Object.entries(dataToSave)) {
        if (value instanceof File) {
          console.log(`Found File object for field ${key}, uploading...`);
          const uploadPromise = (async () => {
            try {
              let imageUrl;
              if (key === 'hero_image_url' && tableName === 'events') {
                imageUrl = await uploadEventHeroImage(value, dataToSave.event_type || 'default');
              } else if (key === 'image_url' && tableName === 'hero_banners') {
                imageUrl = await uploadBannerImage(value);
              } else if (key === 'logo_url' && tableName === 'trusted_clients') {
                imageUrl = await uploadClientLogo(value);
              } else {
                // Handle other image uploads
                const fileExt = value.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                
                let bucket = 'portfolio-images'; // default
                if (tableName === 'services') {
                  bucket = 'specialty-images';
                }
                
                const { data, error } = await supabase.storage
                  .from(bucket)
                  .upload(fileName, value);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(data.path);

                imageUrl = publicUrl;
              }
              
              if (imageUrl) {
                dataToSave[key] = imageUrl;
                console.log(`File uploaded successfully for ${key}:`, imageUrl);
              }
            } catch (uploadError) {
              console.error(`Error uploading file for ${key}:`, uploadError);
              throw new Error(`Failed to upload ${key}: ${uploadError.message}`);
            }
          })();
          
          uploadPromises.push(uploadPromise);
        } else if (typeof value === 'string' && value.startsWith('C:\\fakepath\\')) {
          // Prevent saving with fake paths - this indicates a failed upload
          throw new Error(`Invalid file path detected for ${key}. Please re-upload the file.`);
        }
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        console.log(`Waiting for ${uploadPromises.length} file uploads to complete...`);
        await Promise.all(uploadPromises);
        console.log('All file uploads completed successfully');
      }
      
      // Validate required fields
      const missingFields = validateFormData(dataToSave, fields, editingItem);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `The following required fields are missing: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      // Perform save operation
      if (editingItem) {
        const { error } = await supabase
          .from(tableName as any)
          .update(dataToSave)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Updated",
          description: `${title.slice(0, -1)} updated successfully.`,
        });
      } else {
        const { data: newItem, error } = await supabase
          .from(tableName as any)
          .insert(dataToSave as any)
          .select()
          .single();
        
        if (error) throw error;
        
        // If this is an event, create the event page automatically
        if (tableName === 'events' && newItem) {
          try {
            await createEventPage(newItem);
            toast({
              title: "Created",
              description: `${title.slice(0, -1)} and event page created successfully.`,
            });
          } catch (pageError) {
            console.error('Error creating event page:', pageError);
            toast({
              title: "Partially Created",
              description: `${title.slice(0, -1)} created but event page creation failed.`,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Created",
            description: `${title.slice(0, -1)} created successfully.`,
          });
        }
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: [tableName] });
      await queryClient.refetchQueries({ queryKey: [tableName] });
      
      // If this is an event, also invalidate event types cache
      if (tableName === 'events') {
        await queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
        await queryClient.refetchQueries({ queryKey: ['eventTypes'] });
      }
      
      handleCancel();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      // If this is an event, delete the event page first
      if (tableName === 'events') {
        try {
          await deleteEventPage(item.id);
        } catch (pageError) {
          console.error('Error deleting event page:', pageError);
        }
      }

      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: [tableName] });
      await queryClient.refetchQueries({ queryKey: [tableName] });
      
      // If this is an event, also invalidate event types cache
      if (tableName === 'events') {
        await queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
        await queryClient.refetchQueries({ queryKey: ['eventTypes'] });
      }
      
      toast({
        title: "Deleted",
        description: `${title.slice(0, -1)} and associated pages deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    setFormData({});
    setIsEnhancedEventFormOpen(false);
    setIsDialogOpen(false);
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    console.log('Starting file upload:', { fileName: file.name, fieldName, tableName });
    if (!file) return;
    
    // Validate file type for image fields
    if (fieldName.includes('image') || fieldName.includes('logo')) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, GIF, or WebP).",
          variant: "destructive",
        });
        return;
      }
    }
    
    setUploading(true);
    try {
      let imageUrl;
      if (fieldName === 'hero_image_url' && tableName === 'events') {
        console.log('Uploading event hero image');
        imageUrl = await uploadEventHeroImage(file, formData.event_type || 'default');
      } else if (fieldName === 'image_url' && tableName === 'hero_banners') {
        console.log('Uploading banner image');
        imageUrl = await uploadBannerImage(file);
      } else if (fieldName === 'logo_url' && tableName === 'trusted_clients') {
        console.log('Uploading client logo');
        imageUrl = await uploadClientLogo(file);
      } else {
        // Handle other image uploads
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        let bucket = 'portfolio-images'; // default
        if (tableName === 'services') {
          bucket = 'specialty-images';
        }
        
        console.log('Uploading to bucket:', bucket, 'fileName:', fileName);
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (error) {
          console.error('Storage upload error:', error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        imageUrl = publicUrl;
        console.log('Upload successful, URL:', imageUrl);
      }
    
      // Update form data
      setFormData(prev => ({
        ...prev,
        [fieldName]: imageUrl
      }));
      
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Update form field value
  const updateFormField = (fieldName: string, value: any) => {
    console.log(`Updating field ${fieldName}:`, { oldValue: formData[fieldName], newValue: value });
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Remove image function
  const handleRemoveImage = (fieldName: string) => {
    updateFormField(fieldName, '');
    toast({
      title: "Image Removed",
      description: "Image has been removed. Don't forget to save changes.",
    });
  };

  const renderField = (field: Field) => {
    const value = formData[field.name] ?? (field.type === 'boolean' ? false : field.type === 'number' ? 0 : '');
    
    console.log(`Rendering field ${field.name}:`, { value, type: field.type });

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateFormField(field.name, checked)}
          />
        );
      
      case 'select':
        // Special handling for event_type field to allow custom input when creating new items
        if (field.name === 'event_type' && !editingItem) {
          return (
            <div className="space-y-2">
              <Select value={value} onValueChange={(val) => updateFormField(field.name, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or create event type" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={value}
                onChange={(e) => {
                  const inputValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
                  updateFormField(field.name, inputValue);
                }}
                placeholder="Or enter custom event type (e.g., national-state-functions)"
                className="text-sm"
              />
            </div>
          );
        }
        
        return (
          <Select value={value} onValueChange={(val) => updateFormField(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateFormField(field.name, Number(e.target.value))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'image':
      case 'file':
        const currentImageUrl = value && typeof value === 'string' && !value.startsWith('C:\\fakepath\\') ? value : '';
        const hasCurrentImage = currentImageUrl && currentImageUrl.length > 0;
        
        return (
          <div className="space-y-4">
            {/* Current Image Preview */}
            {hasCurrentImage && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Current Image:</div>
                <div className="relative inline-block">
                  <img 
                    src={currentImageUrl} 
                    alt="Current image" 
                    className="w-32 h-24 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => handleRemoveImage(field.name)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            
            {/* File Input */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                {hasCurrentImage ? "Replace Image:" : "Add Image:"}
              </div>
              <Input
                type="file"
                accept={field.type === 'image' ? 'image/*' : '*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Store the File object directly in formData for processing during save
                    updateFormField(field.name, file);
                  }
                }}
                disabled={uploading}
              />
              {value && value instanceof File && (
                <div className="text-sm text-muted-foreground">
                  <span>Selected: {value.name}</span>
                </div>
              )}
              {uploading && (
                <div className="text-sm text-muted-foreground">
                  Uploading...
                </div>
              )}
            </div>
          </div>
        );
      
      default: // text
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateFormField(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Event Form Dialog */}
      {isEnhancedEventFormOpen && (
        <EnhancedEventForm
          isOpen={isEnhancedEventFormOpen}
          onClose={handleCancel}
          onSave={handleSave}
          initialData={editingItem || formData}
          mode={editingItem ? 'edit' : 'create'}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Regular CRUD Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${title.slice(0, -1)}` : `Create New ${title.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={() => handleSave()} disabled={uploading}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {item.title || item.name || `${title.slice(0, -1)} ${item.id?.slice(0, 8)}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fields.slice(0, 3).map((field) => {
                const value = item[field.name];
                let displayValue = '';
                
                if (field.type === 'boolean') {
                  displayValue = value ? 'Yes' : 'No';
                } else if (field.type === 'image' || field.type === 'file') {
                  displayValue = value ? 'Uploaded' : 'No file';
                } else if (field.type === 'textarea') {
                  displayValue = value ? `${value.slice(0, 100)}...` : '';
                } else {
                  displayValue = value || '';
                }
                
                return (
                  <div key={field.name} className="text-sm">
                    <span className="font-medium">{field.label}:</span> {displayValue}
                  </div>
                );
              })}
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CrudInterface;
