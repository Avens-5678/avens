// Import all hero images
import corporateExhibitionsHero from '@/assets/corporate-exhibitions-hero.jpg';
import weddingEventsHero from '@/assets/wedding-events-hero.jpg';
import governmentEventsHero from '@/assets/government-events-hero.jpg';
import entertainmentLifestyleHero from '@/assets/entertainment-lifestyle-hero.jpg';
import sportsOutdoorHero from '@/assets/sports-outdoor-hero.jpg';
import equipmentRentalHero from '@/assets/equipment-rental-hero.jpg';
import healthcareMedicalHero from '@/assets/healthcare-medical-hero.jpg';
import birthdayPartiesHero from '@/assets/birthday-parties-hero.jpg';

// Map of asset paths to imported images
const assetMap: Record<string, string> = {
  '/src/assets/corporate-exhibitions-hero.jpg': corporateExhibitionsHero,
  '/src/assets/wedding-events-hero.jpg': weddingEventsHero,
  '/src/assets/government-events-hero.jpg': governmentEventsHero,
  '/src/assets/entertainment-lifestyle-hero.jpg': entertainmentLifestyleHero,
  '/src/assets/sports-outdoor-hero.jpg': sportsOutdoorHero,
  '/src/assets/equipment-rental-hero.jpg': equipmentRentalHero,
  '/src/assets/healthcare-medical-hero.jpg': healthcareMedicalHero,
  '/src/assets/birthday-parties-hero.jpg': birthdayPartiesHero,
  // Also map without leading slash
  'src/assets/corporate-exhibitions-hero.jpg': corporateExhibitionsHero,
  'src/assets/wedding-events-hero.jpg': weddingEventsHero,
  'src/assets/government-events-hero.jpg': governmentEventsHero,
  'src/assets/entertainment-lifestyle-hero.jpg': entertainmentLifestyleHero,
  'src/assets/sports-outdoor-hero.jpg': sportsOutdoorHero,
  'src/assets/equipment-rental-hero.jpg': equipmentRentalHero,
  'src/assets/healthcare-medical-hero.jpg': healthcareMedicalHero,
  'src/assets/birthday-parties-hero.jpg': birthdayPartiesHero,
};

/**
 * Resolves an image path to an actual URL.
 * - If the path is in our asset map, return the imported image
 * - If it's already a full URL (http/https), return as-is
 * - If it starts with /public or is a storage URL, return as-is
 * - Otherwise, return the original path
 */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg';
  
  // Check if it's in our asset map
  if (assetMap[path]) {
    return assetMap[path];
  }
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a Supabase storage URL pattern, return as-is
  if (path.includes('supabase.co/storage')) {
    return path;
  }
  
  // For paths starting with /assets/ (public folder), return as-is
  if (path.startsWith('/assets/') || path.startsWith('/images/')) {
    return path;
  }
  
  // Return original path as fallback
  return path;
}

// Export individual images for direct imports if needed
export {
  corporateExhibitionsHero,
  weddingEventsHero,
  governmentEventsHero,
  entertainmentLifestyleHero,
  sportsOutdoorHero,
  equipmentRentalHero,
  healthcareMedicalHero,
  birthdayPartiesHero,
};
