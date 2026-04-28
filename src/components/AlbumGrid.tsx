import type { AlbumResult } from '../types/musicBrainz';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
  albums: AlbumResult[];
}

const AlbumGrid = ({ albums }: AlbumGridProps) => (
  <section className="album-grid" aria-label="Resultados de álbumes">
    {albums.map((album) => (
      <AlbumCard key={album.id} album={album} />
    ))}
  </section>
);

export default AlbumGrid;
