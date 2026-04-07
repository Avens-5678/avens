import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useAboutContent, useNewsAchievements } from "@/hooks/useData";
import { Quote, User, Target, Eye, Award, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const { data: aboutContent, isLoading: loadingAbout } = useAboutContent();
  const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();

  if (loadingAbout || loadingNews) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading about us...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 text-center max-w-6xl">
          <Badge variant="outline" className="mb-5">
            <User className="mr-2 h-3.5 w-3.5" />
            About Us
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Passionate about creating extraordinary experiences and unforgettable moments for every occasion.
          </p>
        </div>
      </section>

      {/* Founder */}
      {aboutContent && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {aboutContent.founder_image_url && (
                  <div className="flex justify-center lg:justify-end lg:order-2">
                    <div className="relative w-full max-w-sm lg:max-w-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-secondary/10 rounded-2xl transform rotate-2" />
                      <img 
                        src={aboutContent.founder_image_url} 
                        alt={aboutContent.founder_name}
                        className="relative rounded-2xl shadow-strong w-full h-[400px] lg:h-[520px] object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-6 lg:order-1">
                  <Badge variant="outline" className="mb-2">Meet Our Founder</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {aboutContent.founder_name}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {aboutContent.founder_note}
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-2xl border-l-4 border-primary">
                    <Quote className="h-6 w-6 text-primary/50 mb-3" />
                    <blockquote className="text-base italic text-foreground leading-relaxed">
                      "{aboutContent.founder_quote}"
                    </blockquote>
                    <cite className="text-sm text-muted-foreground mt-3 block font-medium">
                      — {aboutContent.founder_name}
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {aboutContent && (
        <section className="py-16 lg:py-24 bg-muted/40">
          <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/40 hover:shadow-strong transition-all duration-400 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-primary/8 rounded-xl">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">Our Mission</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{aboutContent.mission_statement}</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-strong transition-all duration-400 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-secondary/8 rounded-xl">
                      <Eye className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle className="text-xl font-bold">Our Vision</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{aboutContent.vision_statement}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Full About Text */}
      {aboutContent && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-5 sm:px-6 max-w-6xl">
            <div className="max-w-4xl mx-auto">
              <div className="text-base text-muted-foreground leading-relaxed space-y-5">
                {aboutContent.full_about_text.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/4 via-background to-secondary/3">
        <div className="container mx-auto px-5 sm:px-6 max-w-6xl text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-5">
              <HelpCircle className="mr-2 h-3.5 w-3.5" />
              Need Help?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              Find answers to common questions about our services, pricing, and event planning process.
            </p>
            <Button asChild size="lg" variant="premium">
              <Link to="/faq">
                View FAQ <HelpCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
