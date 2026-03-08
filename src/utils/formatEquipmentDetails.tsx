import React from "react";

interface CartItem {
  title: string;
  quantity: number;
  price_value?: number;
  pricing_unit?: string;
  variant_label?: string | null;
  length?: number | null;
  breadth?: number | null;
}

interface EventDetails {
  customer_name?: string;
  contact_number?: string;
  email?: string;
  event_start_date?: string;
  event_end_date?: string;
  event_location?: string;
  venue_area?: string;
  notes?: string;
}

interface ParsedDetails {
  cart_items?: CartItem[];
  event_details?: EventDetails;
}

/**
 * Try to parse equipment_details as JSON cart payload.
 * Returns null if it's plain text.
 */
export function parseEquipmentDetails(raw: string): ParsedDetails | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.cart_items || parsed.event_details) return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Format equipment details into a clean readable string.
 */
export function formatEquipmentText(raw: string): string {
  const parsed = parseEquipmentDetails(raw);
  if (!parsed) return raw;

  const lines: string[] = [];

  if (parsed.cart_items?.length) {
    parsed.cart_items.forEach((item, i) => {
      const qty = item.quantity > 1 ? `${item.quantity}x ` : "";
      const variant = item.variant_label ? ` (${item.variant_label})` : "";
      const price = item.price_value
        ? ` — ₹${item.price_value.toLocaleString("en-IN")}${item.pricing_unit ? `/${item.pricing_unit}` : ""}`
        : "";
      const dims =
        item.length && item.breadth ? ` [${item.length}m × ${item.breadth}m]` : "";
      lines.push(`• ${qty}${item.title}${variant}${dims}${price}`);
    });
  }

  if (parsed.event_details) {
    const ed = parsed.event_details;
    lines.push("");
    if (ed.event_location || ed.venue_area) {
      lines.push(
        `📍 ${[ed.venue_area, ed.event_location].filter(Boolean).join(", ")}`
      );
    }
    if (ed.event_start_date) {
      const start = new Date(ed.event_start_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const end = ed.event_end_date
        ? new Date(ed.event_end_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null;
      lines.push(`📅 ${start}${end ? ` → ${end}` : ""}`);
    }
    if (ed.notes) {
      lines.push(`📝 ${ed.notes}`);
    }
  }

  return lines.join("\n");
}

/**
 * React component to render equipment details in a clean, styled format.
 */
export function EquipmentDetailsDisplay({ details }: { details: string }) {
  const parsed = parseEquipmentDetails(details);

  if (!parsed) {
    return <p className="whitespace-pre-wrap text-sm">{details}</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {parsed.cart_items && parsed.cart_items.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-medium text-foreground">Items</p>
          {parsed.cart_items.map((item, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.title}</span>
                {item.variant_label && (
                  <span className="text-muted-foreground ml-1">
                    ({item.variant_label})
                  </span>
                )}
                {item.length && item.breadth && (
                  <span className="text-muted-foreground ml-1">
                    [{item.length}m × {item.breadth}m]
                  </span>
                )}
              </div>
              <div className="text-right whitespace-nowrap text-muted-foreground">
                <span>Qty: {item.quantity}</span>
                {item.price_value && (
                  <span className="ml-2">
                    ₹{item.price_value.toLocaleString("en-IN")}
                    {item.pricing_unit ? `/${item.pricing_unit}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {parsed.event_details && (
        <div className="space-y-1.5 border-t pt-2">
          <p className="font-medium text-foreground">Event Info</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
            {(parsed.event_details.event_location ||
              parsed.event_details.venue_area) && (
              <div className="col-span-2 flex items-center gap-1.5">
                <span>📍</span>
                <span>
                  {[
                    parsed.event_details.venue_area,
                    parsed.event_details.event_location,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            {parsed.event_details.event_start_date && (
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span>
                  {new Date(
                    parsed.event_details.event_start_date
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {parsed.event_details.event_end_date &&
                    ` → ${new Date(
                      parsed.event_details.event_end_date
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`}
                </span>
              </div>
            )}
            {parsed.event_details.notes && (
              <div className="col-span-2 flex items-start gap-1.5">
                <span>📝</span>
                <span>{parsed.event_details.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
