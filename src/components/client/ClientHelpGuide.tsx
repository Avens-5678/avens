import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Home, MessageSquare,
  Calendar, Award, User, ShoppingCart, MapPin, HelpCircle,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Home,
    title: "Home",
    summary: "Your dashboard overview — upcoming bookings, quick actions, and recommendations.",
    body: [
      "See your next event at a glance.",
      "Quick links to start a new request, browse the marketplace, or open Inbox.",
      "Personalized suggestions based on what you've viewed.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Inbox",
    summary: "All your conversations with vendors — Telegram/WhatsApp style.",
    body: [
      "A chat thread is auto-created the moment you book a vendor.",
      "Each thread is tied to the related order — you see context inline.",
      "Share photos, ask questions, and confirm details until the event finishes.",
      "The unread badge in the sidebar tells you when a vendor replies.",
    ],
  },
  {
    icon: Calendar,
    title: "My Orders",
    summary: "All your rental orders and event bookings — past and ongoing.",
    body: [
      "The All tab shows everything regardless of status.",
      "Pending = booking placed, vendor working on it.",
      "Completed = delivered, picked up, and finished.",
      "Status updates live as the vendor progresses (pending → accepted → in transit → delivered → completed).",
    ],
  },
  {
    icon: Award,
    title: "Loyalty",
    summary: "Earn points for every booking. Redeem them for discounts.",
    body: [
      "100 points just for signing up.",
      "Earn points on every paid order.",
      "Climb tiers (Silver → Gold → Platinum) for better perks.",
      "Refer friends with your code for bonus points.",
    ],
  },
  {
    icon: User,
    title: "Profile",
    summary: "Your contact details and saved addresses.",
    body: [
      "Add/edit your name, phone, email, and city.",
      "Saved addresses (Home, Work, Other) auto-fill on cart checkout — Swiggy style.",
      "Optional GST and company name for B2B invoices.",
    ],
  },
];

const QUICK_FLOWS = [
  {
    icon: ShoppingCart,
    title: "How to rent something",
    steps: [
      "Open the Marketplace from the homepage.",
      "Use the location bar to set your area; vendors within radius show up.",
      "Pick an item, choose dates and quantity, click Add to Cart.",
      "Open the cart, pick a saved address (or pin a new one), and pay.",
    ],
  },
  {
    icon: MapPin,
    title: "How the radius filter works",
    steps: [
      "Set your delivery location (GPS or PIN code) at the top of the marketplace.",
      "By default we show vendors within 10 km.",
      "If you want more options, click \"Show vendors up to 25 km\" to expand.",
      "Distance is calculated from each vendor's warehouse to your location.",
    ],
  },
];

const ClientHelpGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Getting Started
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Here's a complete tour of every tool in your dashboard and how to use them.
          </p>
        </CardHeader>
      </Card>

      {/* Quick flows */}
      <div className="grid gap-3 md:grid-cols-3">
        {QUICK_FLOWS.map((flow) => (
          <Card key={flow.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <flow.icon className="h-4 w-4 text-primary" />
                {flow.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                {flow.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tool Reference</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tap any section to expand the guide.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {SECTIONS.map((s) => (
              <AccordionItem key={s.title} value={s.title}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-3">
                    <s.icon className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground font-normal">{s.summary}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-muted-foreground space-y-2 pl-7 list-disc">
                    {s.body.map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need more help?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Once you've placed a booking, open <strong>Inbox</strong> to chat directly with the vendor about anything related to your event.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientHelpGuide;
