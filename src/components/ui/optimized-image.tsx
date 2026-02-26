import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/utils/imageAssets';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Resolve the image URL using our asset mapper
  const resolvedSrc = resolveImageUrl(src);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      onError?.();
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [resolvedSrc, onLoad, onError]);

  if (hasError) {
    return (
      <div className={cn(
        'bg-muted flex items-center justify-center text-muted-foreground',
        className
      )}>
        Failed to load image
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        loading={loading}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{ 
          aspectRatio: width && height ? `${width}/${height}` : undefined,
          willChange: 'transform'
        }}
      />
    </div>
  );
};

export default OptimizedImage;