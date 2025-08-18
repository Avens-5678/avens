import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout/Layout";
import { useAboutContent, useNewsAchievements } from "@/hooks/useData";
import { Quote, User, Target, Eye, Award } from "lucide-react";

const About = () => {
  const { data: aboutContent, isLoading: loadingAbout } = useAboutContent();
  const { data: newsAchievements, isLoading: loadingNews } = useNewsAchievements();

  if (loadingAbout || loadingNews) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading about us...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <User className="mr-2 h-4 w-4" />
            About Us
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Passionate about creating extraordinary experiences and unforgettable moments for every occasion.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      {aboutContent && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge variant="outline" className="mb-4">
                    Meet Our Founder
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {aboutContent.founder_name}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {aboutContent.founder_note}
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-primary">
                    <Quote className="h-8 w-8 text-primary mb-4" />
                    <blockquote className="text-lg italic text-foreground">
                      "{aboutContent.founder_quote}"
                    </blockquote>
                    <cite className="text-sm text-muted-foreground mt-2 block">
                      - {aboutContent.founder_name}
                    </cite>
                  </div>
                </div>

                {aboutContent.founder_image_url && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
                      <img 
                        src={aboutContent.founder_image_url} 
                        alt={aboutContent.founder_name}
                        className="relative rounded-2xl shadow-xl max-w-md w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {aboutContent && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 bg-background hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-bold">Our Mission</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {aboutContent.mission_statement}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-background hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Eye className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle className="text-2xl font-bold">Our Vision</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {aboutContent.vision_statement}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full About Text */}
      {aboutContent && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
                  {aboutContent.full_about_text.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </Layout>
  );
};

export default About;