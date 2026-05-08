import { useState, useEffect } from 'react';
import type { AlbumResult } from '../types/musicBrainz';
import ImageModal from './ImageModal';

interface AlbumCardProps {
  album: AlbumResult;
  apiSource: 'itunes' | 'discogs';
}

const formatTags = (tags?: string[]): string | null => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return tags.join(', ');
};

const AlbumCard = ({ album, apiSource }: AlbumCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [album.coverUrl]);

  const genres = formatTags(album.genres);
  const styles = formatTags(album.styles);

  const handlePlayAlbum = (title: string, artist: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Okey Google, reproduce el álbum ${title} del artista ${artist}`);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-[#22314f] bg-[#0b1327]/90 shadow-xl shadow-black/20">
        <div className="aspect-square w-full cursor-pointer bg-slate-800" onClick={() => setShowModal(true)}>
          {!imageError ? (
            <img
              src={album.coverUrl}
              alt={`Portada de ${album.title} por ${album.artist}`}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center font-semibold text-slate-300">Sin portada</div>
          )}
        </div>

        <div className="space-y-1 p-4 text-sm text-slate-300">
          <h2 className="line-clamp-2 text-base font-bold text-slate-100">{album.title}</h2>
          <p><strong>Artista:</strong> {album.artist}</p>
          {album.year && <p><strong>Año:</strong> {album.year}</p>}
          {album.country && <p><strong>País:</strong> {album.country}</p>}
          {genres && <p><strong>Género:</strong> {genres}</p>}
          {styles && <p><strong>Estilo:</strong> {styles}</p>}
          {album.status && <p><strong>Estado:</strong> {album.status}</p>}
          <div className="flex justify-end pt-2">
            <button
              className="rounded-md bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
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
