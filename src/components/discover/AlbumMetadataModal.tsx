import type { ReactNode } from 'react';
import type { AlbumMetadata, AlbumMetadataState } from '../../types/discogs';
import type { AlbumResult } from '../../types/musicBrainz';

interface AlbumMetadataModalProps {
  album: AlbumResult;
  metadataState?: AlbumMetadataState;
  onClose: () => void;
}

interface InfoListProps {
  items: string[];
  emptyLabel?: string;
}

interface DetailRowProps {
  label: string;
  value?: string | number | null;
}

const hasValue = (value?: string | number | null): value is string | number =>
  value !== undefined && value !== null && String(value).trim() !== '';

const DetailRow = ({ label, value }: DetailRowProps) =>
  hasValue(value) ? (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-3">
      <dt className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-300">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-100">{value}</dd>
    </div>
  ) : null;

const InfoList = ({ items, emptyLabel }: InfoListProps) => {
  const visibleItems = items.filter(Boolean);

  if (visibleItems.length === 0) {
    return emptyLabel ? <p className="text-sm text-slate-500">{emptyLabel}</p> : null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <span key={item} className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-200">
          {item}
        </span>
      ))}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3 rounded-3xl border border-slate-800 bg-[#081026]/80 p-4">
    <h3 className="text-sm font-black uppercase tracking-[0.22em] text-lime-300">{title}</h3>
    {children}
  </section>
);

const AlbumImagesGallery = ({ metadata }: { metadata: AlbumMetadata }) => {
  if (metadata.images.length === 0) {
    return null;
  }

  return (
    <Section title="Galería">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-3">
        {metadata.images.map((image, index) => (
          <a
            key={`${image.url}-${index}`}
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
          >
            <img
              src={image.thumbnailUrl ?? image.url}
              alt={`${metadata.title} imagen ${index + 1}`}
              loading="lazy"
              className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105"
            />
            {image.type && <span className="block px-2 py-1 text-center text-[0.65rem] uppercase text-slate-400">{image.type}</span>}
          </a>
        ))}
      </div>
    </Section>
  );
};

