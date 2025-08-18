import { useState } from "react";
import { useAllTestimonials } from "@/hooks/useTestimonials";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Star, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TestimonialFormData {
  client_name: string;
  testimonial: string;
  rating: number;
  company: string;
  position: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

const TestimonialManager = () => {
  const { data: testimonials, isLoading } = useAllTestimonials();
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>({
    client_name: "",
    testimonial: "",
    rating: 5,
    company: "",
    position: "",
    image_url: "",
    is_active: true,
    display_order: 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name || "",
      testimonial: testimonial.testimonial || "",
      rating: testimonial.rating || 5,
      company: testimonial.company || "",
      position: testimonial.position || "",
      image_url: testimonial.image_url || "",
      is_active: testimonial.is_active ?? true,
      display_order: testimonial.display_order || 0,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      client_name: "",
      testimonial: "",
      rating: 5,
      company: "",
      position: "",
      image_url: "",
      is_active: true,
      display_order: testimonials ? testimonials.length : 0,
    });
  };

  const handleSave = async () => {
    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from("client_testimonials")
          .update(formData)
          .eq("id", editingTestimonial.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("client_testimonials")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["all-testimonials"] });
      handleCancel();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (testimonial: any) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const { error } = await supabase
        .from("client_testimonials")
        .delete()
        .eq("id", testimonial.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["all-testimonials"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingTestimonial(null);
    setIsCreating(false);
    setFormData({
      client_name: "",
      testimonial: "",
      rating: 5,
      company: "",
      position: "",
      image_url: "",
      is_active: true,
      display_order: 0,
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Testimonials</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <Label htmlFor="testimonial">Testimonial</Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial}
                  onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                  placeholder="Enter testimonial text"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Client Image</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Create Testimonial
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials?.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <CardHeader className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {renderStars(testimonial.rating)}
                  <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                    {testimonial.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Testimonial</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit_client_name">Client Name</Label>
                          <Input
                            id="edit_client_name"
                            value={formData.client_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                            placeholder="Enter client name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit_testimonial">Testimonial</Label>
                          <Textarea
                            id="edit_testimonial"
                            value={formData.testimonial}
                            onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                            placeholder="Enter testimonial text"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_company">Company</Label>
                            <Input
                              id="edit_company"
                              value={formData.company}
                              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                              placeholder="Enter company name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_position">Position</Label>
                            <Input
                              id="edit_position"
                              value={formData.position}
                              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                              placeholder="Enter position"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_rating">Rating</Label>
                            <Input
                              id="edit_rating"
                              type="number"
                              min="1"
                              max="5"
                              value={formData.rating}
                              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_display_order">Display Order</Label>
                            <Input
                              id="edit_display_order"
                              type="number"
                              value={formData.display_order}
                              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit_image">Client Image</Label>
                          <div className="mt-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                              disabled={uploading}
                            />
                            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                            {formData.image_url && (
                              <img 
                                src={formData.image_url} 
                                alt="Preview" 
                                className="mt-2 h-20 w-20 object-cover rounded"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label htmlFor="edit_is_active">Active</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>
                            Update Testimonial
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(testimonial)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{testimonial.client_name}</CardTitle>
              {testimonial.position && testimonial.company && (
                <p className="text-sm text-muted-foreground">
                  {testimonial.position} at {testimonial.company}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3 mb-4">{testimonial.testimonial}</p>
              <div className="text-xs text-muted-foreground">
                Order: {testimonial.display_order}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!testimonials?.length && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No testimonials found. Add your first testimonial!</p>
        </div>
      )}
    </div>
  );
};

export default TestimonialManager;