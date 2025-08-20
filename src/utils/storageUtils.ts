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