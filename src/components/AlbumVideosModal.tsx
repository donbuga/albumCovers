interface AlbumVideosModalProps {
  albumTitle: string;
  artist: string;
  videoUrls: string[];
  onClose: () => void;
}

const AlbumVideosModal = ({ albumTitle, artist, videoUrls, onClose }: AlbumVideosModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
    <div
      className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#050812] p-6 shadow-2xl shadow-black"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Videos del release</p>
          <h2 className="mt-1 text-xl font-black text-slate-100">{albumTitle}</h2>
          <p className="text-sm text-slate-400">{artist}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xl leading-none text-slate-200 transition hover:border-cyan-300 hover:text-white"
          aria-label="Cerrar modal de videos"
        >
          ×
        </button>
      </div>

      <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        {videoUrls.map((url) => (
          <li key={url} className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default AlbumVideosModal;
