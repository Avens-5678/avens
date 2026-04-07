import { useParams, Link } from "react-router-dom";
import { useNewsAchievements } from "@/hooks/useData";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2, ArrowRight } from "lucide-react";
import { AnimatedText, GradientText } from "@/components/ui/animated-text";
import { useToast } from "@/hooks/use-toast";

const BlogPost = () => {
  const { id } = useParams();
  const { data: newsAchievements, isLoading } = useNewsAchievements();
  const { toast } = useToast();

  const post = newsAchievements?.find(post => post.id === id);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        text: post?.short_content,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="shimmer-loading h-12 w-12 rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
            <Button asChild variant="outline">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Breadcrumb */}
      <section className="relative py-16 bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedText variant="fade-in-up">
              <Button asChild variant="ghost" className="mb-6 hover:bg-white/10">
                <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Blog</span>
                </Link>
              </Button>
            </AnimatedText>
            
            <AnimatedText variant="fade-in-up" delay={200}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <Calendar className="mr-2 h-3 w-3" />
                  {new Date(post.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
                </div>
              </div>
            </AnimatedText>

            <AnimatedText variant="fade-in-up" delay={400}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                <GradientText>{post.title}</GradientText>
              </h1>
            </AnimatedText>

            <AnimatedText variant="fade-in-up" delay={600}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                {post.short_content}
              </p>
            </AnimatedText>

            <AnimatedText variant="fade-in-up" delay={800}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="hover:bg-white/10 rounded-full px-4"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </AnimatedText>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Article Content */}
              <div className="lg:col-span-3">
                <AnimatedText variant="fade-in-up">
                  <article className="prose prose-lg max-w-none">
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden rounded-2xl mb-8 shadow-2xl">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="text-lg leading-relaxed text-foreground space-y-6">
                      {post.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-6 first:text-xl first:font-medium first:text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                </AnimatedText>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <AnimatedText variant="fade-in-up" delay={400}>
                  <div className="sticky top-8 space-y-8">
                    {/* Table of Contents */}
                    <Card className="glassmorphism-card border-0 bg-gradient-to-br from-background/80 to-background/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Navigation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                          Introduction
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                          Key Highlights
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                          Conclusion
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Share Options */}
                    <Card className="glassmorphism-card border-0 bg-gradient-to-br from-background/80 to-background/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Share This</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start hover:bg-primary/10"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Article
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedText>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedText variant="fade-in-up">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Continue Reading</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover more insights and stories from our latest updates
                </p>
              </div>
            </AnimatedText>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {newsAchievements
                ?.filter(p => p.id !== post.id)
                .slice(0, 2)
                .map((relatedPost, index) => (
                  <AnimatedText key={relatedPost.id} variant="fade-in-up" delay={index * 200}>
                    <Card className="glassmorphism-card hover:shadow-glow transition-all duration-500 group border-0 bg-gradient-to-br from-background/50 to-background/30">
                      <Link to={`/blog/${relatedPost.id}`}>
                        {relatedPost.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg relative">
                            <img 
                              src={relatedPost.image_url} 
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>{new Date(relatedPost.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {relatedPost.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {relatedPost.short_content}
                          </p>
                          <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all duration-300">
                            <span>Read Article</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </AnimatedText>
                ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;