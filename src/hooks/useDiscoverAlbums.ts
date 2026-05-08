import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiscogsReleaseCoverEnrichment } from './useDiscogsReleaseCoverEnrichment';
import { mapDiscogsReleaseToAlbumMetadata } from '../services/discogsReleaseMapper';
import { searchDiscoverAlbums } from '../services/discogsService';
import type { AlbumMetadataState } from '../types/discogs';
import type { DiscoverAlbumFilters } from '../types/discoverAlbums';
import type { AlbumResult } from '../types/musicBrainz';

const buildFiltersKey = (filters: DiscoverAlbumFilters): string =>
  JSON.stringify({
    country: filters.country?.code ?? null,
    decade: filters.decade,
    genres: [...filters.genres].sort(),
  });

const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';

export const useDiscoverAlbums = () => {
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [metadataByAlbumId, setMetadataByAlbumId] = useState<Record<string, AlbumMetadataState>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const activeSearchKeyRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { enrichAlbumCovers, stopEnrichment } = useDiscogsReleaseCoverEnrichment();

  const searchAlbums = useCallback(async (filters: DiscoverAlbumFilters) => {
    const searchKey = buildFiltersKey(filters);

    if (activeSearchKeyRef.current === searchKey) {
      return;
    }

    abortControllerRef.current?.abort();
    stopEnrichment();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    activeSearchKeyRef.current = searchKey;
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setMetadataByAlbumId({});

    try {
      const results = await searchDiscoverAlbums(filters, abortController.signal);
      setAlbums(results);
      setMetadataByAlbumId(
        results.reduce<Record<string, AlbumMetadataState>>((metadataStates, album) => {
          metadataStates[album.id] = { status: 'loading' };
          return metadataStates;
        }, {}),
      );
      enrichAlbumCovers(
        results,
        (albumId, release, coverUrl) => {
          const metadata = mapDiscogsReleaseToAlbumMetadata(release);

          setAlbums((currentAlbums) =>
            currentAlbums.map((album) => (album.id === albumId && coverUrl ? { ...album, coverUrl } : album)),
          );
          setMetadataByAlbumId((currentMetadata) => ({
            ...currentMetadata,
            [albumId]: {
              status: 'success',
              release,
              metadata,
              coverUrl: coverUrl ?? undefined,
            },
          }));
        },
        (albumId) => {
          setMetadataByAlbumId((currentMetadata) => ({
            ...currentMetadata,
            [albumId]: currentMetadata[albumId]?.status === 'success' ? currentMetadata[albumId] : { status: 'loading' },
          }));
        },
        (albumId, errorMessage) => {
          setMetadataByAlbumId((currentMetadata) => ({
            ...currentMetadata,
            [albumId]: {
              ...currentMetadata[albumId],
              status: 'error',
              error: errorMessage,
            },
          }));
        },
      );
    } catch (searchError) {
      if (isAbortError(searchError)) {
        return;
      }

      setAlbums([]);
      setMetadataByAlbumId({});
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'Ocurrió un error de red al buscar álbumes con los filtros seleccionados.',
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsLoading(false);
        abortControllerRef.current = null;
        activeSearchKeyRef.current = null;
      }
    }
  }, [enrichAlbumCovers, stopEnrichment]);

  const resetSearch = useCallback(() => {
    abortControllerRef.current?.abort();
    stopEnrichment();
    abortControllerRef.current = null;
    activeSearchKeyRef.current = null;
    setAlbums([]);
    setMetadataByAlbumId({});
    setIsLoading(false);
    setError(null);
    setHasSearched(false);
  }, [stopEnrichment]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
      stopEnrichment();
    },
    [stopEnrichment],
  );

  return {
    albums,
    metadataByAlbumId,
    error,
    hasSearched,
    isLoading,
    resetSearch,
    searchAlbums,
  };
};
