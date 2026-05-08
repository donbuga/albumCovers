import type {
  AlbumMetadata,
  AlbumMetadataCredit,
  AlbumMetadataImage,
  AlbumMetadataTrack,
  DiscogsArtist,
  DiscogsFormat,
  DiscogsIdentifier,
  DiscogsReleaseDetail,
} from '../types/discogs';

const DISCOGS_PUBLIC_BASE_URL = 'https://www.discogs.com';

const compactStrings = (values: Array<string | number | null | undefined>): string[] =>
  values.map((value) => (value === undefined || value === null ? '' : String(value).trim())).filter(Boolean);

const uniqueStrings = (values: string[]): string[] => [...new Set(values)];

const formatArtistName = (artist: DiscogsArtist): string => {
  const displayName = artist.anv || artist.name;
  const join = artist.join && artist.join !== ',' ? ` ${artist.join}` : '';

  return `${displayName}${join}`.trim();
};

const mapCredits = (artists?: DiscogsArtist[]): AlbumMetadataCredit[] =>
  (artists ?? [])
    .map((artist) => ({
      name: artist.anv || artist.name,
      role: artist.role,
      tracks: artist.tracks,
    }))
    .filter((credit) => Boolean(credit.name));

const formatFormat = (format: DiscogsFormat): string => {
  const descriptions = format.descriptions?.join(', ');
  const text = format.text ? `(${format.text})` : undefined;
  const qty = format.qty && format.qty !== '1' ? `${format.qty}×` : undefined;

  return compactStrings([qty, format.name, descriptions, text]).join(' ').replace(/\s+/g, ' ').trim();
};

const formatIdentifier = (identifier: DiscogsIdentifier): string => {
  const description = identifier.description ? `(${identifier.description})` : undefined;

  return compactStrings([identifier.type, identifier.value, description]).join(': ').replace(': (', ' (');
};

const buildExternalUrl = (uri?: string): string | undefined => {
  if (!uri) {
    return undefined;
  }

  return uri.startsWith('http') ? uri : `${DISCOGS_PUBLIC_BASE_URL}${uri}`;
};

export const getFirstReleaseImageUrl = (release: DiscogsReleaseDetail): string | null => {
  const firstImage = release.images?.[0];

  return firstImage?.uri || firstImage?.resource_url || firstImage?.uri150 || release.cover_image || release.thumb || null;
};

export const mapDiscogsReleaseToAlbumMetadata = (release: DiscogsReleaseDetail): AlbumMetadata => {
  const images: AlbumMetadataImage[] = (release.images ?? [])
    .map((image) => ({
      type: image.type,
      url: image.uri || image.resource_url || image.uri150 || '',
      thumbnailUrl: image.uri150 || image.uri || image.resource_url,
      width: image.width,
      height: image.height,
    }))
    .filter((image) => Boolean(image.url));

  const fallbackImage = getFirstReleaseImageUrl(release);
  const allImages = images.length > 0 || !fallbackImage ? images : [{ url: fallbackImage, thumbnailUrl: fallbackImage }];

  const tracklist: AlbumMetadataTrack[] = (release.tracklist ?? [])
    .map((track) => ({
      position: track.position,
      title: track.title ?? '',
      duration: track.duration,
      type: track.type_,
      credits: mapCredits(track.extraartists),
    }))
    .filter((track) => Boolean(track.title));

  return {
    id: release.id.toString(),
    title: release.title,
    artists: uniqueStrings(compactStrings((release.artists ?? []).map(formatArtistName))),
    year: release.year ? String(release.year) : undefined,
    country: release.country,
    released: release.released,
    releasedFormatted: release.released_formatted,
    formats: uniqueStrings(compactStrings((release.formats ?? []).map(formatFormat))),
    labels: uniqueStrings(compactStrings((release.labels ?? []).map((label) => compactStrings([label.name, label.catno]).join(' • ')))),
    genres: release.genres ?? [],
    styles: release.styles ?? [],
    mainImageUrl: fallbackImage ?? undefined,
    images: allImages,
    tracklist,
    companies: uniqueStrings(
      compactStrings(
        (release.companies ?? []).map((company) => compactStrings([company.entity_type_name, company.name]).join(' • ')),
      ),
    ),
    credits: mapCredits(release.extraartists),
    identifiers: compactStrings((release.identifiers ?? []).map(formatIdentifier)),
    uri: release.uri,
    externalUrl: buildExternalUrl(release.uri),
    resourceUrl: release.resource_url,
    masterId: release.master_id ? String(release.master_id) : undefined,
    masterUrl: release.master_url,
    status: release.status ?? release.community?.status,
    dataQuality: release.data_quality ?? release.community?.data_quality,
    dateAdded: release.date_added,
    dateChanged: release.date_changed,
    ratingAverage: release.community?.rating?.average,
    ratingCount: release.community?.rating?.count,
    communityHave: release.community?.have,
    communityWant: release.community?.want,
    notes: release.notes,
  };
};
