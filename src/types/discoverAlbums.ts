import type { CountryOption, DecadeOption, GenreOption } from './discover';

export interface DiscoverAlbumFilters {
  country: CountryOption | null;
  decade: DecadeOption | null;
  genres: GenreOption[];
}

export interface YearRange {
  startYear: number;
  endYear: number;
  queryValue: string;
}
