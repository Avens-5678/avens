import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";

const VENUE_TYPES = [
  "Banquet Hall", "Open Lawn", "Rooftop", "Farmhouse",
  "Convention Center", "Resort & Hotel", "Heritage Property", "Beach Venue",
];

const SEATING_TYPES = [
  "Floating", "Theatre", "Cluster", "Classroom", "U-Shape", "Round Table", "Cocktail",
];

const AMENITY_OPTIONS = [
  "In-house Catering", "External Catering Allowed", "In-house Decor",
  "AC Halls", "Parking Available", "Valet Parking", "DJ Allowed",
  "Rooms Available", "AV Equipment", "Bridal Suite", "Swimming Pool",
  "Garden Area", "Terrace", "Elevator Access",
];

const SLOT_OPTIONS = [
  { value: "morning", label: "Morning (8AM – 2PM)" },
  { value: "evening", label: "Evening (4PM – 11PM)" },
  { value: "full_day", label: "Full Day" },
];

interface PricingPackage {
  name: string;
  price: number;
  unit: string;
}

interface VenueFormFieldsProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const VenueFormFields = ({ formData, setFormData }: VenueFormFieldsProps) => {
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgUnit, setNewPkgUnit] = useState("Per Event");

  const packages: PricingPackage[] = formData.pricing_packages || [];

  const addPackage = () => {
    if (!newPkgName.trim() || !newPkgPrice) return;
    const updated = [...packages, { name: newPkgName.trim(), price: parseFloat(newPkgPrice), unit: newPkgUnit }];
    setFormData(prev => ({ ...prev, pricing_packages: updated }));
    setNewPkgName("");
    setNewPkgPrice("");
  };

  const removePackage = (index: number) => {
    setFormData(prev => ({ ...prev, pricing_packages: packages.filter((_, i) => i !== index) }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    const current: string[] = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  return (
    <>
      {/* Capacity & Spaces */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Capacity & Spaces</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Venue Type</Label>
            <Select value={formData.venue_type || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, venue_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {VENUE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Min Capacity</Label>
            <Input type="number" value={formData.min_capacity || ''} onChange={(e) => setFormData(prev => ({ ...prev, min_capacity: parseInt(e.target.value) || null }))} placeholder="e.g. 50" />
          </div>
          <div className="space-y-1">
            <Label>Max Capacity</Label>
            <Input type="number" value={formData.max_capacity || ''} onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || null }))} placeholder="e.g. 500" />
          </div>
          <div className="space-y-1">
            <Label>Number of Halls</Label>
            <Input type="number" value={formData.num_halls || ''} onChange={(e) => setFormData(prev => ({ ...prev, num_halls: parseInt(e.target.value) || null }))} placeholder="e.g. 3" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Seating Types</Label>
          <div className="flex flex-wrap gap-2">
            {SEATING_TYPES.map(type => (
              <Badge
                key={type}
                variant={(formData.seating_types || []).includes(type) ? "default" : "outline"}
                className="cursor-pointer transition-all"
                onClick={() => toggleArrayItem('seating_types', type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Pricing */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Dynamic Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Weekday Price (₹)</Label>
            <Input type="number" value={formData.weekday_price || ''} onChange={(e) => setFormData(prev => ({ ...prev, weekday_price: parseFloat(e.target.value) || null }))} placeholder="e.g. 50000" />
          </div>
          <div className="space-y-1">
            <Label>Weekend Price (₹)</Label>
            <Input type="number" value={formData.weekend_price || ''} onChange={(e) => setFormData(prev => ({ ...prev, weekend_price: parseFloat(e.target.value) || null }))} placeholder="e.g. 75000" />
          </div>
        </div>

        {/* Packages Builder */}
        <div className="space-y-2">
          <Label>Pricing Packages</Label>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Package Name</Label>
              <Input value={newPkgName} onChange={(e) => setNewPkgName(e.target.value)} placeholder="e.g. Wedding Package" />
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs">Price (₹)</Label>
              <Input type="number" value={newPkgPrice} onChange={(e) => setNewPkgPrice(e.target.value)} placeholder="50000" />
            </div>
            <div className="w-32 space-y-1">
              <Label className="text-xs">Unit</Label>
              <Select value={newPkgUnit} onValueChange={setNewPkgUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Per Event">Per Event</SelectItem>
                  <SelectItem value="Per Day">Per Day</SelectItem>
                  <SelectItem value="Per Plate">Per Plate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addPackage} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          {packages.length > 0 && (
            <div className="space-y-1 mt-2">
              {packages.map((pkg, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{pkg.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₹{pkg.price.toLocaleString()} / {pkg.unit}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePackage(i)}><X className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amenities & Services */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Amenities & Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITY_OPTIONS.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={(formData.amenities || []).includes(amenity)}
                onCheckedChange={(checked) => {
                  const current = formData.amenities || [];
                  setFormData(prev => ({
                    ...prev,
                    amenities: checked ? [...current, amenity] : current.filter((a: string) => a !== amenity),
                  }));
                }}
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Catering Type</Label>
            <Select value={formData.catering_type || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, catering_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in-house">In-house Only</SelectItem>
                <SelectItem value="external">External Allowed</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Rooms Available</Label>
            <Input type="number" value={formData.rooms_available || ''} onChange={(e) => setFormData(prev => ({ ...prev, rooms_available: parseInt(e.target.value) || 0 }))} placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Slots</Label>
          <div className="flex flex-wrap gap-2">
            {SLOT_OPTIONS.map(slot => (
              <Badge
                key={slot.value}
                variant={(formData.slot_types || []).includes(slot.value) ? "default" : "outline"}
                className="cursor-pointer transition-all"
                onClick={() => toggleArrayItem('slot_types', slot.value)}
              >
                {slot.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Policies */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Policies</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Advance Amount (₹)</Label>
            <Input type="number" value={formData.advance_amount || ''} onChange={(e) => setFormData(prev => ({ ...prev, advance_amount: parseFloat(e.target.value) || null }))} placeholder="e.g. 25000" />
          </div>
          <div className="space-y-1">
            <Label>Pricing Model</Label>
            <Select value={formData.venue_pricing_model || 'dry_rental'} onValueChange={(v) => setFormData(prev => ({ ...prev, venue_pricing_model: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dry_rental">Dry Rental (Flat Rate)</SelectItem>
                <SelectItem value="per_plate">Per Plate (Catering)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Video Walkthrough URL</Label>
            <Input value={formData.video_url || ''} onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-1">
            <Label>Instagram URL</Label>
            <Input value={formData.instagram_url || ''} onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." />
          </div>
        </div>
        <div className="space-y-1">
          <Label>360° Virtual Tour URL</Label>
          <Input value={formData.virtual_tour_url || ''} onChange={(e) => setFormData(prev => ({ ...prev, virtual_tour_url: e.target.value }))} placeholder="https://my.matterport.com/show/... or YouTube 360 link" />
          <p className="text-xs text-muted-foreground">Matterport, YouTube 360, or any embeddable tour link. Helps earn the "Evnting Verified" badge.</p>
        </div>
        <div className="space-y-1">
          <Label>Cancellation Policy</Label>
          <Textarea value={formData.cancellation_policy || ''} onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))} rows={2} placeholder="e.g. Full refund if cancelled 30 days before event" />
        </div>
        <div className="space-y-1">
          <Label>Refund Rules</Label>
          <Textarea value={formData.refund_rules || ''} onChange={(e) => setFormData(prev => ({ ...prev, refund_rules: e.target.value }))} rows={2} placeholder="e.g. 50% refund within 15 days, no refund within 7 days" />
        </div>
      </div>

      {/* House Rules */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">House Rules & Restrictions</h3>
        <div className="space-y-2">
          {(formData.house_rules || []).map((rule: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={rule}
                onChange={(e) => {
                  const updated = [...(formData.house_rules || [])];
                  updated[i] = e.target.value;
                  setFormData(prev => ({ ...prev, house_rules: updated }));
                }}
                placeholder="e.g. Music stops at 10 PM"
                className="flex-1"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                const updated = (formData.house_rules || []).filter((_: string, idx: number) => idx !== i);
                setFormData(prev => ({ ...prev, house_rules: updated }));
              }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({ ...prev, house_rules: [...(prev.house_rules || []), ""] }))}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Add Rule
          </Button>
        </div>
      </div>

      {/* Amenities Matrix (structured) */}
      <Separator />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Detailed Amenities Matrix</h3>
        <p className="text-xs text-muted-foreground">Set specific amenity details shown to clients as a structured grid.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: "valet_parking", label: "Valet Parking" },
            { key: "bridal_rooms", label: "Bridal Rooms", type: "number" },
            { key: "generator", label: "Generator Backup" },
            { key: "outside_catering", label: "Outside Catering Allowed" },
            { key: "dj_allowed", label: "DJ Allowed" },
            { key: "ac", label: "Air Conditioning" },
            { key: "swimming_pool", label: "Swimming Pool" },
            { key: "elevator", label: "Elevator Access" },
            { key: "wifi", label: "Wi-Fi" },
          ].map(({ key, label, type }) => {
            const matrix = formData.amenities_matrix || {};
            if (type === "number") {
              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    value={matrix[key] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      amenities_matrix: { ...(prev.amenities_matrix || {}), [key]: parseInt(e.target.value) || 0 },
                    }))}
                    placeholder="0"
                  />
                </div>
              );
            }
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={!!matrix[key]}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    amenities_matrix: { ...(prev.amenities_matrix || {}), [key]: !!checked },
                  }))}
                />
                <span className="text-sm">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VenueFormFields;
