import { getReleaseImages } from './discogsService';
import { searchReleaseIds } from './discogsService';

// Get only the first image for initial load
export const getInitialImage = async (releaseId: string, apiSource: 'itunes' | 'discogs', coverUrl?: string): Promise<{image: string, totalImages: number, releaseId?: string}> => {
  if (apiSource === 'itunes') {
    // For iTunes, start with the large cover image
    if (!coverUrl) {
      return { image: 'https://via.placeholder.com/600x600/333/fff?text=No+Cover', totalImages: 0 };
    }
    
    const largeImageUrl = coverUrl.replace(/\d+x\d+bb\.jpg/, '1000x1000bb.jpg');
    return { image: largeImageUrl, totalImages: 0 }; // Will be updated later
  } else {
    // For Discogs, get the first image
    try {
      const images = await getReleaseImages(releaseId);
      if (images.length > 0) {
        return { image: images[0], totalImages: Math.min(images.length, MAX_IMAGES), releaseId };
      }
    } catch (error) {
      console.warn('Could not fetch initial Discogs image:', error);
    }
    
    return { image: 'https://via.placeholder.com/600x600/333/fff?text=No+Cover', totalImages: 0 };
  }
};

// Cache for Discogs results to avoid repeated calls
const discogsCache = new Map<string, { images: string[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_IMAGES = 10; // Maximum number of images to show

// Get all images (for lazy loading)
export const getAllImages = async (
  releaseId: string,
  apiSource: 'itunes' | 'discogs',
  coverUrl?: string,
  albumTitle?: string,
  artist?: string,
  onPartialImages?: (images: string[]) => void,
): Promise<string[]> => {
  if (apiSource === 'itunes') {
    // When using iTunes for search, we'll try to find the same album in Discogs for more images
    const cacheKey = `${artist} ${albumTitle}`;
    
    // Check cache first
    const cached = discogsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached Discogs results for:', cacheKey);
      onPartialImages?.(cached.images);
      return cached.images;
    }
    
    // Fallback: use iTunes image if Discogs search fails
    if (!coverUrl) {
      const fallback = ['https://via.placeholder.com/600x600/333/fff?text=No+Cover'];
      onPartialImages?.(fallback);
      return fallback;
    }

    const iTunesImage = coverUrl.replace(/\d+x\d+bb\.jpg/, '1000x1000bb.jpg');
    onPartialImages?.([iTunesImage]);
    
    // Search for album in Discogs using title and artist
    const searchTerm = `${artist} ${albumTitle}`;
    console.log('Searching Discogs for:', searchTerm);
    
    let discogsReleaseIds: string[];
    try {
      discogsReleaseIds = await searchReleaseIds(searchTerm);
    } catch (searchError) {
      console.warn('Discogs search failed, using fallback:', searchError);
      
      // Use iTunes fallback for any Discogs error
      return [iTunesImage];
    }
    
    console.log('Discogs release ids found:', discogsReleaseIds?.length || 0);
    
    // Find the best match (first result is usually the most relevant)
    if (discogsReleaseIds && discogsReleaseIds.length > 0) {
      const bestMatchId = discogsReleaseIds[0];
      console.log('Best match ID:', bestMatchId);
      
      // Get all images from Discogs for this release
      let discogsImages;
      try {
        discogsImages = await getReleaseImages(bestMatchId);
      } catch (imageError) {
        console.warn('Failed to get images for release, using iTunes fallback:', imageError);
        
        // If Discogs attempt fails, use iTunes fallback
        const largeImageUrl = coverUrl.replace(/\d+x\d+bb\.jpg/, '1000x1000bb.jpg');
        return [largeImageUrl];
      }
      
      console.log('Images found for release:', discogsImages.length);
      
      if (discogsImages.length > 0) {
        // Combine iTunes image (first) with Discogs images (avoiding duplicates)
        const allImages = [iTunesImage];
        
        // Add Discogs images that are different from iTunes image
        for (const discogsImage of discogsImages) {
          if (discogsImage !== iTunesImage && allImages.length < MAX_IMAGES) {
            allImages.push(discogsImage);
            onPartialImages?.([...allImages]);
          }
        }
        
        console.log('Returning combined images:', allImages.length, '(iTunes + Discogs)');
        
        // Cache the results
        discogsCache.set(cacheKey, { images: allImages, timestamp: Date.now() });
        
        return allImages;
      }
    }
    
    // No Discogs results found, return just iTunes image
    console.warn('No Discogs results found, returning iTunes image only');
    return [iTunesImage];
  } else {
    // For Discogs, use the existing function
    const images = await getReleaseImages(releaseId);
    // Limit to maximum MAX_IMAGES images
    const limitedImages = images.slice(0, MAX_IMAGES);
    if (limitedImages.length > 0) {
      const progressiveImages: string[] = [];
      for (const image of limitedImages) {
        progressiveImages.push(image);
        onPartialImages?.([...progressiveImages]);
      }
    }
    return limitedImages;
  }
};

// Keep the old function for compatibility
export const getAlbumImages = getAllImages;
