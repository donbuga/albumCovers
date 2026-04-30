import type { AlbumResult } from '../types/musicBrainz';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: AlbumResult[];
  apiSource: 'itunes' | 'discogs';
}

const AlbumGrid = ({ albums, apiSource }: AlbumGridProps) => (
  <section className="album-grid" aria-label="Resultados de álbumes">
    {albums.map((album) => (
      <AlbumCard key={album.id} album={album} apiSource={apiSource} />
    ))}
  </section>
);

export default AlbumGrid;
