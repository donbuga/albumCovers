export interface DiscogsImage {
  type: string;
  uri: string;
  resource_url: string;
  width: number;
  height: number;
  uri150: string;
}

export interface DiscogsArtist {
  id: number;
  resource_url: string;
  name: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  resource_url: string;
  year: string;
  format: string[];
  label: string[];
  country: string;
  cover_image: string;
  thumb: string;
  genre?: string[];
  style?: string[];
}

export interface DiscogsReleaseDetail {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    id: number;
    resource_url: string;
  }>;
  country: string;
  year: string;
  released: string;
  images: Array<{
    type: string;
    uri: string;
    resource_url: string;
    uri150: string;
    width: number;
    height: number;
  }>;
  thumb: string;
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
