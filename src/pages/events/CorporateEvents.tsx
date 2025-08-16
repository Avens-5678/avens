import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent } from "@/hooks/useData";
import { Briefcase, ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";

const CorporateEvents = () => {
  const { data: event, isLoading } = useEvent("corporate");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading corporate services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const processSteps = [
    "Understanding your business objectives and goals",
    "Strategic event planning and concept development",
    "Venue sourcing and vendor management",
    "Branding and customization alignment",
    "Logistics coordination and execution",
    "Post-event analysis and follow-up"
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
        {event?.hero_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${event.hero_image_url})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            <Briefcase className="mr-2 h-4 w-4" />
            Corporate Events
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {event?.title || "Professional Corporate Events"}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {event?.description || "Elevating your business presence through strategic event planning and professional execution"}
          </p>
        </div>
      </section>

      {/* Event Description */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Strategic Corporate Event Solutions
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {event?.description || "From conferences and product launches to team building events and corporate galas, we understand the unique requirements of business events. Our professional approach ensures your corporate gatherings reflect your brand values while achieving your business objectives."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Clock className="mr-2 h-4 w-4" />
                Our Process
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How We Execute Corporate Excellence
              </h2>
              <p className="text-xl text-muted-foreground">
                Strategic planning meets flawless execution for business success
              </p>
            </div>

            {event?.process_description ? (
              <div className="bg-background p-8 rounded-2xl shadow-lg">
                <div className="prose prose-lg max-w-none">
                  {event.process_description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-background p-6 rounded-xl shadow-sm">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium mb-2">Step {index + 1}</p>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enquire Now */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Elevate Your Corporate Events?
              </h2>
              <p className="text-xl text-muted-foreground">
                Let's discuss your business objectives and create impactful experiences
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <InquiryForm 
                  formType="inquiry"
                  eventType="corporate"
                  title="Corporate Event Inquiry"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CorporateEvents;