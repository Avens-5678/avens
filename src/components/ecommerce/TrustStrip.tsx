import { Truck, Shield, Headphones, RotateCcw } from "lucide-react";

const benefits = [
  { icon: Truck, text: "Free Delivery above ₹10,000" },
  { icon: Shield, text: "Trusted by 500+ Events" },
  { icon: Headphones, text: "24/7 Expert Support" },
  { icon: RotateCcw, text: "Easy Returns & Refunds" },
];

const TrustStrip = () => (
  <section className="border-b border-border bg-primary-soft">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between gap-4 py-2.5 overflow-x-auto scrollbar-hide">
        {benefits.map((b) => (
          <div key={b.text} className="flex items-center gap-2 flex-shrink-0">
            <b.icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground whitespace-nowrap">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
