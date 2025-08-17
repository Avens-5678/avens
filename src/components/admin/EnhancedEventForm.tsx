import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Star, Users, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadEventHeroImage } from "@/utils/storageUtils";
import { useEventTypes } from "@/hooks/useEventTypes";

interface Specialty {
  title: string;
  description: string;
  image_url?: string;
}

interface Service {
  title: string;
  description: string;
  icon: string;
}

interface ProcessStep {
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface EventFormData {
  title: string;
  description: string;
  process_description: string;
  event_type: string;
  hero_image_url?: string;
  hero_subtitle?: string;
  hero_cta_text: string;
  what_we_do_title: string;
  services_section_title: string;
  url_slug?: string;
  meta_description?: string;
  location?: string;
  specialties: Specialty[];
  services: Service[];
  process_steps: ProcessStep[];
  default_portfolio_tags: string[];
}

interface EnhancedEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  mode: 'create' | 'edit';
}

const iconOptions = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
  { value: 'zap', label: 'Zap', icon: Zap },
];

export const EnhancedEventForm: React.FC<EnhancedEventFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}) => {
  const { eventTypes, loading: eventTypesLoading } = useEventTypes();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    process_description: '',
    event_type: '',
    hero_cta_text: 'Book a Consultation',
    what_we_do_title: 'What We Do',
    services_section_title: 'Our Services',
    specialties: [],
    services: [],
    process_steps: [
      { title: 'Consultation', description: 'We discuss your vision and requirements', icon: 'users', order: 1 },
      { title: 'Planning', description: 'We create a detailed plan for your event', icon: 'calendar', order: 2 },
      { title: 'Execution', description: 'We bring your vision to life perfectly', icon: 'star', order: 3 },
    ],
    default_portfolio_tags: [],
    ...initialData
  });

  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const eventId = formData.event_type || 'temp';
      const imageUrl = await uploadEventHeroImage(file, eventId);
      handleInputChange('hero_image_url', imageUrl);
      toast.success('Hero image uploaded successfully');
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast.error('Failed to upload hero image');
    } finally {
      setUploading(false);
    }
  };

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, { title: '', description: '' }]
    }));
  };

  const updateSpecialty = (index: number, field: keyof Specialty, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '', icon: 'star' }]
    }));
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.event_type) {
      toast.error('Please fill in required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Event Page' : 'Edit Event Page'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Dream Wedding Planning"
                  />
                </div>
                <div>
                  <Label htmlFor="event_type">Event Type *</Label>
                  {mode === 'create' ? (
                    <Input
                      id="event_type"
                      value={formData.event_type}
                      onChange={(e) => handleInputChange('event_type', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="e.g., anniversary, social-gathering, etc."
                    />
                  ) : (
                    <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)} disabled={eventTypesLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={eventTypesLoading ? "Loading..." : "Select event type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Main Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the event service"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Input
                    id="hero_subtitle"
                    value={formData.hero_subtitle || ''}
                    onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                    placeholder="Catchy subtitle for hero section"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_cta_text">Hero Button Text</Label>
                  <Input
                    id="hero_cta_text"
                    value={formData.hero_cta_text}
                    onChange={(e) => handleInputChange('hero_cta_text', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hero_image">Hero Image</Label>
                <div className="space-y-2">
                  <Input
                    id="hero_image"
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    disabled={uploading}
                  />
                  {formData.hero_image_url && (
                    <img src={formData.hero_image_url} alt="Hero" className="w-32 h-20 object-cover rounded" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Event Specialties
                <Button onClick={addSpecialty} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specialty
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Specialty {index + 1}</h4>
                    <Button 
                      onClick={() => removeSpecialty(index)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Specialty title"
                      value={specialty.title}
                      onChange={(e) => updateSpecialty(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Specialty description"
                      value={specialty.description}
                      onChange={(e) => updateSpecialty(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Services Offered
                <Button onClick={addService} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.services.map((service, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Service {index + 1}</h4>
                    <Button 
                      onClick={() => removeService(index)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Service title"
                      value={service.title}
                      onChange={(e) => updateService(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Service description"
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      rows={2}
                    />
                    <Select 
                      value={service.icon} 
                      onValueChange={(value) => updateService(index, 'icon', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(option => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <IconComponent className="w-4 h-4 mr-2" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Process Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Process Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.process_steps.map((step, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-3">Step {step.order}</h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Step title"
                      value={step.title}
                      onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                      rows={2}
                    />
                    <Select 
                      value={step.icon} 
                      onValueChange={(value) => updateProcessStep(index, 'icon', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(option => {
                          const IconComponent = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <IconComponent className="w-4 h-4 mr-2" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};