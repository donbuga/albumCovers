import type { AlbumResult } from '../types/musicBrainz';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: AlbumResult[];
  apiSource: 'itunes' | 'discogs';
  onAlbumDetailsClick?: (album: AlbumResult) => void;
}

const AlbumGrid = ({ albums, apiSource, onAlbumDetailsClick }: AlbumGridProps) => (
  <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4" aria-label="Resultados de álbumes">
    {albums.map((album) => (
      <AlbumCard key={album.id} album={album} apiSource={apiSource} onDetailsClick={onAlbumDetailsClick} />
    ))}
  </section>
);

export default AlbumGrid;
