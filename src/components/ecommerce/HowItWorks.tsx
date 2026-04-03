import { Search, CalendarCheck, PartyPopper } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Search,
    title: "Browse",
    description: "Explore equipment, venues & crew for your event",
  },
  {
    num: "02",
    Icon: CalendarCheck,
    title: "Book Instantly",
    description: "Add to cart, share event details & get a quote",
  },
  {
    num: "03",
    Icon: PartyPopper,
    title: "Celebrate",
    description: "We deliver, set up & handle everything for you",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-6 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto">
          <h3 className="text-center text-2xl font-bold text-foreground mb-6 sm:mb-10">
            How It Works
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6 sm:gap-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col sm:flex-row items-center flex-1">
                {/* Step */}
                <div className="flex flex-col items-center text-center px-2 sm:px-4 flex-1">
                  <span className="text-xs font-bold text-indigo-500 mb-1.5 tracking-wider">{step.num}</span>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-2.5 sm:mb-3">
                    <step.Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" strokeWidth={1.8} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground mb-1">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>

                {/* Connector */}
                {i < steps.length - 1 && (
                  <>
                    {/* Vertical connector (mobile) */}
                    <div className="sm:hidden h-6 border-l-2 border-dashed border-primary/30 flex-shrink-0" />
                    {/* Horizontal connector (desktop) */}
                    <div className="hidden sm:block w-12 lg:w-20 border-t-2 border-dashed border-primary/30 flex-shrink-0 mt-12" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
