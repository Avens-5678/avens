import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventTypeOption {
  value: string;
  label: string;
}

export const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Default event types to always include
  const defaultEventTypes: EventTypeOption[] = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'government', label: 'Government' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'social', label: 'Social Event' },
  ];

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        // Fetch distinct event types from the database
        const { data, error } = await supabase
          .from('events')
          .select('event_type')
          .eq('is_active', true);

        if (error) throw error;

        // Extract unique event types from database
        const dbEventTypes = [...new Set(data?.map(item => item.event_type) || [])];
        
        // Create options for database event types
        const dbOptions: EventTypeOption[] = dbEventTypes.map(eventType => ({
          value: eventType,
          label: eventType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }));

        // Combine default and database event types, removing duplicates
        const allEventTypes = [...defaultEventTypes];
        dbOptions.forEach(dbOption => {
          if (!allEventTypes.find(defaultOption => defaultOption.value === dbOption.value)) {
            allEventTypes.push(dbOption);
          }
        });

        // Sort alphabetically
        allEventTypes.sort((a, b) => a.label.localeCompare(b.label));

        setEventTypes(allEventTypes);
      } catch (error) {
        console.error('Error fetching event types:', error);
        // Fallback to default event types
        setEventTypes(defaultEventTypes);
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  return { eventTypes, loading };
};