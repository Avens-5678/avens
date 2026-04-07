import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BarChart3, Briefcase, UsersRound, ShoppingBag, PartyPopper, Newspaper,
  ClipboardList, Home, MessageCircle, Settings, HelpCircle, Sparkles, ShieldAlert, IndianRupee,
} from "lucide-react";

const QUICK_FLOWS = [
  {
    icon: ShieldAlert,
    title: "Approve a vendor",
    steps: [
      "Users → All Users → Pending Vendor Approvals panel.",
      "Click View on a pending row to see uploaded docs + photos.",
      "Approve → vendor's status flips to active and they get a WhatsApp.",
      "Their items appear on the marketplace immediately.",
    ],
  },
  {
    icon: ClipboardList,
    title: "Handle a new event request",
    steps: [
      "Operations → Event Requests → click new request.",
      "Use Quote Maker to draft line items + tax + advance.",
      "Send via WhatsApp / email; client accepts online.",
      "Track in Operations → Rental Orders.",
    ],
  },
  {
    icon: IndianRupee,
    title: "Configure pricing & logistics",
    steps: [
      "Ecommerce → Logistics Config to set vehicle tiers + per-km rates.",
      "Ecommerce → Pricing Rules for category markup tiers.",
      "Ecommerce → Surge Pricing for date-based multipliers.",
      "All changes apply on next cart calculation.",
    ],
  },
];

const SECTIONS = [
  { icon: BarChart3, title: "Overview", summary: "Platform-wide KPIs: revenue, orders, signups, conversion.", body: ["Live numbers + trend sparklines.","Click any KPI to drill into the source list."] },
  {
    icon: Briefcase, title: "Operations",
    summary: "Day-to-day: orders, requests, quotes, reviews, chat moderation, loyalty.",
    body: [
      "Event Center — single command center for live events.",
      "Rental Orders — every order placed via Cart, with status timeline.",
      "Event Requests — full-event planning requests from clients.",
      "Quote Maker — build & send line-item quotes with razorpay-link.",
      "Reviews — moderate / approve / reply.",
      "Chat Moderation — flag profanity, contact-info leaks.",
      "Loyalty Program — manage tiers, points, redemptions.",
    ],
  },
  {
    icon: UsersRound, title: "Users",
    summary: "Vendor approval workflow + all-users table.",
    body: [
      "Pending Vendor Approvals appears at the top with badge count.",
      "All Users — search/filter clients, vendors, employees, admins.",
      "Vendor Inventory — admin view of every vendor's catalogue with verify toggle and per-item Logistics Estimate editor.",
    ],
  },
  {
    icon: ShoppingBag, title: "Ecommerce",
    summary: "Marketplace configuration.",
    body: [
      "Rentals — admin-curated rentals (separate from vendor inventory).",
      "Promo Banners + Trust Strip — homepage merchandising.",
      "Logistics Config — vehicle tiers, base fare, per-km rates.",
      "Pricing Rules — markup tiers per category.",
      "Surge Pricing — date / event-type multipliers.",
      "Service Cities — radius & active cities.",
    ],
  },
  {
    icon: PartyPopper, title: "Essentials",
    summary: "Quick-commerce vertical (shop products, not rentals).",
    body: ["Categories, products, theme bundles for the Essentials shop."],
  },
  {
    icon: Newspaper, title: "CMS",
    summary: "Content + offers.",
    body: ["Coupons, featured items, promo banners, site settings."],
  },
  {
    icon: ClipboardList, title: "Content",
    summary: "Static site content blocks.",
    body: ["Portfolio, testimonials, forms, FAQ entries."],
  },
  {
    icon: Home, title: "Website",
    summary: "Landing-page sections.",
    body: ["Banners, services, events, clients, About, Awards & News, Audio."],
  },
  {
    icon: MessageCircle, title: "WhatsApp",
    summary: "Meta WhatsApp Business API console.",
    body: [
      "Live Chat — incoming customer messages with reply box.",
      "Campaigns — bulk template sends.",
      "Message Logs — every send/receive with status.",
      "Contacts — customer phonebook.",
      "Templates — Meta-approved templates list.",
      "Settings — webhook + token config.",
    ],
  },
  {
    icon: Settings, title: "Settings",
    summary: "Platform admin settings.",
    body: ["AI Testing harness, third-party integrations, your admin profile."],
  },
];

const AdminHelpGuide = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Admin Dashboard — How it works
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Map of every admin tool and the workflows you'll run most often.
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
        <CardTitle className="text-base">Section reference</CardTitle>
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
        <p>• Approve vendors fast — every hour delayed costs the marketplace inventory.</p>
        <p>• Watch <strong>Chat Moderation</strong> daily for off-platform contact attempts.</p>
        <p>• Keep <strong>Surge Pricing</strong> in sync with festival calendars.</p>
        <p>• Run <strong>Pending Vendor Approvals</strong> first thing every morning.</p>
      </CardContent>
    </Card>
  </div>
);

export default AdminHelpGuide;
