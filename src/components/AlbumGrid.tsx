import type { AlbumResult } from '../types/musicBrainz';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: AlbumResult[];
  apiSource: 'itunes' | 'discogs';
}

const AlbumGrid = ({ albums, apiSource }: AlbumGridProps) => (
  <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4" aria-label="Resultados de álbumes">
    {albums.map((album) => (
      <AlbumCard key={album.id} album={album} apiSource={apiSource} />
    ))}
  </section>
);

export default AlbumGrid;
