import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  LayoutDashboard, Bot, ClipboardList, Boxes, Gift, Truck, MessageSquare, Package,
  ShoppingBag, PartyPopper, UserCheck, ListTodo, IndianRupee, Users,
  TrendingUp, TrendingDown, FileText, BookOpen, Star, MapPin, User, HelpCircle,
  Camera, Settings, Sparkles, ShieldCheck,
} from "lucide-react";

const QUICK_FLOWS = [
  {
    icon: Package,
    title: "How to add an item",
    steps: [
      "Open Inventory in the sidebar.",
      "Click + Add Item, choose what you're listing (rental / venue / crew).",
      "Fill name + photos. AI will suggest description, category, keywords.",
      "Set price, stock, dimensions. Save.",
      "Item appears on the marketplace once your account is approved.",
    ],
  },
  {
    icon: Truck,
    title: "How to fulfil an order",
    steps: [
      "Orders tab → accept the new request.",
      "Deliveries tab → assign driver → Mark Picked Up → Start Transit.",
      "On arrival: Deliver + Photo (proof of delivery).",
      "After the event ends: Pick Up Items + Photo to mark return.",
      "Order auto-completes and payout is released.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Talking to customers",
    steps: [
      "Every order auto-creates a chat thread under Chat.",
      "Reply to questions, share images, confirm details.",
      "Thread stays open until the event finishes and payment is settled.",
    ],
  },
];

const SECTIONS = [
  { icon: LayoutDashboard, title: "Overview", summary: "Live KPIs — orders today, payouts pending, top items, ratings.", body: ["At-a-glance dashboard of your business.","Click any tile to drill into details.","Notifications and unread chats appear here too."] },
  { icon: Bot, title: "AI Assistant", summary: "Chat with Evnting AI to get quick answers about your business.", body: ["Ask things like 'how much did I earn last month?' or 'list my top 5 items'.","Can draft item descriptions and pricing recommendations."] },
  { icon: ClipboardList, title: "Orders", summary: "All incoming rental orders assigned to you.", body: ["Accept or decline new orders.","Update status from accepted → in_progress → out_for_delivery → delivered → completed.","Status changes immediately reflect in the customer's My Orders."] },
  { icon: Boxes, title: "My Packages", summary: "Pre-built bundles you offer (e.g. Wedding-in-a-box).", body: ["Group multiple items + services into a single saleable bundle.","Bundles show up in customer Bundle Events tab."] },
  { icon: Gift, title: "Bundle Events", summary: "Customer-booked theme packages.", body: ["When a client buys one of your bundles, it lands here.","Manage delivery + fulfilment for the whole bundle in one place."] },
  { icon: Truck, title: "Deliveries", summary: "End-to-end delivery lifecycle with photo proof.", body: ["Pending → Assigned → Picked Up → In Transit → Delivered → Returned.","Driver location auto-tracking via GPS.","Delivery + Photo and Pick Up + Photo store proof in delivery-photos bucket.","Customer can track live on /track-delivery/<id>."] },
  { icon: MessageSquare, title: "Chat", summary: "Direct chat with each customer (Uber-style).", body: ["A thread is auto-created the moment a customer books.","Send text, images, files. Read receipts supported.","Thread stays open until the event finishes."] },
  { icon: Package, title: "Inventory", summary: "Your full catalogue of items, venues, or crew.", body: ["+ Add Item to list anything new.","AI helpers polish descriptions, suggest categories, estimate logistics.","Toggle availability per item or by date range.","Variants supported (e.g. chair colour, size)."] },
  { icon: ShoppingBag, title: "Shop Products", summary: "Event Essentials products you sell on the quick-commerce side.", body: ["Different from rentals — these are products customers buy outright (balloons, return gifts, etc.).","Manage stock and pricing here."] },
  { icon: PartyPopper, title: "Shop Orders", summary: "Customer orders for your Essentials products.", body: ["Process and dispatch like a normal e-commerce order."] },
  { icon: UserCheck, title: "Employees", summary: "Staff you've added to help run the business.", body: ["Add staff with limited permissions (operations / payroll / inventory).","Each employee gets their own login and audit trail."] },
  { icon: ListTodo, title: "Tasks", summary: "Internal task tracker for your team.", body: ["Assign tasks tied to events or orders.","Status: pending / in progress / done."] },
  { icon: IndianRupee, title: "Payroll", summary: "Salary and payouts for your employees.", body: ["Configure salaries, mark months paid, track owed amounts."] },
  { icon: Users, title: "Labor", summary: "On-demand labor (loaders, helpers) you hire per event.", body: ["Track hours and per-event payouts."] },
  { icon: TrendingUp, title: "Earnings", summary: "Total payouts, monthly breakdown, settlement status.", body: ["See completed payouts and pending settlements.","Per-order breakdown of platform fee, transport, manpower, your payout."] },
  { icon: TrendingDown, title: "Spending", summary: "Track your operational expenses.", body: ["Manual entry of costs for transport, labor, materials.","Net profit calculated against your earnings."] },
  { icon: FileText, title: "Quotes", summary: "Custom quotes you send to clients for special requests.", body: ["Build a quote with line items + tax + advance.","Send via WhatsApp or email; client can accept online."] },
  { icon: BookOpen, title: "Offline Booking", summary: "Manually log bookings made outside the platform.", body: ["Useful for repeat customers who book over phone/WhatsApp.","Keeps your inventory + calendar consistent."] },
  { icon: Star, title: "Reviews", summary: "Customer reviews of your service.", body: ["Reply to reviews to build trust.","Average rating shown on your storefront."] },
  { icon: MapPin, title: "Site Visits", summary: "Schedule and track venue site-visit requests.", body: ["For venue vendors: clients can book a tour.","Confirm or reschedule from here."] },
  { icon: User, title: "Profile", summary: "Your business profile and warehouse settings.", body: ["Edit company name, contact, GST, PAN.","Manage multiple warehouses with map locations."] },
  { icon: ShieldCheck, title: "Request Services", summary: "Request access to additional service types.", body: ["By default you only see tools for the services you signed up for.","Use this to add Venue, Crew, or Essentials access — admin reviews."] },
];

const VendorHelpGuide = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Vendor Dashboard — How it works
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete tour of every tool in your dashboard and the day-to-day flows.
        </p>
      </CardHeader>
    </Card>

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

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tool Reference</CardTitle>
        <p className="text-xs text-muted-foreground">Tap any section to expand the guide.</p>
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
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Pro tips
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>• Keep <strong>Inventory</strong> photos sharp — listings with images get 4× more bookings.</p>
        <p>• Reply to <strong>Chat</strong> within the hour. The platform tracks response time.</p>
        <p>• Always upload <strong>Delivery + Photo</strong> AND <strong>Pick Up + Photo</strong> — proof protects both you and the customer.</p>
        <p>• Use <strong>Quotes</strong> for high-value custom requests instead of haggling in chat.</p>
      </CardContent>
    </Card>
  </div>
);

export default VendorHelpGuide;
