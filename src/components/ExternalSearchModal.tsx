import type { AlbumResult } from '../types/musicBrainz';
import { buildExternalSearchQuery, getExternalSearchLinks } from '../utils/externalSearchLinks';

interface ExternalSearchModalProps {
  album: AlbumResult;
  artist: string;
  isOpen: boolean;
  onClose: () => void;
}

const ExternalLinkIcon = () => (
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
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ExternalSearchModal = ({ album, artist, isOpen, onClose }: ExternalSearchModalProps) => {
  if (!isOpen) {
    return null;
  }

  const searchQuery = buildExternalSearchQuery(artist, album.title);
  const links = getExternalSearchLinks(artist, album.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-search-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-[#050812] shadow-2xl shadow-black"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 bg-[#081026] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Explorar álbum</p>
            <h2 id="external-search-title" className="line-clamp-1 text-lg font-bold text-slate-100">
              {album.title}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-slate-400">{artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xl leading-none text-slate-200 transition hover:border-cyan-300 hover:text-white"
            aria-label="Cerrar opciones para explorar álbum"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-92px)] overflow-y-auto p-5">
          <div className="rounded-3xl border border-slate-800 bg-[#081026]/80 p-4">
            <p className="text-sm leading-6 text-slate-300">
              Accesos rápidos para buscar <span className="font-bold text-slate-100">“{searchQuery}”</span> en plataformas externas.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Los enlaces abren una nueva pestaña
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {links.map(({ provider, url }) => (
              <a
                key={provider.id}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-slate-100 transition hover:border-cyan-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label={`Buscar ${searchQuery} en ${provider.name}; abre una nueva pestaña`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xl shadow-inner shadow-black/30">
                    {provider.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-black text-slate-100">{provider.name}</span>
                    <span className="block text-xs text-slate-400 transition group-hover:text-cyan-200">
                      Buscar resultados externos
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-slate-400 transition group-hover:text-cyan-200">
                  <ExternalLinkIcon />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalSearchModal;
