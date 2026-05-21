export interface MusicBrainzArtistCredit {
  name?: string;
  artist?: {
    id: string;
    name: string;
  };
}

export interface MusicBrainzRelease {
  id: string;
  title: string;
  date?: string;
  country?: string;
  status?: string;
  'artist-credit'?: MusicBrainzArtistCredit[];
}

export interface MusicBrainzSearchResponse {
  releases?: MusicBrainzRelease[];
  count?: number;
  offset?: number;
}

export interface AlbumResult {
  id: string;
  title: string;
  artist: string;
  date?: string;
  year?: string;
  country?: string;
  status?: string;
  coverUrl: string;
  genres?: string[];
  styles?: string[];
  videoUrls?: string[];
}
