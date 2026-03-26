import { Search, CalendarCheck, PartyPopper } from "lucide-react";

const steps = [
  {
    num: 1,
    Icon: Search,
    title: "Browse",
    description: "Explore equipment, venues & crew for your event",
  },
  {
    num: 2,
    Icon: CalendarCheck,
    title: "Book Instantly",
    description: "Add to cart, share event details & get a quote",
  },
  {
    num: 3,
    Icon: PartyPopper,
    title: "Celebrate",
    description: "We deliver, set up & handle everything for you",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-8 sm:py-10 bg-muted/40 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6 sm:mb-8">
          How It Works
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center sm:flex-1">
              {/* Step */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-3 relative">
                  <step.Icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-0.5">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block w-12 lg:w-20 border-t-2 border-dashed border-primary/30 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
