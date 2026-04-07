import { Search, CalendarCheck, PartyPopper } from "lucide-react";

const steps = [
  { Icon: Search, title: "Browse" },
  { Icon: CalendarCheck, title: "Book" },
  { Icon: PartyPopper, title: "Celebrate" },
];

const HowItWorks = () => {
  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-evn-50 flex items-center justify-center">
                  <step.Icon className="h-4 w-4 text-evn-600" strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-700">{step.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 border-t border-dashed border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
