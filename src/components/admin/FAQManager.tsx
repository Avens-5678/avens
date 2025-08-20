import { useState } from "react";
import { useAllFAQ } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

const FAQ_CATEGORIES = [
  "General",
  "Services",
  "Pricing",
  "Events",
  "Rentals",
  "Booking",
  "Policies"
];

const FAQManager = () => {
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "General",
    display_order: 0,
    is_active: true,
  });

  const { data: faqs, isLoading } = useAllFAQ();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = (faq: any) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "General",
      display_order: faq.display_order || 0,
      is_active: faq.is_active ?? true,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      display_order: 0,
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSave = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        display_order: formData.display_order,
        is_active: formData.is_active,
      };

      if (editingFAQ) {
        // Update existing FAQ
        const { error } = await supabase
          .from("faq")
          .update(dataToSave)
          .eq("id", editingFAQ.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "FAQ updated successfully",
        });
      } else {
        // Create new FAQ
        const { error } = await supabase
          .from("faq")
          .insert(dataToSave);

        if (error) throw error;

        toast({
          title: "Success",
          description: "FAQ created successfully",
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["all-faq"] });
      queryClient.invalidateQueries({ queryKey: ["active-faq"] });
      handleCancel();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (faq: any) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const { error } = await supabase
        .from("faq")
        .delete()
        .eq("id", faq.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["all-faq"] });
      queryClient.invalidateQueries({ queryKey: ["active-faq"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingFAQ(null);
    setIsCreating(false);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      display_order: 0,
      is_active: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const groupedFAQs = faqs?.reduce((acc: any, faq: any) => {
    const category = faq.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">FAQ Management</h2>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add FAQ</span>
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingFAQ} onOpenChange={() => handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? "Edit FAQ" : "Create New FAQ"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter the frequently asked question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter the detailed answer"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingFAQ ? "Update FAQ" : "Create FAQ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ List by Category */}
      <div className="space-y-6">
        {Object.keys(groupedFAQs).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Get started by creating your first frequently asked question.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create FAQ
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedFAQs).map(([category, categoryFAQs]: [string, any]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>{category}</span>
                  </span>
                  <Badge variant="secondary">
                    {categoryFAQs.length} FAQs
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryFAQs.map((faq: any) => (
                    <div
                      key={faq.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-foreground">{faq.question}</h4>
                            <Badge variant={faq.is_active ? "default" : "secondary"}>
                              {faq.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {faq.answer}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Order: {faq.display_order}</span>
                            <span>•</span>
                            <span>Category: {faq.category || "General"}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(faq)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQManager;