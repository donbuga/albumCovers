const COVER_ART_BASE_URL = 'https://coverartarchive.org/release';

export const getCoverArtUrl = (releaseId: string): string =>
  `${COVER_ART_BASE_URL}/${releaseId}/front`;
