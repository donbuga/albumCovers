import { useState } from 'react';
import type { AlbumResult } from '../types/musicBrainz';

interface AlbumCardProps {
  album: AlbumResult;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="album-card">
      <div className="cover-wrapper">
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
      </div>
    </article>
  );
};

export default AlbumCard;
