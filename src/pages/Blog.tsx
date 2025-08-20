import { Link } from "react-router-dom";
import { useNewsAchievements } from "@/hooks/useData";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";

const Blog = () => {
  const { data: newsAchievements, isLoading } = useNewsAchievements();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="shimmer-loading h-12 w-12 rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <AnimatedText variant="fade-in-up">
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                <Calendar className="mr-2 h-4 w-4" />
                Our Blog
              </Badge>
            </AnimatedText>
            
            <AnimatedText variant="fade-in-up" delay={200}>
              <h1 className="mb-8 leading-tight">
                Latest <GradientText>News</GradientText> &<br />
                <GradientText variant="secondary">Achievements</GradientText>
              </h1>
            </AnimatedText>
            
            <AnimatedText variant="fade-in-up" delay={400}>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Stay updated with our latest milestones, industry insights, and behind-the-scenes stories from the world of luxury event planning.
              </p>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {newsAchievements && newsAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsAchievements.map((post, index) => (
                <AnimatedText 
                  key={post.id} 
                  variant="fade-in-up" 
                  delay={index * 100}
                  className="h-full"
                >
                  <Card className="glassmorphism-card hover:shadow-glow transition-all duration-500 cursor-pointer group h-full flex flex-col border-0 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-xl">
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <CardHeader className="flex-grow pb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <Clock className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-4">
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.short_content}
                      </p>
                      <div className="flex items-center justify-between">
                        <Button 
                          asChild
                          variant="ghost" 
                          className="group/btn hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 rounded-full px-6 py-2 transition-all duration-300"
                        >
                          <Link to={`/blog/${post.id}`} className="flex items-center gap-2">
                            <span className="font-medium">Read Article</span>
                            <div className="w-8 h-8 rounded-full bg-primary/10 group-hover/btn:bg-primary group-hover/btn:text-primary-foreground flex items-center justify-center transition-all duration-300">
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                            </div>
                          </Link>
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          {Math.ceil(post.content.split(' ').length / 200)} min read
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedText>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-4">No Posts Yet</h3>
                <p className="text-muted-foreground">
                  We're working on exciting content. Check back soon for our latest updates and achievements!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;