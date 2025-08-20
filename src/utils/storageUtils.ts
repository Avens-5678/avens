import { supabase } from "@/integrations/supabase/client";

export const uploadSpecialtyImage = async (file: File, specialtyId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${specialtyId}-${Date.now()}.${fileExt}`;
  const filePath = `specialties/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('specialty-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('specialty-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const uploadPortfolioImage = async (file: File, eventId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${eventId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const uploadEventHeroImage = async (file: File, eventId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${eventId}/hero.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('event-hero-images')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('event-hero-images')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const uploadBulkPortfolioImages = async (files: FileList, eventId: string): Promise<string[]> => {
  const uploadPromises = Array.from(files).map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}/${Date.now()}_${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(data.path);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const uploadBannerImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `banner-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const uploadClientLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `client-logo-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteStorageFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
};

export const extractStoragePathFromUrl = (url: string): { bucket: string; path: string } | null => {
  if (!url || !url.includes('supabase.co/storage/v1/object/public/')) {
    return null;
  }

  try {
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return null;

    const [bucketAndPath] = urlParts[1].split('/');
    const bucket = bucketAndPath;
    const path = urlParts[1].substring(bucket.length + 1);

    return { bucket, path };
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
};

export const deleteMultipleStorageFiles = async (urls: string[]): Promise<{ success: string[]; failed: string[] }> => {
  const results = { success: [], failed: [] };
  
  for (const url of urls) {
    if (!url) continue;
    
    try {
      const pathInfo = extractStoragePathFromUrl(url);
      if (pathInfo) {
        await deleteStorageFile(pathInfo.bucket, pathInfo.path);
        results.success.push(url);
        console.log(`Successfully deleted file: ${url}`);
      } else {
        results.failed.push(url);
        console.warn(`Could not extract path from URL: ${url}`);
      }
    } catch (error) {
      console.error(`Failed to delete file ${url}:`, error);
      results.failed.push(url);
    }
  }

  return results;
};

export const cleanupRecordFiles = async (
  record: any,
  imageFields: string[]
): Promise<{ success: string[]; failed: string[] }> => {
  const urls: string[] = [];
  
  for (const field of imageFields) {
    const value = record[field];
    if (value) {
      if (typeof value === 'string') {
        urls.push(value);
      } else if (Array.isArray(value)) {
        urls.push(...value.filter(url => typeof url === 'string'));
      }
    }
  }

  if (urls.length === 0) {
    return { success: [], failed: [] };
  }

  return deleteMultipleStorageFiles(urls);
};

export const cleanupPortfolioFiles = async (portfolioItem: any): Promise<void> => {
  const imageFields = ['image_url', 'before_image_url', 'after_image_url'];
  const urls: string[] = [];

  // Collect single image URLs
  for (const field of imageFields) {
    if (portfolioItem[field]) {
      urls.push(portfolioItem[field]);
    }
  }

  // Handle album_url which might be a JSON string containing an array
  if (portfolioItem.album_url) {
    try {
      let albumUrls = portfolioItem.album_url;
      if (typeof albumUrls === 'string') {
        // Try to parse as JSON first
        try {
          albumUrls = JSON.parse(albumUrls);
        } catch {
          // If not JSON, treat as single URL
          albumUrls = [albumUrls];
        }
      }
      
      if (Array.isArray(albumUrls)) {
        urls.push(...albumUrls);
      } else if (typeof albumUrls === 'string') {
        urls.push(albumUrls);
      }
    } catch (error) {
      console.error('Error processing album_url:', error);
    }
  }

  if (urls.length > 0) {
    const results = await deleteMultipleStorageFiles(urls);
    if (results.failed.length > 0) {
      console.warn(`Failed to delete ${results.failed.length} files for portfolio item ${portfolioItem.id}`);
    }
    console.log(`Successfully cleaned up ${results.success.length} files for portfolio item ${portfolioItem.id}`);
  }
};

export const cleanupEventFiles = async (eventId: string): Promise<void> => {
  try {
    // Clean up hero image
    const heroImagePath = `${eventId}/hero.jpg`; // or other extensions
    try {
      await deleteStorageFile('event-hero-images', heroImagePath);
    } catch (error) {
      // Hero image might not exist or have different extension, that's ok
    }

    // Clean up all portfolio items associated with this event
    const { data: portfolioItems } = await supabase
      .from('portfolio')
      .select('*')
      .eq('event_id', eventId);

    if (portfolioItems && portfolioItems.length > 0) {
      for (const item of portfolioItems) {
        await cleanupPortfolioFiles(item);
      }
      console.log(`Cleaned up files for ${portfolioItems.length} portfolio items associated with event ${eventId}`);
    }
  } catch (error) {
    console.error(`Error cleaning up files for event ${eventId}:`, error);
    throw error;
  }
};