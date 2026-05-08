export interface CountryOption {
  code: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DecadeOption = '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export type GenreOption =
  | 'ROCK'
  | 'POP'
  | 'FOLK'
  | 'JAZZ'
  | 'HIP HOP'
  | 'METAL'
  | 'ELECTRONIC'
  | 'CLASSICAL'
  | 'REGGAE'
  | 'BLUES';
