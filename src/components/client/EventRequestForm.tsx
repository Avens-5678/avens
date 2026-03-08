import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEventRequest } from "@/hooks/useEventRequests";
import { Loader2 } from "lucide-react";

const eventRequestSchema = z.object({
  event_type: z.string().min(1, "Please select an event type"),
  event_date: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  guest_count: z.coerce.number().optional(),
  requirements: z.string().optional(),
});

type EventRequestFormData = z.infer<typeof eventRequestSchema>;

interface EventRequestFormProps {
  onSuccess?: () => void;
  defaultEventType?: string;
}

const eventTypes = [
  "Corporate Event",
  "Wedding",
  "Birthday Party",
  "Conference",
  "Exhibition",
  "Government Event",
  "Sports Event",
  "Concert",
  "Entertainment Event",
  "Healthcare Event",
  "Equipment Rental",
  "Other",
];

const budgetRanges = [
  "Under ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000 - ₹5,00,000",
  "₹5,00,000 - ₹10,00,000",
  "₹10,00,000+",
];

// Map URL event type slugs to form values
function mapEventTypeSlug(slug: string): string {
  const map: Record<string, string> = {
    "corporate-exhibitions": "Corporate Event",
    "corporate": "Corporate Event",
    "wedding-events": "Wedding",
    "government-events": "Government Event",
    "entertainment-lifestyle": "Entertainment Event",
    "sports-outdoor": "Sports Event",
    "healthcare-medical": "Healthcare Event",
    "equipment-rental": "Equipment Rental",
    "birthday-parties": "Birthday Party",
  };
  return map[slug] || "";
}

const EventRequestForm = ({ onSuccess, defaultEventType }: EventRequestFormProps) => {
  const { mutate: createRequest, isPending } = useCreateEventRequest();

  const resolvedDefault = defaultEventType ? mapEventTypeSlug(defaultEventType) : "";

  const form = useForm<EventRequestFormData>({
    resolver: zodResolver(eventRequestSchema),
    defaultValues: {
      event_type: resolvedDefault,
      event_date: "",
      location: "",
      budget: "",
      guest_count: undefined,
      requirements: "",
    },
  });

  const onSubmit = (data: EventRequestFormData) => {
    createRequest({
      event_type: data.event_type,
      event_date: data.event_date || undefined,
      location: data.location || undefined,
      budget: data.budget || undefined,
      guest_count: data.guest_count || undefined,
      requirements: data.requirements || undefined,
    }, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location/venue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guest_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Guests</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Number of guests" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Budget Range</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Requirements</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event requirements, special requests, theme ideas, etc."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Service Request
        </Button>
      </form>
    </Form>
  );
};

export default EventRequestForm;
