import { useState, useEffect } from 'react';
import type { AlbumResult } from '../types/musicBrainz';
import ImageModal from './ImageModal';

interface AlbumCardProps {
  album: AlbumResult;
  apiSource: 'itunes' | 'discogs';
}

const AlbumCard = ({ album, apiSource }: AlbumCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
  }, []);

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handlePlayAlbum = (title: string, artist: string) => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Okey Google, reproduce el álbum ${title} del artista ${artist}`
      );
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      
      // Set female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.lang.includes('es') && 
        (voice.name.includes('female') || 
         voice.name.includes('woman') || 
         voice.name.includes('mujer') ||
         voice.name.includes('Monica') ||
         voice.name.includes('Sophie') ||
         voice.name.includes('Lucia'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback: copy to clipboard
      const command = `Okey Google, reproduce el álbum ${title} del artista ${artist}`;
      navigator.clipboard.writeText(command).then(() => {
        alert('Comando copiado al portapapeles: ' + command);
      }).catch(() => {
        alert('Comando: ' + command);
      });
    }
  };

  return (
    <>
      <article className="album-card">
        <div 
          className="cover-wrapper"
          onClick={handleImageClick}
          style={{ cursor: 'pointer' }}
        >
          {!imageError ? (
            <img
              src={album.coverUrl}
              alt={`Portada de ${album.title} por ${album.artist}`}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="cover-placeholder">Sin portada</div>
          )}
        </div>

      <div className="album-info">
        <h2>{album.title}</h2>
        <p>
          <strong>Artista:</strong> {album.artist}
        </p>
        {album.year && (
          <p>
            <strong>Año:</strong> {album.year}
          </p>
        )}
        {album.country && (
          <p>
            <strong>País:</strong> {album.country}
          </p>
        )}
        {album.status && (
          <p>
            <strong>Estado:</strong> {album.status}
          </p>
        )}
        <div className="play-button-wrapper">
          <button
            className="play-button"
            onClick={() => handlePlayAlbum(album.title, album.artist)}
            title="Reproducir álbum con voz"
            aria-label={`Reproducir ${album.title} de ${album.artist}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </article>
    {showModal && (
      <ImageModal 
        releaseId={album.id} 
        apiSource={apiSource} 
        coverUrl={album.coverUrl}
        albumTitle={album.title}
        artist={album.artist}
        onClose={() => setShowModal(false)} 
      />
    )}
  </>
  );
};

export default AlbumCard;
