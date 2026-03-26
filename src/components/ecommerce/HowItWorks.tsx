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
    <section className="py-5 sm:py-10 bg-muted/40 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <h3 className="text-center text-[10px] sm:text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 sm:mb-8">
          How It Works
        </h3>

        <div className="flex items-start justify-center gap-2 sm:gap-0 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center flex-1 sm:flex-1">
              {/* Step */}
              <div className="flex flex-col items-center text-center px-1 sm:px-4 flex-1">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-2 sm:mb-3 relative">
                  <step.Icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" strokeWidth={1.8} />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h4 className="text-[11px] sm:text-sm font-bold text-foreground mb-0.5">{step.title}</h4>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-snug max-w-[100px] sm:max-w-[180px]">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="w-4 sm:w-12 lg:w-20 border-t-2 border-dashed border-primary/30 flex-shrink-0 mt-5 sm:mt-7" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
