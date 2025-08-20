import { useState } from "react";
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

const CrudInterface = ({ title, data, tableName, fields }: CrudInterfaceProps) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [isEnhancedEventFormOpen, setIsEnhancedEventFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (item: any) => {
    if (tableName === 'events') {
      setFormData(item);
      setEditingItem(item);
      setIsEnhancedEventFormOpen(true);
      return;
    }
    setEditingItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
    if (tableName === 'events') {
      setIsEnhancedEventFormOpen(true);
      return;
    }
    setIsCreating(true);
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
    console.log('Creating new item:', { tableName, fields: fields.map(f => f.name), initialData });
    setFormData(initialData);
  };

  const handleSave = async (eventFormData?: any) => {
    try {
      console.log('=== SAVE ATTEMPT START ===');
      
      // COMPLETELY BYPASS STATE - Read directly from form every time
      const dialogElement = document.querySelector('[role="dialog"]');
      const formData: Record<string, any> = {};
      
      if (dialogElement) {
        console.log('Reading form data directly from DOM...');
        
        // Read all form inputs directly
        fields.forEach(field => {
          console.log(`Reading field: ${field.name}`);
          
          if (field.type === 'boolean') {
            const switchInput = dialogElement.querySelector(`[role="switch"][data-state]`);
            if (switchInput) {
              formData[field.name] = switchInput.getAttribute('data-state') === 'checked';
              console.log(`Boolean field ${field.name}:`, formData[field.name]);
            } else {
              formData[field.name] = true; // default
            }
          } else if (field.type === 'select') {
            const selectTrigger = dialogElement.querySelector(`[role="combobox"]`);
            if (selectTrigger) {
              const selectedValue = selectTrigger.getAttribute('data-value') || selectTrigger.textContent?.trim();
              formData[field.name] = selectedValue || '';
              console.log(`Select field ${field.name}:`, formData[field.name]);
            } else {
              formData[field.name] = '';
            }
          } else if (field.type === 'number') {
            const numberInputs = dialogElement.querySelectorAll('input[type="number"]');
            // For now, assume display_order is the number field
            if (field.name === 'display_order' && numberInputs.length > 0) {
              formData[field.name] = Number((numberInputs[0] as HTMLInputElement).value) || 0;
              console.log(`Number field ${field.name}:`, formData[field.name]);
            } else {
              formData[field.name] = 0;
            }
          } else {
            // Text, textarea, file fields
            const textInputs = dialogElement.querySelectorAll('input[type="text"], input[type="url"], textarea');
            const fileInputs = dialogElement.querySelectorAll('input[type="file"]');
            
            // Try to match by placeholder or order
            let fieldValue = '';
            
            if (field.type === 'file') {
              // For file fields, check if we have an uploaded URL in the current component state
              if (formData && formData[field.name]) {
                fieldValue = formData[field.name];
              }
            } else {
              // For text fields, try to find by placeholder
              for (let input of textInputs) {
                const placeholder = (input as HTMLInputElement).placeholder.toLowerCase();
                if (placeholder.includes(field.label.toLowerCase()) || 
                    placeholder.includes(field.name.toLowerCase())) {
                  fieldValue = (input as HTMLInputElement).value;
                  break;
                }
              }
            }
            
            formData[field.name] = fieldValue;
            console.log(`Text field ${field.name}:`, fieldValue);
          }
        });
      }
      
      console.log('=== FORM DATA FROM DOM ===', formData);
      
      // Use the DOM-read data as our clean data
      const cleanData = { ...formData };
      
      console.log('=== FINAL CLEAN DATA ===', cleanData);
      
      // For events, also copy additional fields that might not be in the fields config
      if (tableName === 'events' && eventFormData) {
        const eventFields = ['id', 'created_at', 'updated_at', 'url_slug', 'meta_description', 'hero_cta_text', 'hero_subtitle', 'what_we_do_title', 'services_section_title', 'default_portfolio_tags'];
        for (const field of eventFields) {
          if (eventFormData.hasOwnProperty(field) && cleanData[field] === undefined) {
            const value = eventFormData[field];
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || Array.isArray(value)) {
              cleanData[field] = value;
            }
          }
        }
      }
      
      // Validate required fields (excluding file fields that might be uploaded separately)
      const missingFields = fields
        .filter(field => {
          // Skip validation for file fields that already have a value or are being uploaded
          if (field.type === 'file' || field.type === 'image') {
            // If editing and field already has a value, don't require it
            if (editingItem && cleanData[field.name]) {
              return false;
            }
            // If creating and field is required but empty, it's missing
            return field.required && (!cleanData[field.name] || cleanData[field.name] === '');
          }
          // Check if required field is missing or empty (but allow 0 values for numbers)
          return field.required && (
            cleanData[field.name] === undefined || 
            cleanData[field.name] === null || 
            cleanData[field.name] === '' ||
            (field.type === 'select' && cleanData[field.name] === '')
          );
        })
        .map(field => field.label);
      
      console.log('Validation check:', { cleanData, missingFields, fields: fields.map(f => ({ name: f.name, required: f.required, value: cleanData[f.name] })) });
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `The following required fields are missing: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      // Ensure event_type is not empty for events table
      if (tableName === 'events' && (!cleanData.event_type || cleanData.event_type === '')) {
        toast({
          title: "Validation Error",
          description: "Event type is required. Please select or enter an event type.",
          variant: "destructive",
        });
        return;
      }
      if (editingItem) {
        const { error } = await supabase
          .from(tableName as any)
          .update(cleanData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Updated",
          description: `${title.slice(0, -1)} updated successfully.`,
        });
      } else {
        const { data: newItem, error } = await supabase
          .from(tableName as any)
          .insert(cleanData as any)
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
      
      // Force refresh data by invalidating and refetching
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
        description: "Failed to save. Please try again.",
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
      
      // Force refresh data by invalidating and refetching
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
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    console.log('Starting file upload:', { fileName: file.name, fieldName, tableName });
    if (!file) return;
    
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
          // Handle other image uploads - determine appropriate bucket
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

  const renderField = (field: Field) => {
    const value = formData[field.name] || '';
    
    console.log(`Rendering field ${field.name}:`, { value, type: field.type, formData: formData[field.name] });
    
    const handleChange = (newValue: any) => {
      console.log(`Field ${field.name} changed:`, { oldValue: formData[field.name], newValue });
      setFormData(prev => ({
        ...prev,
        [field.name]: newValue
      }));
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            name={field.name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            name={field.name}
            checked={value}
            onCheckedChange={handleChange}
          />
        );
      
      case 'select':
        // Special handling for event_type field to allow custom input when creating new events
        if (field.name === 'event_type' && !editingItem) {
          return (
            <div className="space-y-2">
              <Select name={field.name} value={value} onValueChange={handleChange}>
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
                name={`${field.name}_custom`}
                value={value}
                onChange={(e) => {
                  const inputValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
                  handleChange(inputValue);
                }}
                placeholder="Or enter custom event type (e.g., national-state-functions)"
                className="text-sm"
              />
            </div>
          );
        }
        
        return (
          <Select name={field.name} value={value} onValueChange={handleChange}>
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
            name={field.name}
            type="number"
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'image':
        return (
          <Input
            name={field.name}
            type="url"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()} URL`}
          />
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              name={field.name}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, field.name);
                }
              }}
              disabled={uploading}
            />
            {value && (
              <div className="text-sm text-muted-foreground">
                Current: <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Image</a>
              </div>
            )}
            {uploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
          </div>
        );
      
      default:
        return (
          <Input
            name={field.name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? `Edit ${title.slice(0, -1)}` : `Create New ${title.slice(0, -1)}`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {fields.map(field => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.map(field => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data?.length > 0 ? (
          data.map((item) => (
            <Card key={item.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="text-base md:text-lg break-words">
                    {item.title || item.name || item.email || `${title.slice(0, -1)} ${item.id?.slice(0, 8)}`}
                  </CardTitle>
                  <div className="flex space-x-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  {fields.slice(0, 3).map(field => (
                    <div key={field.name}>
                      <span className="font-medium">{field.label}: </span>
                      <span className="text-muted-foreground">
                        {field.type === 'boolean' 
                          ? (item[field.name] ? 'Yes' : 'No')
                          : (item[field.name] || 'N/A')
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No items found. Create your first {title.toLowerCase().slice(0, -1)} above.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Event Form */}
      <EnhancedEventForm
        isOpen={isEnhancedEventFormOpen}
        onClose={() => {
          setIsEnhancedEventFormOpen(false);
          setFormData({});
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem || {}}
        mode={editingItem ? 'edit' : 'create'}
      />
    </div>
  );
};

export default CrudInterface;