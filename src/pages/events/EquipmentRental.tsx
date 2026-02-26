import { useAllRentals, usePortfolio } from "@/hooks/useData";
import { Package, Settings, Monitor, Volume2, Zap } from "lucide-react";
import EventPageTemplate from "@/components/templates/EventPageTemplate";
import equipmentHero from "@/assets/equipment-rental-hero.jpg";

const EquipmentRental = () => {
  const { data: rentals, isLoading } = useAllRentals();
  const { data: portfolio } = usePortfolio();

  const equipmentPortfolio = portfolio?.filter(item => 
    item.tag?.toLowerCase().includes('equipment') || 
    item.tag?.toLowerCase().includes('rental') ||
    item.tag?.toLowerCase().includes('audio') ||
    item.tag?.toLowerCase().includes('lighting')
  )?.slice(0, 3);

  const equipmentCategories = [
    {
      title: "Audio Systems",
      image: equipmentHero,
      description: "Professional sound equipment for crystal-clear audio"
    },
    {
      title: "Lighting & Visual", 
      image: equipmentHero,
      description: "Stunning lighting and projection equipment"
    },
    {
      title: "Staging & Decor",
      image: equipmentHero, 
      description: "Professional staging and decorative elements"
    }
  ];

  const leftServices = [
    { icon: Volume2, text: "Professional Audio Systems" },
    { icon: Zap, text: "Lighting & Visual Effects" },
    { icon: Settings, text: "Staging & Platforms" },
    { icon: Package, text: "Power & Infrastructure" }
  ];

  const rightServices = [
    { icon: Package, text: "Delivery & Setup" },
    { icon: Settings, text: "24/7 Technical Support" },
    { icon: Monitor, text: "Event Day Operation" },
    { icon: Zap, text: "& So Much More" }
  ];

  const processSteps = [
    {
      icon: Monitor,
      title: "Step 1: Consultation",
      description: "We assess your event needs, venue requirements, and technical specifications to recommend the perfect equipment package for your occasion.",
      number: 1
    },
    {
      icon: Volume2,
      title: "Step 2: Setup & Testing",
      description: "Our professional technicians deliver, install, and thoroughly test all equipment to ensure everything is working perfectly for your event.",
      number: 2
    },
    {
      icon: Zap,
      title: "Step 3: Event Support",
      description: "We provide on-site technical support during your event and handle the complete breakdown and pickup once your celebration concludes.",
      number: 3
    }
  ];

  return (
    <EventPageTemplate
      eventType="equipment"
      eventTitle="Equipment Rental"
      heroSubtitle="Professional Grade Event Equipment"
      description="At Evnting, we provide top-tier professional equipment rentals with full-service support. From audio-visual systems to staging and lighting, we ensure your event has the technical excellence it deserves."
      heroImage={equipmentHero}
      eventIcon={Package}
      eventSpecialties={equipmentCategories}
      leftServices={leftServices}
      rightServices={rightServices}
      processSteps={processSteps}
      portfolioItems={equipmentPortfolio}
      ctaTitle="Ready to Elevate Your"
      ctaSubtitle="Event Technology?"
      ctaDescription="Whether you need basic audio support or a complete technical production, our professional equipment and expert technicians ensure your event sounds amazing and looks spectacular."
      isLoading={isLoading}
    />
  );
};

export default EquipmentRental;