import { useState } from "react";
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
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AdminDataTableProps {
  title: string;
  data: any[] | undefined;
  queryKey: string;
  tableName: "hero_banners" | "services" | "rentals" | "trusted_clients" | "news_achievements" | "events" | "portfolio" | "awards" | "about_content";
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'boolean' | 'select' | 'image' | 'number';
    required?: boolean;
    options?: string[];
  }[];
  defaultValues?: Record<string, any>;
}

const AdminDataTable = ({ title, data, queryKey, tableName, fields, defaultValues = {} }: AdminDataTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ ...defaultValues });
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${title.slice(0, -1)} updated successfully`,
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from(tableName)
          .insert(formData as any);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${title.slice(0, -1)} created successfully`,
        });
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      
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
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${title.slice(0, -1)} deleted successfully`,
      });
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
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

  const renderField = (field: any) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.label}
            className="min-h-[100px]"
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [field.name]: checked }))}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => setFormData(prev => ({ ...prev, [field.name]: newValue }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
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
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: parseInt(e.target.value) || 0 }))}
            placeholder={field.label}
          />
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
              placeholder="Enter image URL, Google Drive link, or upload link"
            />
            <p className="text-xs text-muted-foreground">
              You can paste Google Drive links, direct image URLs, or any image hosting service link
            </p>
          </div>
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            placeholder={field.label}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title} Management</h2>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Create/Edit Form Modal */}
      <Dialog open={isCreating || !!editingItem} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${title.slice(0, -1)}` : `Create New ${title.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Table */}
      <div className="grid gap-4">
        {data?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="font-medium">{item.title || item.name || 'Item'}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description || item.short_description || 'No description'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {item.is_active !== undefined && (
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                    {item.event_type && (
                      <Badge variant="outline">
                        {item.event_type}
                      </Badge>
                    )}
                    {item.price_range && (
                      <Badge variant="secondary">
                        {item.price_range}
                      </Badge>
                    )}
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
        )) || (
          <p className="text-center text-muted-foreground py-8">No items found</p>
        )}
      </div>
    </div>
  );
};

export default AdminDataTable;