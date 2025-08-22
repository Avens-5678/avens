import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAboutContent } from "@/hooks/useData";

const AboutContentManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: aboutContent, isLoading } = useAboutContent();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data when aboutContent loads
  useState(() => {
    if (aboutContent && !isEditing) {
      setFormData(aboutContent);
    }
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `founder-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, founder_image_url: publicUrl }));
      
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

  const handleSave = async () => {
    try {
      if (!formData.founder_name || !formData.mission_statement || !formData.vision_statement || !formData.full_about_text) {
        throw new Error("Please fill in all required fields");
      }

      const aboutData = {
        founder_name: formData.founder_name,
        founder_note: formData.founder_note || '',
        founder_quote: formData.founder_quote || '',
        founder_image_url: formData.founder_image_url || null,
        mission_statement: formData.mission_statement,
        vision_statement: formData.vision_statement,
        full_about_text: formData.full_about_text,
      };

      if (aboutContent) {
        // Update existing content
        const { error } = await supabase
          .from('about_content')
          .update(aboutData)
          .eq('id', aboutContent.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "About content updated successfully",
        });
      } else {
        // Create new content
        const { error } = await supabase
          .from('about_content')
          .insert(aboutData);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "About content created successfully",
        });
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['about-content'] });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (aboutContent) {
      setFormData(aboutContent);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (aboutContent) {
      setFormData(aboutContent);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, founder_image_url: null }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">About Content Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage the about page content, founder information, and company details
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="bg-gradient-to-r from-primary to-accent">
            <User className="mr-2 h-4 w-4" />
            {aboutContent ? 'Edit Content' : 'Create Content'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {aboutContent ? "Edit About Content" : "Create About Content"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="founder_name">Founder Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.founder_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, founder_name: e.target.value }))}
                    placeholder="Founder's full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder_note">Founder Note</Label>
                  <Textarea
                    value={formData.founder_note || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, founder_note: e.target.value }))}
                    placeholder="Brief note about the founder"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder_quote">Founder Quote</Label>
                  <Textarea
                    value={formData.founder_quote || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, founder_quote: e.target.value }))}
                    placeholder="Inspiring quote from the founder"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_upload">Founder Image</Label>
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
                      disabled={uploading}
                    />
                    {formData.founder_image_url && (
                      <div className="relative inline-block">
                        <img 
                          src={formData.founder_image_url} 
                          alt="Founder" 
                          className="w-32 h-32 object-cover rounded border"
                        />
                        <Button
                          onClick={removeImage}
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mission_statement">Mission Statement <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={formData.mission_statement || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mission_statement: e.target.value }))}
                    placeholder="Company mission statement"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision_statement">Vision Statement <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={formData.vision_statement || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, vision_statement: e.target.value }))}
                    placeholder="Company vision statement"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_about_text">Full About Text <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={formData.full_about_text || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_about_text: e.target.value }))}
                    placeholder="Complete about us content (use \n for line breaks)"
                    rows={8}
                  />
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
                {uploading ? "Uploading..." : "Save Content"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current About Content</CardTitle>
          </CardHeader>
          <CardContent>
            {aboutContent ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Founder</h4>
                    <p>{aboutContent.founder_name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Image</h4>
                    <p>{aboutContent.founder_image_url ? 'Uploaded' : 'No image'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Mission Statement</h4>
                  <p className="text-muted-foreground">{aboutContent.mission_statement}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Vision Statement</h4>
                  <p className="text-muted-foreground">{aboutContent.vision_statement}</p>
                </div>
                
                {aboutContent.founder_image_url && (
                  <div>
                    <h4 className="font-semibold">Founder Image</h4>
                    <img 
                      src={aboutContent.founder_image_url} 
                      alt={aboutContent.founder_name}
                      className="w-32 h-32 object-cover rounded border mt-2"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No about content found. Click "Create Content" to get started.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AboutContentManager;