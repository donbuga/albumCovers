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
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState<number | null>(null);

  useEffect(() => {
    const loadInitialImage = async () => {
      try {
        setIsLoading(true);
        console.log('Loading initial image for:', { albumTitle, artist, apiSource });
        const result = await getInitialImage(releaseId, apiSource, coverUrl, albumTitle, artist);
        console.log('Initial image loaded:', result);
        setImages([result.image]);
        setCurrentImageIndex(0);
        setError(null);
        
        // If we know there are more images, show the navigation
        if (apiSource === 'itunes') {
          // For iTunes, we don't know yet, so we'll load all when user navigates
          setHasLoadedAll(false);
        } else {
          // For Discogs, we already know the total
          setHasLoadedAll(true);
        }
      } catch (err) {
        setError('Error al cargar la imagen inicial');
        console.error('Error loading initial image:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialImage();
  }, [releaseId, apiSource, coverUrl, albumTitle, artist]);

  const loadAllImages = async () => {
    if (hasLoadedAll || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      console.log('Loading all images for:', { albumTitle, artist, apiSource });
      const imageUrls = await getAllImages(releaseId, apiSource, coverUrl, albumTitle, artist);
      console.log('All images loaded:', imageUrls.length, imageUrls);
      
      if (imageUrls.length > 0) {
        setImages(imageUrls);
        setHasLoadedAll(true);
        setError(null);
      } else {
        // No additional images found, keep the current one
        setHasLoadedAll(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading all images:', err);
      // Don't show error to user, just mark as loaded to prevent retries
      setHasLoadedAll(true);
      setError(null);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const goToPreviousImage = async () => {
    // Load all images if not loaded yet and trying to navigate
    if (!hasLoadedAll && !isLoadingMore) {
      await loadAllImages();
    }
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = async () => {
    // Load all images if not loaded yet and trying to navigate
    if (!hasLoadedAll && !isLoadingMore) {
      await loadAllImages();
    }
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = async (index: number) => {
    // Load all images if not loaded yet and trying to navigate
    if (!hasLoadedAll && !isLoadingMore) {
      await loadAllImages();
    }
    setCurrentImageIndex(index);
  };

  // Slideshow control functions
  const startSlideshow = async () => {
    if (!hasLoadedAll && !isLoadingMore) {
      await loadAllImages();
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
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <div style={{ fontSize: '18px', color: '#666' }}>Cargando imagen inicial...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <div>{error}</div>
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>No se encontraron imágenes</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
              Debug: {albumTitle} - {artist} - {apiSource}
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Loading overlay for additional images */}
            {isLoadingMore && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: '12px'
              }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '30px',
                  height: '30px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '10px'
                }}></div>
                <div style={{ fontSize: '14px', color: '#666' }}>Buscando más imágenes...</div>
              </div>
            )}
            
            {/* Main image display */}
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              flex: 1
            }}>
              {/* Show navigation buttons even if only 1 image for iTunes (more may load) */}
              {(images.length > 1 || apiSource === 'itunes') && !isPlaying && (
                <button
                  onClick={goToPreviousImage}
                  disabled={isLoadingMore}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoadingMore ? 0.5 : 1,
                    zIndex: 10,
                  }}
                >
                  ‹
                </button>
              )}
              
              <img
                src={images[currentImageIndex]}
                alt={`Imagen ${currentImageIndex + 1} del álbum`}
                style={{
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: '0',
                }}
              />
              
              {/* Show navigation buttons even if only 1 image for iTunes (more may load) */}
              {(images.length > 1 || apiSource === 'itunes') && !isPlaying && (
                <button
                  onClick={goToNextImage}
                  disabled={isLoadingMore}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoadingMore ? 0.5 : 1,
                    zIndex: 10,
                  }}
                >
                  ›
                </button>
              )}
            </div>

            {/* Controls overlay */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>
              {/* Image indicators */}
              {(images.length > 1 || apiSource === 'itunes') && (
                <div style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  alignItems: 'center'
                }}>
                  {/* Show current indicators */}
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      disabled={isLoadingMore}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: index === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                        cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: isLoadingMore ? 0.3 : 1,
                      }}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                  {/* Show placeholder dots for not yet loaded images (iTunes only) */}
                  {apiSource === 'itunes' && !hasLoadedAll && (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'transparent',
                      }} />
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'transparent',
                      }} />
                    </>
                  )}
                </div>
              )}

              {/* Small divider */}
              {(images.length > 1 || apiSource === 'itunes') && (
                <div style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }} />
              )}

              {/* Image counter */}
              {(images.length > 1 || apiSource === 'itunes') && (
                <div style={{ 
                  fontSize: '12px',
                  color: '#ffffff',
                  fontWeight: '400',
                  minWidth: '40px',
                  textAlign: 'center',
                }}>
                  {hasLoadedAll ? (
                    `${currentImageIndex + 1}/${images.length}`
                  ) : (
                    isLoadingMore ? '...' : 
                    hasLoadedAll && images.length === 1 ? '1/1' :
                    '1/?'
                  )}
                </div>
              )}

              {/* Small divider */}
              {(images.length > 1 || apiSource === 'itunes') && (
                <div style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }} />
              )}

              {/* Play/Pause button - only show if more than 1 image */}
              {images.length > 1 && (
                <button
                  onClick={toggleSlideshow}
                  disabled={isLoadingMore}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'transparent',
                    color: isPlaying ? '#2563eb' : 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    opacity: isLoadingMore ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoadingMore) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = isPlaying ? '#3b82f6' : '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isPlaying ? '#2563eb' : 'rgba(255, 255, 255, 0.7)';
                  }}
                  title={isPlaying ? "Pausar presentación" : "Iniciar presentación"}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>
              )}

              {/* Small divider - only show if play button is visible */}
              {images.length > 1 && (
                <div style={{
                  width: '1px',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }} />
              )}

              {/* Close button - minimal X */}
              <button
                onClick={onClose}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                }}
                title="Cerrar (ESC)"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageModal;
