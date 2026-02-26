import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  useVendorInventory, 
  useCreateInventoryItem, 
  useUpdateInventoryItem, 
  useDeleteInventoryItem,
  useToggleAvailability,
  VendorInventoryItem 
} from "@/hooks/useVendorInventory";
import { Loader2, Package, Plus, Pencil, Trash2, IndianRupee, ShieldCheck } from "lucide-react";
import CSVUploader from "./CSVUploader";
import AvailabilityCalendar from "./AvailabilityCalendar";

const InventoryManager = () => {
  const { data: inventory, isLoading } = useVendorInventory();
  const { mutate: createItem, isPending: isCreating } = useCreateInventoryItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventoryItem();
  const { mutate: deleteItem } = useDeleteInventoryItem();
  const { mutate: toggleAvailability } = useToggleAvailability();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorInventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    price_per_day: 0,
    image_url: "",
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", quantity: 1, price_per_day: 0, image_url: "" });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem({ id: editingItem.id, ...formData }, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); },
      });
    } else {
      createItem(formData, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); },
      });
    }
  };

  const handleEdit = (item: VendorInventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      price_per_day: item.price_per_day || 0,
      image_url: item.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
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

      {/* Availability Calendar */}
      <AvailabilityCalendar />

      {/* Manual Inventory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Inventory</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., LED Stage Light"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Day (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!inventory || inventory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
              <p className="text-muted-foreground mb-4">
                Add your rental equipment manually or upload a CSV.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventory.map((item) => (
              <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                {item.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex gap-1">
                      {(item as any).is_verified && (
                        <Badge className="bg-emerald-500 text-white shrink-0">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Qty: {item.quantity}</span>
                    {item.price_per_day && (
                      <span className="flex items-center font-medium">
                        <IndianRupee className="h-3 w-3" />
                        {item.price_per_day}/day
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked) =>
                          toggleAvailability({ id: item.id, is_available: checked })
                        }
                      />
                      <span className="text-xs text-muted-foreground">Available</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
