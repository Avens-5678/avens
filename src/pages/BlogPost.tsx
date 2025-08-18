import { useParams, Link } from "react-router-dom";
import { useNewsAchievements } from "@/hooks/useData";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          {/* Back Button */}
          <AnimatedText variant="fade-in-up">
            <Button asChild variant="ghost" className="mb-8">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </AnimatedText>

          {/* Article Header */}
          <article className="glassmorphism-card rounded-3xl overflow-hidden">
            {post.image_url && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              <AnimatedText variant="fade-in-up">
                <Badge variant="secondary" className="mb-6 px-4 py-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
              </AnimatedText>

              <AnimatedText variant="fade-in-up" delay={200}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                  <GradientText>{post.title}</GradientText>
                </h1>
              </AnimatedText>

              <AnimatedText variant="fade-in-up" delay={400}>
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleShare}
                    className="hover:text-primary"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </AnimatedText>

              <AnimatedText variant="fade-in-up" delay={600}>
                <div className="prose prose-lg max-w-none">
                  <div className="text-xl leading-relaxed text-muted-foreground mb-8">
                    {post.short_content}
                  </div>
                  <div className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>
              </AnimatedText>
            </div>
          </article>

          {/* Related Posts */}
          <AnimatedText variant="fade-in-up" delay={800} className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">More Stories</h3>
              <p className="text-muted-foreground">Discover more of our latest news and achievements</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsAchievements
                ?.filter(p => p.id !== post.id)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Card key={relatedPost.id} className="glassmorphism-card hover:shadow-glow transition-all duration-300 group">
                    <Link to={`/blog/${relatedPost.id}`}>
                      {relatedPost.image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img 
                            src={relatedPost.image_url} 
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground line-clamp-2">
                          {relatedPost.short_content}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
            </div>
          </AnimatedText>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;