import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Home, Bot, FolderOpen, Gift, MessageSquare, FileText, Plus,
  Calendar, Award, User, ShoppingCart, MapPin, BookOpen, HelpCircle,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Home,
    title: "Home",
    summary: "Your dashboard overview — upcoming bookings, quick actions, and recommendations.",
    body: [
      "See your next event at a glance.",
      "Quick links to start a new request, browse the marketplace, or open Messages.",
      "Personalized suggestions based on what you've viewed.",
    ],
  },
  {
    icon: Bot,
    title: "AI Assistant",
    summary: "Chat with Evnting AI to plan an event, get rental ideas, or build a quote.",
    body: [
      "Tell the AI what you're planning — e.g. \"500-guest wedding in Hyderabad\".",
      "It can suggest vendors, build a rental cart for you, and submit it as an event request.",
      "You can also ask follow-up questions like \"add 200 chairs\" and it'll update the cart.",
    ],
  },
  {
    icon: FolderOpen,
    title: "Event Hub",
    summary: "Workspace for an event in progress — vendors, milestones, files, payments.",
    body: [
      "Track every vendor assigned to your event in one place.",
      "See payment milestones and upcoming dates.",
      "Upload reference photos and notes for vendors.",
    ],
  },
  {
    icon: Gift,
    title: "My Events",
    summary: "All your booked theme bundles (e.g. Birthday, Wedding, Corporate package).",
    body: [
      "Bundles group multiple items + services into a single booking.",
      "Track delivery status and fulfilment for the whole bundle.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Messages",
    summary: "Direct chat with vendors after you place a booking (Uber-style).",
    body: [
      "A chat thread is auto-created the moment you book a vendor.",
      "You can share photos, ask questions, and confirm details up until the event finishes.",
      "The unread badge in the sidebar tells you when a vendor replies.",
    ],
  },
  {
    icon: FileText,
    title: "My Requests",
    summary: "All event requests you've submitted, with status updates.",
    body: [
      "See whether a request is pending, sent to vendors, quoted, or accepted.",
      "Open any request to view the quote and accept it.",
    ],
  },
  {
    icon: Plus,
    title: "New Request",
    summary: "Submit a fresh event request to be matched with vendors.",
    body: [
      "Use this for full-event planning where you want our team to source vendors for you.",
      "For quick equipment rentals, just go to the Marketplace and add items to your cart.",
    ],
  },
  {
    icon: Calendar,
    title: "Past Orders / My Orders",
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
    icon: BookOpen,
    title: "How to plan a full event",
    steps: [
      "Go to New Request and submit your event details.",
      "Our team matches it to vendors and sends you a quote.",
      "Accept the quote — vendors get assigned and a chat thread opens.",
      "Track progress in My Requests / Event Hub.",
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
            Open the <strong>AI Assistant</strong> tab for any question about Evnting, your bookings, or planning your event.
          </p>
          <p>
            Once you've placed a booking, use <strong>Messages</strong> to chat directly with the vendor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientHelpGuide;