const AlbumTracklist = ({ metadata }: { metadata: AlbumMetadata }) => {
  if (metadata.tracklist.length === 0) {
    return null;
  }

  return (
    <Section title="Tracklist">
      <div className="max-h-80 overflow-y-auto pr-1">
        <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#081026] text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="w-20 rounded-l-xl px-3 py-2">Pos.</th>
              <th className="px-3 py-2">Título</th>
              <th className="w-24 rounded-r-xl px-3 py-2 text-right">Duración</th>
            </tr>
          </thead>
          <tbody>
            {metadata.tracklist.map((track, index) => (
              <tr key={`${track.position}-${track.title}-${index}`} className="bg-slate-950/60 text-slate-200">
                <td className="rounded-l-xl px-3 py-2 font-mono text-xs text-cyan-200">{track.position || '—'}</td>
                <td className="px-3 py-2">
                  <p className="font-semibold">{track.title}</p>
                  {track.credits && track.credits.length > 0 && (
                    <p className="mt-1 text-xs text-slate-400">
                      {track.credits.map((credit) => `${credit.name}${credit.role ? ` (${credit.role})` : ''}`).join(', ')}
                    </p>
                  )}
                </td>
                <td className="rounded-r-xl px-3 py-2 text-right font-mono text-xs text-slate-400">
                  {track.duration || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
};

const AlbumCredits = ({ metadata }: { metadata: AlbumMetadata }) => {
  const hasCredits = metadata.companies.length > 0 || metadata.credits.length > 0;

  if (!hasCredits) {
    return null;
  }

  return (
    <Section title="Créditos y compañías">
      {metadata.companies.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Compañías</h4>
          <InfoList items={metadata.companies} />
        </div>
      )}
      {metadata.credits.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Extra artists</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {metadata.credits.map((credit, index) => (
              <div key={`${credit.name}-${credit.role}-${index}`} className="rounded-2xl bg-slate-950/60 p-3 text-sm text-slate-200">
                <p className="font-bold">{credit.name}</p>
                {credit.role && <p className="text-slate-400">{credit.role}</p>}
                {credit.tracks && <p className="text-xs text-cyan-200">Tracks: {credit.tracks}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};

const AlbumMainInfo = ({ album, metadata }: { album: AlbumResult; metadata: AlbumMetadata }) => (
  <div className="grid gap-5 lg:grid-cols-[280px,minmax(0,1fr)]">
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30">
        {metadata.mainImageUrl || album.coverUrl ? (
          <img
            src={metadata.mainImageUrl ?? album.coverUrl}
            alt={`Portada de ${metadata.title}`}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="grid aspect-square place-items-center text-slate-400">Sin portada</div>
        )}
      </div>
      <InfoList items={[...metadata.genres, ...metadata.styles]} />
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Discogs release #{metadata.id}</p>
        <h2 className="mt-2 text-3xl font-black text-slate-100">{metadata.title || album.title}</h2>
        <p className="mt-2 text-lg font-semibold text-slate-300">
          {(metadata.artists.length > 0 ? metadata.artists : [album.artist]).join(', ')}
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DetailRow label="Año" value={metadata.year ?? album.year} />
        <DetailRow label="País" value={metadata.country ?? album.country} />
        <DetailRow label="Lanzamiento" value={metadata.releasedFormatted ?? metadata.released} />
        <DetailRow label="Estado" value={metadata.status ?? album.status} />
        <DetailRow label="Data quality" value={metadata.dataQuality} />
        <DetailRow label="Rating" value={metadata.ratingAverage ? `${metadata.ratingAverage} (${metadata.ratingCount ?? 0} votos)` : undefined} />
        <DetailRow label="Have" value={metadata.communityHave} />
        <DetailRow label="Want" value={metadata.communityWant} />
        <DetailRow label="Agregado" value={metadata.dateAdded} />
        <DetailRow label="Modificado" value={metadata.dateChanged} />
        <DetailRow label="Master ID" value={metadata.masterId} />
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Formatos</h4>
          <InfoList items={metadata.formats} emptyLabel="Sin formatos disponibles." />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Labels</h4>
          <InfoList items={metadata.labels} emptyLabel="Sin labels disponibles." />
        </div>
      </div>
    </div>
  </div>
);

const AlbumLinks = ({ metadata }: { metadata: AlbumMetadata }) => {
  const links = [
    metadata.externalUrl ? { label: 'Abrir en Discogs', url: metadata.externalUrl } : null,
    metadata.resourceUrl ? { label: 'Resource URL', url: metadata.resourceUrl } : null,
    metadata.masterUrl ? { label: 'Master URL', url: metadata.masterUrl } : null,
  ].filter((link): link is { label: string; url: string } => Boolean(link));

  if (links.length === 0 && metadata.identifiers.length === 0) {
    return null;
  }

  return (
    <Section title="Identificadores y links">
      {metadata.identifiers.length > 0 && <InfoList items={metadata.identifiers} />}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
};

const LoadingContent = ({ album }: { album: AlbumResult }) => (
  <div className="grid min-h-96 place-items-center p-8 text-center">
    <div>
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-lime-300" />
      <h2 className="mt-5 text-2xl font-black text-slate-100">Cargando metadata</h2>
      <p className="mt-2 text-slate-400">La respuesta enriquecida de “{album.title}” todavía está en la cola de Discogs.</p>
    </div>
  </div>
);

const ErrorContent = ({ album, message }: { album: AlbumResult; message?: string }) => (
  <div className="grid min-h-96 place-items-center p-8 text-center">
    <div className="max-w-lg">
      <p className="text-4xl">⚠️</p>
      <h2 className="mt-4 text-2xl font-black text-slate-100">No se pudo cargar la metadata</h2>
      <p className="mt-2 text-slate-400">{message ?? `Discogs no devolvió detalles para “${album.title}”.`}</p>
    </div>
  </div>
);

const AlbumMetadataModal = ({ album, metadataState, onClose }: AlbumMetadataModalProps) => {
  const metadata = metadataState?.metadata;
  const isLoading = !metadataState || metadataState.status === 'idle' || metadataState.status === 'loading';
  const isError = metadataState?.status === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-metadata-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-700 bg-[#050812] shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#081026] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Album metadata</p>
            <h2 id="album-metadata-title" className="line-clamp-1 text-lg font-bold text-slate-100">
              {album.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xl leading-none text-slate-200 transition hover:border-cyan-300 hover:text-white"
            aria-label="Cerrar metadata del álbum"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5">
          {isLoading && <LoadingContent album={album} />}
          {isError && <ErrorContent album={album} message={metadataState?.error} />}
          {!isLoading && !isError && metadata && (
            <div className="space-y-5">
              <AlbumMainInfo album={album} metadata={metadata} />
              <AlbumTracklist metadata={metadata} />
              <AlbumCredits metadata={metadata} />
              <AlbumLinks metadata={metadata} />
              {metadata.notes && (
                <Section title="Notas del release">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-300">{metadata.notes}</p>
                </Section>
              )}
              <AlbumImagesGallery metadata={metadata} />
            </div>
          )}
          {!isLoading && !isError && !metadata && <ErrorContent album={album} message="La metadata recibida está incompleta." />}
        </div>
      </div>
    </div>
  );
};

export default AlbumMetadataModal;
