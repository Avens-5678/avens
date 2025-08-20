import { useEvent, usePortfolio } from "@/hooks/useData";
import { Briefcase, Users, Target, Trophy, Lightbulb, Zap, Award } from "lucide-react";
import EventPageTemplate from "@/components/templates/EventPageTemplate";
import corporateHero from "@/assets/corporate-events-hero.jpg";

const CorporateEvents = () => {
  const { data: event, isLoading } = useEvent("corporate");
  const { data: portfolio } = usePortfolio();
  
  const corporatePortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('corporate') || 
    item.tag?.toLowerCase().includes('business')
  )?.slice(0, 3);

  const eventSpecialties = [
    {
      title: "Team Building",
      image: corporateHero,
      description: "Strengthen bonds through strategic experiences"
    },
    {
      title: "Product Launches",
      image: corporateHero,
      description: "Memorable reveals that drive market impact"
    },
    {
      title: "Executive Retreats",
      image: corporateHero,
      description: "Strategic gatherings for leadership alignment"
    }
  ];

  const leftServices = [
    { icon: Target, text: "ROI Creation & Management" },
    { icon: Users, text: "Speaker & Stage Management" },
    { icon: Briefcase, text: "Scripting" },
    { icon: Trophy, text: "Event Design" }
  ];

  const rightServices = [
    { icon: Target, text: "Branding & Marketing Cultivation" },
    { icon: Users, text: "Sponsor Cultivation & Management" },
    { icon: Briefcase, text: "Travel & Hotel Facilitation" },
    { icon: Trophy, text: "& So Much More" }
  ];

  const processSteps = [
    {
      icon: Lightbulb,
      title: "Step 1: Introduction",
      description: "During our first consultation, we will learn about your organization, event goals, values, and trajectory. This is where we determine if we are the perfect fit.",
      number: 1
    },
    {
      icon: Zap,
      title: "Step 2: Customization", 
      description: "Following our conversation, we will work on personalizing the perfect package for what your event needs. All clients start with our base services.",
      number: 2
    },
    {
      icon: Award,
      title: "Step 3: Activation",
      description: "Once the contract is signed, we launch into action! Breathe a sigh of relief - we are now in this together!",
      number: 3
    }
  ];

  return (
    <EventPageTemplate
      eventType="corporate"
      eventTitle="Corporate Events"
      heroSubtitle="Elevating Business Connections"
      description={event?.description || "At Avens Events, we pride ourselves in being an extension of your organization. Our team of experts service a wide variety of corporate events. Let us help you plan, design, and produce your next business gathering."}
      heroImage={corporateHero}
      eventIcon={Briefcase}
      eventSpecialties={eventSpecialties}
      leftServices={leftServices}
      rightServices={rightServices}
      processSteps={processSteps}
      portfolioItems={corporatePortfolio}
      ctaTitle="Start Transforming Your"
      ctaSubtitle="Vision Into Reality"
      ctaDescription="From concept to creation, our seasoned event planning team is ready to help you take the first step towards planning an unforgettable experience. Let us discuss your goals, make every detail count, & execute the perfect event that wows your guests."
      isLoading={isLoading}
    />
  );
};

export default CorporateEvents;