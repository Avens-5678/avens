import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Phone, Mail, User, HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { AnimatedText } from "@/components/ui/animated-text";
import { useActiveFAQ } from "@/hooks/useData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// All FAQs are now stored in the database

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const { data: faqs, isLoading } = useActiveFAQ();

  // Use database data directly
  const faqData = faqs || [];

  // Filter FAQs based on search term and category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(faqData.map(faq => faq.category)))];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-primary/5">
        {/* Header Section */}
        <section className="relative py-20 lg:py-28">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <AnimatedText>
              <Badge variant="secondary" className="mb-6 rounded-full px-6 py-2">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help Center
              </Badge>
            </AnimatedText>
            
            <AnimatedText delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
            </AnimatedText>
            
            <AnimatedText delay={400}>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                Find answers to common questions about our event planning services, rentals, and booking process.
              </p>
            </AnimatedText>

            <AnimatedText delay={600}>
              <Button asChild variant="outline" className="mb-8">
                <Link to="/" className="inline-flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </AnimatedText>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="relative py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="glassmorphism-card border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for answers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-lg border-0 bg-muted/50 focus:bg-background"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-full ${
                          selectedCategory === category 
                            ? "bg-primary text-primary-foreground shadow-glow-blue" 
                            : "hover:shadow-glow-blue/50"
                        }`}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {filteredFAQs.length > 0 ? (
              <Card className="glassmorphism-card border-0 shadow-xl">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border-0 bg-muted/30 rounded-xl px-6 hover:bg-muted/50 transition-all duration-300"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-6">
                          <div className="flex items-start space-x-4">
                            <Badge variant="outline" className="mt-1 shrink-0">
                              {faq.category}
                            </Badge>
                            <span className="font-semibold text-lg">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-6">
                          <div className="ml-20">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card className="glassmorphism-card border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search terms or browse all categories.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Card className="glassmorphism-card border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Our team is here to help! Get in touch with us for personalized assistance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                    <MessageCircle className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Chat with our WhatsApp bot for instant assistance
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                    <Phone className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Call Us</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Speak directly with our event specialists
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                    <Mail className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Send us your questions and we'll respond quickly
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Button asChild size="lg" className="glassmorphism-btn">
                    <Link to="/services">
                      Explore Our Services
                    </Link>
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Want to learn more about our story?{" "}
                    <Link to="/about" className="text-primary hover:underline font-medium">
                      Visit our About page
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FAQ;