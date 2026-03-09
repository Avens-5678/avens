import { useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveImageUrl, getOptimizedImageUrl } from '@/utils/imageAssets';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  /** Quality for Supabase image transform (default 75) */
  quality?: number;
  /** Whether to apply Supabase image optimization (default true) */
  optimize?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
  quality = 75,
  optimize = true,
}: OptimizedImageProps) => {
  const [hasError, setHasError] = useState(false);
  
  // First resolve any asset paths, then apply optimization
  const resolvedSrc = resolveImageUrl(src);
  const finalSrc = optimize 
    ? getOptimizedImageUrl(resolvedSrc, width || 600, quality)
    : resolvedSrc;

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
    <img
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={onLoad}
      onError={() => { setHasError(true); onError?.(); }}
      className={className}
    />
  );
};

export default OptimizedImage;
