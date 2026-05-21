export interface DiscogsImage {
  type?: string;
  uri?: string;
  resource_url?: string;
  width?: number;
  height?: number;
  uri150?: string;
}

export interface DiscogsArtist {
  id?: number;
  resource_url?: string;
  name: string;
  anv?: string;
  join?: string;
  role?: string;
  tracks?: string;
  thumbnail_url?: string;
}

export interface DiscogsFormat {
  name?: string;
  qty?: string;
  text?: string;
  descriptions?: string[];
}

export interface DiscogsLabel {
  id?: number;
  name: string;
  catno?: string;
  entity_type?: string;
  entity_type_name?: string;
  resource_url?: string;
}

export interface DiscogsCompany extends DiscogsLabel {}

export interface DiscogsTrack {
  position?: string;
  type_?: string;
  title?: string;
  duration?: string;
  extraartists?: DiscogsArtist[];
}

export interface DiscogsIdentifier {
  type?: string;
  value?: string;
  description?: string;
}

export interface DiscogsVideo {
  uri?: string;
  title?: string;
  description?: string;
  duration?: number;
  embed?: boolean;
}

export interface DiscogsCommunityRating {
  average?: number;
  count?: number;
}

export interface DiscogsCommunity {
  want?: number;
  have?: number;
  rating?: DiscogsCommunityRating;
  contributors?: DiscogsArtist[];
  data_quality?: string;
  status?: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  resource_url: string;
  year: string;
  format: string[];
  formats?: DiscogsFormat[];
  label: string[];
  country: string;
  cover_image: string;
  thumb: string;
  genre?: string[];
  style?: string[];
  barcode?: string[];
  master_id?: number;
  master_url?: string;
  uri?: string;
  catno?: string;
  community?: DiscogsCommunity;
  format_quantity?: number;
}

export interface DiscogsReleaseDetail {
  id: number;
  title: string;
  artists?: DiscogsArtist[];
  country?: string;
  year?: number | string;
  released?: string;
  released_formatted?: string;
  images?: DiscogsImage[];
  thumb?: string;
  cover_image?: string;
  formats?: DiscogsFormat[];
  labels?: DiscogsLabel[];
  genres?: string[];
  styles?: string[];
  tracklist?: DiscogsTrack[];
  companies?: DiscogsCompany[];
  extraartists?: DiscogsArtist[];
  identifiers?: DiscogsIdentifier[];
  notes?: string;
  uri?: string;
  resource_url?: string;
  master_id?: number;
  master_url?: string;
  status?: string;
  data_quality?: string;
  date_added?: string;
  date_changed?: string;
  community?: DiscogsCommunity;
  num_for_sale?: number;
  lowest_price?: number;
  videos?: DiscogsVideo[];
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number;
    pages: number;
    items: number;
    per_page: number;
  };
  results: DiscogsRelease[];
}

export interface AlbumMetadataLink {
  label: string;
  url: string;
}

export interface AlbumMetadataCredit {
  name: string;
  role?: string;
  tracks?: string;
}

export interface AlbumMetadataTrack {
  position?: string;
  title: string;
  duration?: string;
  type?: string;
  credits?: AlbumMetadataCredit[];
}

export interface AlbumMetadataImage {
  type?: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface AlbumMetadataVideo {
  title: string;
  url: string;
  duration?: number;
  description?: string;
}

export interface AlbumMetadata {
  id: string;
  title: string;
  artists: string[];
  year?: string;
  country?: string;
  released?: string;
  releasedFormatted?: string;
  formats: string[];
  labels: string[];
  genres: string[];
  styles: string[];
  mainImageUrl?: string;
  images: AlbumMetadataImage[];
  tracklist: AlbumMetadataTrack[];
  companies: string[];
  credits: AlbumMetadataCredit[];
  identifiers: string[];
  uri?: string;
  externalUrl?: string;
  resourceUrl?: string;
  masterId?: string;
  masterUrl?: string;
  status?: string;
  dataQuality?: string;
  dateAdded?: string;
  dateChanged?: string;
  ratingAverage?: number;
  ratingCount?: number;
  communityHave?: number;
  communityWant?: number;
  notes?: string;
  videos: AlbumMetadataVideo[];
}

export type AlbumMetadataStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AlbumMetadataState {
  status: AlbumMetadataStatus;
  release?: DiscogsReleaseDetail;
  metadata?: AlbumMetadata;
  coverUrl?: string;
  error?: string;
}
