import { useEvent, usePortfolio } from "@/hooks/useData";
import { Building, Shield, Users, Award, Flag, Scale, Crown } from "lucide-react";
import EventPageTemplate from "@/components/templates/EventPageTemplate";
import governmentHero from "@/assets/government-events-hero.jpg";

const GovernmentEvents = () => {
  const { data: event, isLoading } = useEvent("government");
  const { data: portfolio } = usePortfolio();

  const governmentPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('government') || 
    item.tag?.toLowerCase().includes('official') ||
    item.tag?.toLowerCase().includes('ceremony')
  )?.slice(0, 3);

  const eventSpecialties = [
    {
      title: "State Ceremonies",
      image: governmentHero,
      description: "Official ceremonies with proper protocol and dignity"
    },
    {
      title: "Diplomatic Functions", 
      image: governmentHero,
      description: "International events requiring cultural sensitivity"
    },
    {
      title: "Public Engagements",
      image: governmentHero, 
      description: "Community events and public speaking engagements"
    }
  ];

  const leftServices = [
    { icon: Scale, text: "Protocol Management" },
    { icon: Shield, text: "Security Coordination" },
    { icon: Crown, text: "Ceremonial Planning" },
    { icon: Users, text: "VIP Guest Management" }
  ];

  const rightServices = [
    { icon: Users, text: "Media & Press Coordination" },
    { icon: Building, text: "Diplomatic Relations" },
    { icon: Award, text: "Official Documentation" },
    { icon: Flag, text: "& So Much More" }
  ];

  const processSteps = [
    {
      icon: Flag,
      title: "Step 1: Protocol Assessment",
      description: "We conduct thorough consultation to understand official requirements, security protocols, and ceremonial procedures specific to your government event.",
      number: 1
    },
    {
      icon: Scale,
      title: "Step 2: Strategic Planning",
      description: "Our experienced team creates detailed plans that comply with all official standards, security requirements, and diplomatic protocols.",
      number: 2
    },
    {
      icon: Crown,
      title: "Step 3: Flawless Execution",
      description: "We coordinate with all necessary agencies and officials to ensure your government event is executed with the dignity and professionalism it deserves.",
      number: 3
    }
  ];

  return (
    <EventPageTemplate
      eventType="government"
      eventTitle="Government Events"
      heroSubtitle="Official Events With Distinction"
      description={event?.description || "At Evnting, we specialize in government and official events that require the highest standards of protocol, security, and professionalism. From state ceremonies to diplomatic functions, we ensure every detail meets official requirements."}
      heroImage={governmentHero}
      eventIcon={Building}
      eventSpecialties={eventSpecialties}
      leftServices={leftServices}
      rightServices={rightServices}
      processSteps={processSteps}
      portfolioItems={governmentPortfolio}
      ctaTitle="Ready to Plan Your"
      ctaSubtitle="Official Event?"
      ctaDescription="Government events require special expertise and attention to protocol. Our experienced team understands the unique requirements of official functions and will ensure your event meets the highest standards of professionalism and dignity."
      isLoading={isLoading}
    />
  );
};

export default GovernmentEvents;