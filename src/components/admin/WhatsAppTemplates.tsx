import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const templates = [
  {
    name: "order_confirmation",
    category: "Utility",
    status: "approved",
    description: "Sent when a customer places an order",
    params: ["customer_name", "order_id"],
  },
  {
    name: "order_status_update",
    category: "Utility",
    status: "approved",
    description: "Sent when order status changes",
    params: ["customer_name", "order_id", "new_status"],
  },
  {
    name: "vendor_order_alert",
    category: "Utility",
    status: "approved",
    description: "Alert vendor about new assigned order",
    params: ["vendor_name", "order_id"],
  },
  {
    name: "quote_ready",
    category: "Utility",
    status: "approved",
    description: "Notify customer that a quote is ready",
    params: ["customer_name", "quote_number", "acceptance_link"],
  },
  {
    name: "seasonal_offer",
    category: "Marketing",
    status: "pending",
    description: "Festival/seasonal promotional offers",
    params: ["customer_name"],
  },
  {
    name: "new_arrival",
    category: "Marketing",
    status: "pending",
    description: "New rental item or venue listing announcement",
    params: ["customer_name", "item_name"],
  },
  {
    name: "feedback_request",
    category: "Utility",
    status: "pending",
    description: "Post-event feedback request",
    params: ["customer_name", "event_name"],
  },
];

const WhatsAppTemplates = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Message Templates</h2>
        <Badge variant="secondary">{templates.length} templates</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        These templates must be created and approved in your{" "}
        <a
          href="https://business.facebook.com/wa/manage/message-templates/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          Meta Business Manager
        </a>
        {" "}before they can be used.
      </p>

      <div className="grid gap-3">
        {templates.map((tmpl) => (
          <Card key={tmpl.name}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {tmpl.params.map((p) => (
                        <Badge key={p} variant="outline" className="text-[10px] font-mono">
                          {`{{${p}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tmpl.category === "Marketing" ? "default" : "secondary"} className="text-[10px]">
                    {tmpl.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(tmpl.status)}
                    <span className="text-xs capitalize">{tmpl.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppTemplates;
