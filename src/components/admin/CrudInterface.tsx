import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

interface CrudItem {
  id: string;
  [key: string]: any;
}

interface CrudInterfaceProps {
  title: string;
  data: CrudItem[] | undefined;
}

const CrudInterface = ({ title, data }: CrudInterfaceProps) => {
  const { toast } = useToast();

  const handleEdit = (item: CrudItem) => {
    toast({
      title: "Feature Coming Soon",
      description: `Edit functionality for ${title} will be available soon.`,
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Feature Coming Soon", 
      description: `Delete functionality for ${title} will be available soon.`,
    });
  };

  const handleAdd = () => {
    toast({
      title: "Feature Coming Soon",
      description: `Add new ${title} functionality will be available soon.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title} Management</h2>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="grid gap-4">
        {data?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="font-medium">{item.title || item.name || 'Item'}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description || item.short_description || 'No description'}
                  </p>
                  {item.is_active !== undefined && (
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
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

export default CrudInterface;