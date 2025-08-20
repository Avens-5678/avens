import { useEvent, usePortfolio } from "@/hooks/useData";
import { Gift, Cake, Sparkles, Heart, PartyPopper, Star, Music } from "lucide-react";
import EventPageTemplate from "@/components/templates/EventPageTemplate";
import birthdayHero from "@/assets/birthday-parties-hero.jpg";

const BirthdayParties = () => {
  const { data: event, isLoading } = useEvent("birthday");
  const { data: portfolio } = usePortfolio();

  const birthdayPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('birthday') || 
    item.tag?.toLowerCase().includes('party')
  )?.slice(0, 3);

  const eventSpecialties = [
    {
      title: "Kids Parties",
      image: birthdayHero,
      description: "Magical celebrations filled with wonder and joy"
    },
    {
      title: "Milestone Birthdays", 
      image: birthdayHero,
      description: "Elegant celebrations for life's special moments"
    },
    {
      title: "Themed Celebrations",
      image: birthdayHero, 
      description: "Custom themes bringing dreams to life"
    }
  ];

  const leftServices = [
    { icon: Sparkles, text: "Custom Theme Design" },
    { icon: Music, text: "Entertainment Coordination" },
    { icon: Cake, text: "Catering & Cake Management" },
    { icon: Gift, text: "Venue Decoration" }
  ];

  const rightServices = [
    { icon: Gift, text: "Party Favors & Gifts" },
    { icon: Star, text: "Photography & Videography" },
    { icon: PartyPopper, text: "Activity & Game Planning" },
    { icon: Heart, text: "& So Much More" }
  ];

  const processSteps = [
    {
      icon: PartyPopper,
      title: "Step 1: Dream Discovery",
      description: "We learn about the birthday person's interests, favorite colors, themes, and dream celebration to create the perfect personalized experience.",
      number: 1
    },
    {
      icon: Star,
      title: "Step 2: Creative Planning",
      description: "Our team designs a custom celebration plan, sourcing decorations, entertainment, and all the special touches that will make the day magical.",
      number: 2
    },
    {
      icon: Music,
      title: "Step 3: Party Time!",
      description: "On the big day, we handle setup, coordination, and cleanup so you can focus on celebrating and creating precious memories.",
      number: 3
    }
  ];

  return (
    <EventPageTemplate
      eventType="birthday"
      eventTitle="Birthday Parties"
      heroSubtitle="Celebrate Life's Special Moments"
      description={event?.description || "At Avens Events, we specialize in creating magical birthday celebrations that reflect personality and bring pure joy. From intimate gatherings to grand celebrations, we make every birthday unforgettable."}
      heroImage={birthdayHero}
      eventIcon={Gift}
      eventSpecialties={eventSpecialties}
      leftServices={leftServices}
      rightServices={rightServices}
      processSteps={processSteps}
      portfolioItems={birthdayPortfolio}
      ctaTitle="Ready to Create"
      ctaSubtitle="Birthday Magic?"
      ctaDescription="Let's bring your birthday vision to life! From intimate family gatherings to grand milestone celebrations, we'll handle every detail to create an unforgettable experience that celebrates this special day in style."
      isLoading={isLoading}
    />
  );
};

export default BirthdayParties;