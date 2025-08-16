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

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "select" | "number" | "image";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
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
    setFormData(initialData);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from(tableName as any)
          .update(formData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Updated",
          description: `${title.slice(0, -1)} updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from(tableName as any)
          .insert(formData as any);
        
        if (error) throw error;
        
        toast({
          title: "Created",
          description: `${title.slice(0, -1)} created successfully.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: [tableName] });
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
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Deleted",
        description: `${title.slice(0, -1)} deleted successfully.`,
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

  const renderField = (field: Field) => {
    const value = formData[field.name] || '';
    
    const handleChange = (newValue: any) => {
      setFormData(prev => ({
        ...prev,
        [field.name]: newValue
      }));
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={handleChange}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={handleChange}>
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
            onChange={(e) => handleChange(Number(e.target.value))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'image':
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()} URL`}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
        <DialogContent className="max-w-2xl">
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

      <div className="grid gap-4">
        {data?.length > 0 ? (
          data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {item.title || item.name || item.email || `${title.slice(0, -1)} ${item.id?.slice(0, 8)}`}
                  </CardTitle>
                  <div className="flex space-x-2">
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
    </div>
  );
};

export default CrudInterface;