import type { CountryOption, DecadeOption, GenreOption } from '../types/discover';

export const DECADE_OPTIONS: DecadeOption[] = [
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
];

export const GENRE_OPTIONS: GenreOption[] = [
  'ROCK',
  'POP',
  'FOLK',
  'JAZZ',
  'HIP HOP',
  'METAL',
  'ELECTRONIC',
  'CLASSICAL',
  'REGGAE',
  'BLUES',
];

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'US', name: 'United States', x: 155, y: 148, width: 74, height: 38 },
  { code: 'BR', name: 'Brazil', x: 290, y: 292, width: 52, height: 64 },
  { code: 'GB', name: 'United Kingdom', x: 421, y: 129, width: 26, height: 24 },
  { code: 'FR', name: 'France', x: 438, y: 161, width: 34, height: 32 },
  { code: 'NG', name: 'Nigeria', x: 450, y: 258, width: 36, height: 30 },
  { code: 'ZA', name: 'South Africa', x: 500, y: 378, width: 45, height: 34 },
  { code: 'JP', name: 'Japan', x: 743, y: 182, width: 28, height: 48 },
  { code: 'KR', name: 'South Korea', x: 719, y: 197, width: 22, height: 24 },
  { code: 'IN', name: 'India', x: 614, y: 245, width: 42, height: 54 },
  { code: 'AU', name: 'Australia', x: 702, y: 349, width: 74, height: 44 },
];
