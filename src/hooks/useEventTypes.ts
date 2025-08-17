import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventTypeOption {
  value: string;
  label: string;
}

const fetchEventTypes = async (): Promise<EventTypeOption[]> => {
  // Default event types to always include
  const defaultEventTypes: EventTypeOption[] = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'government', label: 'Government' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'social', label: 'Social Event' },
  ];

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

    return allEventTypes;
  } catch (error) {
    console.error('Error fetching event types:', error);
    // Fallback to default event types
    return defaultEventTypes;
  }
};

export const useEventTypes = () => {
  const { data: eventTypes = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: fetchEventTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up real-time listener for events table changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          // Refetch event types when events table changes
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { eventTypes, loading };
};