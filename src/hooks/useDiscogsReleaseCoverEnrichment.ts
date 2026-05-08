import { useCallback, useRef } from 'react';
import { getReleaseCoverImage } from '../services/discogsService';
import type { AlbumResult } from '../types/musicBrainz';

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

type OnCoverLoaded = (albumId: string, coverUrl: string) => void;

export const useDiscogsReleaseCoverEnrichment = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopEnrichment = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const enrichAlbumCovers = useCallback(
    (albums: AlbumResult[], onCoverLoaded: OnCoverLoaded) => {
      stopEnrichment();

      if (albums.length === 0) {
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const loadCovers = async () => {
        for (const album of albums) {
          if (abortController.signal.aborted) {
            return;
          }

          try {
            const coverUrl = await getReleaseCoverImage(album.id, abortController.signal);

            if (coverUrl && !abortController.signal.aborted) {
              onCoverLoaded(album.id, coverUrl);
            }
          } catch (error) {
            if (!isAbortError(error)) {
              console.warn(`No se pudo enriquecer la portada del release ${album.id}:`, error);
            }
          }
        }
      };

      void loadCovers().finally(() => {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      });
    },
    [stopEnrichment],
  );

  return {
    enrichAlbumCovers,
    stopEnrichment,
  };
};
