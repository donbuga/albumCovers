import { useState, useEffect } from 'react';
import type { AlbumResult } from '../types/musicBrainz';
import ImageModal from './ImageModal';
import ExternalSearchModal from './ExternalSearchModal';
import AlbumVideosModal from './AlbumVideosModal';

interface AlbumCardProps {
  album: AlbumResult;
  apiSource: 'itunes' | 'discogs';
  onDetailsClick?: (album: AlbumResult) => void;
}

const formatTags = (tags?: string[]): string | null => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return tags.join(', ');
};

const AlbumCard = ({ album, apiSource, onDetailsClick }: AlbumCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);

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

  const handleOpenDetails = () => {
    if (onDetailsClick) {
      onDetailsClick(album);
      return;
    }

    setShowModal(true);
  };

  const handleOpenExplore = () => {
    setShowExploreModal(true);
  };

  const handleCloseExplore = () => {
    setShowExploreModal(false);
  };

  const handlePlayAlbum = (title: string, artist: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Okey Google, reproduce el álbum ${title} del artista ${artist}`);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const hasVideos = (album.videoUrls?.length ?? 0) > 0;

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-[#22314f] bg-[#0b1327]/90 shadow-xl shadow-black/20">
        <div className="aspect-square w-full cursor-pointer bg-slate-800" onClick={handleOpenDetails}>
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
          <div className="flex items-center justify-between gap-2 pt-2">
            {onDetailsClick && (
              <button
                type="button"
                className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-300"
                onClick={handleOpenDetails}
                aria-label={`Ver metadata de ${album.title}`}
              >
                Metadata
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              {hasVideos && (
                <button
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-700/90 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                  onClick={() => setShowVideosModal(true)}
                  title="Ver videos asociados al release"
                  aria-label={`Ver videos de ${album.title}`}
                >
                  Videos
                </button>
              )}
              <button
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                onClick={handleOpenExplore}
                title="Explorar álbum en plataformas externas"
                aria-label={`Explorar búsquedas externas para ${album.title} de ${album.artist}`}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                Explorar
              </button>
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
        </div>
      </article>
      <ExternalSearchModal album={album} artist={album.artist} isOpen={showExploreModal} onClose={handleCloseExplore} />
      {showVideosModal && hasVideos && (
        <AlbumVideosModal
          albumTitle={album.title}
          artist={album.artist}
          videoUrls={album.videoUrls ?? []}
          onClose={() => setShowVideosModal(false)}
        />
      )}
      {showModal && !onDetailsClick && (
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
