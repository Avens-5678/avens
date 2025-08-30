import React, { useState, useEffect } from "react";
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
import { uploadEventHeroImage, uploadSpecialtyImage } from "@/utils/storageUtils";
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
  cta_title?: string;
  cta_description?: string;
  cta_button_text?: string;
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
  const [formData, setFormData] = useState<EventFormData>(() => {
    const baseData = {
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
    };

    if (initialData) {
      // Parse JSON fields if they exist as strings
      const parsedData = { ...baseData, ...initialData };
      
      // Handle specialties - parse if string, use as-is if array
      if (typeof parsedData.specialties === 'string') {
        try {
          parsedData.specialties = JSON.parse(parsedData.specialties);
        } catch (e) {
          console.error('Error parsing specialties:', e);
          parsedData.specialties = [];
        }
      }
      
      // Handle services - parse if string, use as-is if array
      if (typeof parsedData.services === 'string') {
        try {
          parsedData.services = JSON.parse(parsedData.services);
        } catch (e) {
          console.error('Error parsing services:', e);
          parsedData.services = [];
        }
      }
      
      // Handle process_steps - parse if string, use as-is if array
      if (typeof parsedData.process_steps === 'string') {
        try {
          parsedData.process_steps = JSON.parse(parsedData.process_steps);
        } catch (e) {
          console.error('Error parsing process_steps:', e);
          parsedData.process_steps = baseData.process_steps;
        }
      }
      
      // Handle default_portfolio_tags - parse if string, use as-is if array
      if (typeof parsedData.default_portfolio_tags === 'string') {
        try {
          parsedData.default_portfolio_tags = JSON.parse(parsedData.default_portfolio_tags);
        } catch (e) {
          console.error('Error parsing default_portfolio_tags:', e);
          parsedData.default_portfolio_tags = [];
        }
      }
      
      return parsedData;
    }
    
    return baseData;
  });

  const [uploading, setUploading] = useState(false);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const parsedData = { ...formData };
      
      // Update basic fields
      Object.keys(initialData).forEach(key => {
        if (key in parsedData) {
          parsedData[key] = initialData[key];
        }
      });
      
      // Handle specialties - parse if string, use as-is if array
      if (initialData.specialties) {
        if (typeof initialData.specialties === 'string') {
          try {
            parsedData.specialties = JSON.parse(initialData.specialties);
          } catch (e) {
            console.error('Error parsing specialties:', e);
            parsedData.specialties = [];
          }
        } else {
          parsedData.specialties = initialData.specialties;
        }
      }
      
      // Handle services - parse if string, use as-is if array
      if (initialData.services) {
        if (typeof initialData.services === 'string') {
          try {
            parsedData.services = JSON.parse(initialData.services);
          } catch (e) {
            console.error('Error parsing services:', e);
            parsedData.services = [];
          }
        } else {
          parsedData.services = initialData.services;
        }
      }
      
      // Handle process_steps - parse if string, use as-is if array
      if (initialData.process_steps) {
        if (typeof initialData.process_steps === 'string') {
          try {
            parsedData.process_steps = JSON.parse(initialData.process_steps);
          } catch (e) {
            console.error('Error parsing process_steps:', e);
            parsedData.process_steps = [
              { title: 'Consultation', description: 'We discuss your vision and requirements', icon: 'users', order: 1 },
              { title: 'Planning', description: 'We create a detailed plan for your event', icon: 'calendar', order: 2 },
              { title: 'Execution', description: 'We bring your vision to life perfectly', icon: 'star', order: 3 },
            ];
          }
        } else {
          parsedData.process_steps = initialData.process_steps;
        }
      }
      
      setFormData(parsedData);
    }
  }, [initialData, mode]);

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

  const handleSpecialtyImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const specialtyId = `specialty-${index}-${Date.now()}`;
      const imageUrl = await uploadSpecialtyImage(file, specialtyId);
      updateSpecialty(index, 'image_url', imageUrl);
      toast.success('Specialty image uploaded successfully');
    } catch (error) {
      console.error('Error uploading specialty image:', error);
      toast.error('Failed to upload specialty image');
    } finally {
      setUploading(false);
    }
  };

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, { title: '', description: '', image_url: '' }]
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
    if (!formData.title || !formData.event_type || !formData.process_description) {
      toast.error('Please fill in all required fields (Title, Event Type, and Process Description)');
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

              <div>
                <Label htmlFor="process_description">Process Description *</Label>
                <Textarea
                  id="process_description"
                  value={formData.process_description}
                  onChange={(e) => handleInputChange('process_description', e.target.value)}
                  placeholder="Detailed description of your event planning process"
                  rows={4}
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
                     <div>
                       <Label htmlFor={`specialty-image-${index}`}>Specialty Image</Label>
                       <div className="space-y-2">
                         <Input
                           id={`specialty-image-${index}`}
                           type="file"
                           accept="image/*"
                           onChange={(e) => handleSpecialtyImageUpload(e, index)}
                           disabled={uploading}
                         />
                         {specialty.image_url && (
                           <img 
                             src={specialty.image_url} 
                             alt={specialty.title || `Specialty ${index + 1}`} 
                             className="w-32 h-20 object-cover rounded" 
                           />
                         )}
                       </div>
                     </div>
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

          {/* CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cta_title">CTA Title</Label>
                <Input
                  id="cta_title"
                  value={formData.cta_title || ''}
                  onChange={(e) => handleInputChange('cta_title', e.target.value)}
                  placeholder="e.g., Ready to Create Something Amazing Together?"
                />
              </div>

              <div>
                <Label htmlFor="cta_description">CTA Description</Label>
                <Textarea
                  id="cta_description"
                  value={formData.cta_description || ''}
                  onChange={(e) => handleInputChange('cta_description', e.target.value)}
                  placeholder="Let's discuss your vision and create an unforgettable experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cta_button_text">CTA Button Text</Label>
                <Input
                  id="cta_button_text"
                  value={formData.cta_button_text || ''}
                  onChange={(e) => handleInputChange('cta_button_text', e.target.value)}
                  placeholder="e.g., Book a Consultation"
                />
              </div>
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