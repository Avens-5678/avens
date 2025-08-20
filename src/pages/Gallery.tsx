import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout/Layout";
import { useEvents, usePortfolio } from "@/hooks/useData";
import { ArrowLeft, Camera } from "lucide-react";
import { useState } from "react";
import Lightbox from "@/components/Portfolio/Lightbox";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";

const Gallery = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const { data: allPortfolio, isLoading } = usePortfolio();
  const { data: events } = useEvents();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Find the specific portfolio item
  const portfolioItem = allPortfolio?.find(item => item.id === portfolioId);
  const event = events?.find(e => e.id === portfolioItem?.event_id);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Get images for this specific portfolio item only
  const portfolioImages = portfolioItem && !portfolioItem.is_before_after ? [portfolioItem] : [];
  const beforeAfterImages = portfolioItem && portfolioItem.is_before_after ? [portfolioItem] : [];
  
  // Extended type to include before/after fields
  type ExtendedPortfolioItem = typeof portfolioItem & {
    before_image_url?: string;
    after_image_url?: string;
  };
  
  const extendedPortfolioItem = portfolioItem as ExtendedPortfolioItem;
  
  // Debug logging for before/after functionality
  console.log('Gallery Debug:', {
    portfolioItemId: portfolioItem?.id,
    isBeforeAfter: portfolioItem?.is_before_after,
    beforeImageUrl: extendedPortfolioItem?.before_image_url,
    afterImageUrl: extendedPortfolioItem?.after_image_url,
    beforeAfterImagesLength: beforeAfterImages.length,
    shouldShowSlider: beforeAfterImages.length > 0 && extendedPortfolioItem?.before_image_url && extendedPortfolioItem?.after_image_url
  });
  
  // Get all images including bulk uploaded ones
  const getAllImages = () => {
    const images: any[] = [];
    
    // Add the portfolio item cover image if it's not a before/after item
    if (portfolioItem && !portfolioItem.is_before_after) {
      images.push({ ...portfolioItem, type: 'cover' });
    }
      
    // Add bulk album images if they exist
    if (portfolioItem?.album_url) {
      const albumUrls = portfolioItem.album_url.split(',').map((url: string) => url.trim()).filter(Boolean);
      albumUrls.forEach((url, index) => {
        images.push({
          id: `${portfolioItem.id}_album_${index}`,
          title: `${portfolioItem.title} - Image ${index + 1}`,
          image_url: url,
          tag: portfolioItem.tag,
          type: 'album'
        });
      });
    }
    
    return images;
  };
  
  const allImages = getAllImages();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Layout>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Camera className="mr-2 h-4 w-4" />
              Gallery
            </Badge>
            <h1 className="mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {portfolioItem?.title || "Project Gallery"}
            </h1>
            <Button asChild variant="outline" className="mb-8">
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {allImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allImages.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-background/90 text-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Click to view
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      {item.type === 'cover' && (
                        <Badge variant="secondary" className="text-xs">Cover</Badge>
                      )}
                    </div>
                    {item.tag && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.tag}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">No Gallery Images</h3>
              <p className="text-muted-foreground">
                Images for this portfolio project will appear here once they're added.
              </p>
            </div>
          )}

          {beforeAfterImages.length > 0 && extendedPortfolioItem?.before_image_url && extendedPortfolioItem?.after_image_url && (
            <div className="mt-20">
              <h2 className="text-center mb-12">Before & After Transformation</h2>
              <div className="max-w-4xl mx-auto">
                <BeforeAfterSlider
                  beforeImage={extendedPortfolioItem.before_image_url}
                  afterImage={extendedPortfolioItem.after_image_url}
                  beforeLabel="Before"
                  afterLabel="After"
                  className="mb-6"
                />
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">{portfolioItem.title}</h3>
                  {portfolioItem.tag && (
                    <Badge variant="outline" className="text-sm">
                      {portfolioItem.tag}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lightbox */}
          <Lightbox
            images={[...allImages, ...beforeAfterImages]}
            currentIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;