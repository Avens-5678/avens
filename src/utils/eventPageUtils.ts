import { supabase } from "@/integrations/supabase/client";

export interface EventPageTemplate {
  eventType: string;
  title: string;
  description: string;
  processDescription: string;
  heroImageUrl?: string;
}

// Default templates for different event types
const defaultTemplates: Record<string, EventPageTemplate> = {
  wedding: {
    eventType: "wedding",
    title: "Wedding Events",
    description: "Creating magical moments for your special day with elegant event planning and coordination.",
    processDescription: "Our wedding planning process ensures every detail is perfect for your dream celebration.",
    heroImageUrl: "/src/assets/wedding-events-hero.jpg"
  },
  corporate: {
    eventType: "corporate",
    title: "Corporate Events", 
    description: "Professional event planning for businesses, conferences, and corporate gatherings.",
    processDescription: "We deliver seamless corporate experiences that enhance your brand and engage your audience.",
    heroImageUrl: "/src/assets/corporate-events-hero.jpg"
  },
  birthday: {
    eventType: "birthday",
    title: "Birthday Parties",
    description: "Unforgettable birthday celebrations tailored to make every age milestone special.",
    processDescription: "From theme selection to execution, we create birthday memories that last a lifetime.",
    heroImageUrl: "/src/assets/birthday-parties-hero.jpg"
  },
  government: {
    eventType: "government",
    title: "Government Events",
    description: "Professional event management for government functions, ceremonies, and official gatherings.",
    processDescription: "We ensure protocol compliance and flawless execution for all government occasions.",
    heroImageUrl: "/src/assets/government-events-hero.jpg"
  }
};

export const createEventPage = async (eventData: any): Promise<string> => {
  const eventType = eventData.event_type?.toLowerCase();
  const template = defaultTemplates[eventType] || defaultTemplates.corporate;
  
  // Create the event in database with template data
  const { data, error } = await supabase
    .from('events')
    .upsert({
      ...eventData,
      title: eventData.title || template.title,
      description: eventData.description || template.description,
      process_description: eventData.process_description || template.processDescription,
      hero_image_url: eventData.hero_image_url || template.heroImageUrl,
      event_type: eventType,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  return `/events/${eventType}`;
};

export const deleteEventPage = async (eventId: string): Promise<void> => {
  // Delete the event from database
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;

  // Delete associated portfolio items
  await supabase
    .from('portfolio')
    .delete()
    .eq('event_id', eventId);
};

export const getEventTypeFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/events\/([^\/]+)/);
  return match ? match[1] : null;
};