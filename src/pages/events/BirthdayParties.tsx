import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import InquiryForm from "@/components/Forms/InquiryForm";
import { useEvent } from "@/hooks/useData";
import { Gift, ArrowRight, Calendar, Clock, CheckCircle } from "lucide-react";

const BirthdayParties = () => {
  const { data: event, isLoading } = useEvent("birthday");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading birthday services...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const processSteps = [
    "Understanding the birthday person's preferences and theme",
    "Venue selection and decoration planning",
    "Entertainment and activity coordination",
    "Catering and cake arrangements",
    "Photography and memory creation",
    "Cleanup and post-party services"
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
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
            <Gift className="mr-2 h-4 w-4" />
            Birthday Parties
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {event?.title || "Unforgettable Birthday Celebrations"}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {event?.description || "Creating magical birthday memories with personalized themes and joyful celebrations"}
          </p>
        </div>
      </section>

      {/* Event Description */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Celebrate Life's Special Moments
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {event?.description || "Birthdays are milestones worth celebrating in style. Whether it's a child's first birthday, a sweet sixteen, or a milestone celebration, we create personalized experiences that reflect the birthday person's personality and bring joy to all attendees."}
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
                How We Create Birthday Magic
              </h2>
              <p className="text-xl text-muted-foreground">
                From concept to celebration, every detail is planned with care
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
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Plan an Amazing Birthday Party?
              </h2>
              <p className="text-xl text-muted-foreground">
                Let's create unforgettable memories for your special celebration
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <InquiryForm 
                  formType="inquiry"
                  eventType="birthday"
                  title="Birthday Party Inquiry"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BirthdayParties;