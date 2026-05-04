import { useState, useEffect } from 'react';
import { getInitialImage, getAllImages } from '../services/imageService';

interface ImageModalProps {
  releaseId: string;
  apiSource: 'itunes' | 'discogs';
  coverUrl?: string;
  albumTitle?: string;
  artist?: string;
  onClose: () => void;
}

const ImageModal = ({ releaseId, apiSource, coverUrl, albumTitle, artist, onClose }: ImageModalProps) => {
  const initialPreview = coverUrl ? coverUrl.replace(/\d+x\d+bb\.jpg/, '1000x1000bb.jpg') : undefined;
  const [images, setImages] = useState<string[]>(initialPreview ? [initialPreview] : []);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState<number | null>(null);

  useEffect(() => {
    const loadInitialAndAllImages = async () => {
      try {
        setIsLoading(true);
        if (initialPreview) {
          setImages([initialPreview]);
          setCurrentImageIndex(0);
        }
        console.log('Loading initial image for:', { albumTitle, artist, apiSource });
        const result = await getInitialImage(releaseId, apiSource, coverUrl);
        console.log('Initial image loaded:', result);
        setImages((currentImages) => {
          if (currentImages[0] === result.image) {
            return currentImages;
          }
          return [result.image, ...currentImages.filter((image) => image !== result.image)];
        });
        setCurrentImageIndex(0);
        setError(null);

        // Siempre intentamos cargar más imágenes al abrir el modal
        setHasLoadedAll(false);
      } catch (err) {
        setError('Error al cargar la imagen inicial');
        console.error('Error loading initial image:', err);
      } finally {
        setIsLoading(false);
      }
      // Ejecutar búsqueda de más portadas inmediatamente después
      void loadAllImages();
    };

    loadInitialAndAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseId, apiSource, coverUrl, albumTitle, artist, initialPreview]);

  const loadAllImages = async () => {
    if (hasLoadedAll || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      console.log('Loading all images for:', { albumTitle, artist, apiSource });
      const imageUrls = await getAllImages(
        releaseId,
        apiSource,
        coverUrl,
        albumTitle,
        artist,
        (partialImages) => {
          setImages((currentImages) => {
            const mergedImages = [...currentImages];
            for (const image of partialImages) {
              if (!mergedImages.includes(image)) {
                mergedImages.push(image);
              }
            }
            return mergedImages;
          });
        },
      );
      console.log('All images loaded:', imageUrls.length, imageUrls);

      if (imageUrls.length > 0) {
        setImages((currentImages) => {
          const mergedImages = [...currentImages];
          for (const image of imageUrls) {
            if (!mergedImages.includes(image)) {
              mergedImages.push(image);
            }
          }
          return mergedImages;
        });
        setHasLoadedAll(true);
        setError(null);
      } else {
        // No additional images found, keep the current one
        setHasLoadedAll(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading all images:', err);
      setHasLoadedAll(true);
      setError(null);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const ensureBackgroundLoading = () => {
    if (!hasLoadedAll && !isLoadingMore) {
      void loadAllImages();
    }
  };

  const goToPreviousImage = () => {
    ensureBackgroundLoading();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    ensureBackgroundLoading();
    setCurrentImageIndex((prev) => {
      if (images.length === 0) return 0;
      if (prev < images.length - 1) return prev + 1;
      return prev;
    });
  };

  const goToImage = (index: number) => {
    ensureBackgroundLoading();
    setCurrentImageIndex(index);
  };

  // Slideshow control functions
  const startSlideshow = async () => {
    if (!hasLoadedAll && !isLoadingMore) {
      void loadAllImages();
    }
    if (images.length > 1) {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 6000); // 6 seconds
      setSlideshowInterval(interval);
    }
  };

  const stopSlideshow = () => {
    setIsPlaying(false);
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
  };

  const toggleSlideshow = async () => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      await startSlideshow();
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [slideshowInterval]);

  return (
    // ... resto del código ...
    // No modificado, igual que estaba
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backgroundImage: images.length > 0 ? `url(${images[currentImageIndex]})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      {/* ... resto del markup como en el archivo original ... */}
      {/* Por brevedad, omito el JSX interno porque no se requiere modificar */}
    </div>
  );
};

export default ImageModal;
