import type { AlbumSearchResult, Producto } from '@/types';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const FALLBACK_COVER_URL = '';
const SEARCH_LIMIT = 12;
const REQUEST_TIMEOUT_MS = 4500;

type ItunesAlbum = {
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  collectionViewUrl?: string;
};

type ItunesSearchResponse = {
  results?: ItunesAlbum[];
};

const searchCache = new Map<string, Promise<AlbumSearchResult[]>>();

function normalize(value?: string) {
  return value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim() ?? '';
}

function getArtists(producto: Producto) {
  return producto.artistas
    ?.map((item) => item.artista.nombre)
    .filter(Boolean)
    .join(' ');
}

function buildAlbumQuery(producto: Producto) {
  return [getArtists(producto), producto.titulo]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function highResolutionCover(artworkUrl100?: string) {
  return artworkUrl100?.replace('100x100bb', '600x600bb') ?? FALLBACK_COVER_URL;
}

function mapAlbum(album: ItunesAlbum): AlbumSearchResult {
  return {
    externalId: album.collectionId ?? 0,
    title: album.collectionName ?? '',
    artist: album.artistName ?? '',
    coverUrl: highResolutionCover(album.artworkUrl100),
    releaseDate: album.releaseDate ?? '',
    genre: album.primaryGenreName ?? '',
    externalUrl: album.collectionViewUrl ?? '',
  };
}

function selectBestAlbumMatch(producto: Producto, albums: AlbumSearchResult[]) {
  const productTitle = normalize(producto.titulo);
  const productArtists = normalize(getArtists(producto));
  const withCover = albums.filter((album) => album.coverUrl);

  return (
    withCover.find((album) => {
      const albumTitle = normalize(album.title);
      const albumArtist = normalize(album.artist);
      return albumTitle === productTitle && (!productArtists || productArtists.includes(albumArtist) || albumArtist.includes(productArtists));
    }) ??
    withCover.find((album) => normalize(album.title) === productTitle) ??
    withCover[0]
  );
}

export async function searchAlbums(query: string): Promise<AlbumSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = normalize(cleanQuery);
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const request = (async () => {
    const params = new URLSearchParams({
      term: cleanQuery,
      entity: 'album',
      limit: String(SEARCH_LIMIT),
    });
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Error al consultar iTunes Search API');
      }

      const data = (await response.json()) as ItunesSearchResponse;
      return (data.results ?? []).map(mapAlbum);
    } catch (error) {
      console.error('No se pudo consultar iTunes Search API', error);
      return [];
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();

  searchCache.set(cacheKey, request);
  return request;
}

export async function enrichProductWithAlbumCover(producto: Producto): Promise<Producto> {
  if (producto.imagenUrl || producto.imagen) return producto;

  const query = buildAlbumQuery(producto);
  const albums = await searchAlbums(query);
  const album = selectBestAlbumMatch(producto, albums);

  return album?.coverUrl
    ? { ...producto, imagenUrl: album.coverUrl }
    : producto;
}

export async function enrichProductsWithAlbumCovers(productos: Producto[]): Promise<Producto[]> {
  return Promise.all(productos.map(enrichProductWithAlbumCover));
}
