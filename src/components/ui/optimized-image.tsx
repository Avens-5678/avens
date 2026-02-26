import { useState } from 'react';
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
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveImageUrl(src);

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
      src={resolvedSrc}
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