import { useCallback, useRef } from 'react';
import { getReleaseDetail } from '../services/discogsService';
import { getFirstReleaseImageUrl } from '../services/discogsReleaseMapper';
import type { DiscogsReleaseDetail } from '../types/discogs';
import type { AlbumResult } from '../types/musicBrainz';

const RELEASE_COVER_REQUEST_DELAY_MS = 3000;

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

type OnReleaseLoading = (albumId: string) => void;
type OnReleaseLoaded = (albumId: string, release: DiscogsReleaseDetail, coverUrl: string | null) => void;
type OnReleaseError = (albumId: string, errorMessage: string) => void;

const delay = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'));
      return;
    }

    const timeoutId = window.setTimeout(resolve, ms);

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Request aborted', 'AbortError'));
      },
      { once: true },
    );
  });

export const useDiscogsReleaseCoverEnrichment = () => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const enrichmentRunIdRef = useRef(0);

  const stopEnrichment = useCallback(() => {
    enrichmentRunIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const enrichAlbumCovers = useCallback(
    (
      albums: AlbumResult[],
      onReleaseLoaded: OnReleaseLoaded,
      onReleaseLoading?: OnReleaseLoading,
      onReleaseError?: OnReleaseError,
    ) => {
      stopEnrichment();

      if (albums.length === 0) {
        return;
      }

      const abortController = new AbortController();
      const runId = enrichmentRunIdRef.current;
      abortControllerRef.current = abortController;

      albums.forEach((album) => onReleaseLoading?.(album.id));

      const isCurrentRun = () =>
        abortControllerRef.current === abortController && enrichmentRunIdRef.current === runId;

      const loadCoversSequentially = async () => {
        for (const [index, album] of albums.entries()) {
          if (abortController.signal.aborted || !isCurrentRun()) {
            return;
          }

          if (index > 0) {
            await delay(RELEASE_COVER_REQUEST_DELAY_MS, abortController.signal);
          }

          if (abortController.signal.aborted || !isCurrentRun()) {
            return;
          }

          try {
            const release = await getReleaseDetail(album.id, abortController.signal);
            const coverUrl = getFirstReleaseImageUrl(release);

            if (!abortController.signal.aborted && isCurrentRun()) {
              onReleaseLoaded(album.id, release, coverUrl);
            }
          } catch (error) {
            if (!isAbortError(error)) {
              console.warn(`No se pudo enriquecer la portada del release ${album.id}:`, error);
              onReleaseError?.(
                album.id,
                error instanceof Error ? error.message : 'No se pudo cargar la metadata del release.',
              );
            }
          }
        }
      };

      void loadCoversSequentially()
        .catch((error) => {
          if (!isAbortError(error)) {
            console.warn('No se pudo completar la cola de portadas de Discogs:', error);
          }
        })
        .finally(() => {
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
