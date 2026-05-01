# Album Covers Explorer

Aplicación web para explorar portadas de discos usando **MusicBrainz** y **Cover Art Archive**.

## URL principal

- Producción: https://donbuga.github.io/albumCovers/

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
```

## Preview local

```bash
npm run preview
```

## Deploy correcto en GitHub Pages

Este proyecto se publica en una **subruta** (`/albumCovers/`), por eso `vite.config.ts` debe tener:

```ts
base: '/albumCovers/'
```

Pasos recomendados:

1. Configurar en GitHub → **Settings → Pages** la fuente desde la rama `gh-pages` (raíz).
2. Publicar siempre la carpeta de build (`dist`), no el código fuente.
3. Ejecutar:

```bash
npm run deploy
```

> `deploy` sube `dist` a `gh-pages`.

Si se despliega el código fuente (por ejemplo `index.html` con `src/main.tsx`) en lugar de `dist`, el navegador intentará cargar TypeScript directamente y puede responder con MIME type incorrecto.

## APIs utilizadas

- MusicBrainz Releases API: `https://musicbrainz.org/ws/2/release/?query={texto}&fmt=json`
- Cover Art Archive por release ID: `https://coverartarchive.org/release/{releaseId}/front`

## Flujo de búsqueda

1. El usuario escribe un término libre (artista, álbum o disco) y hace clic en **Buscar**.
2. La app consulta MusicBrainz para obtener una lista de releases.
3. Cada release se normaliza para la UI.
4. Con el `releaseId` de cada resultado se construye la URL de portada de Cover Art Archive.
5. Si una imagen falla, se muestra un placeholder de “Sin portada”.

## Estructura principal

- `src/services/musicBrainzService.ts`: consulta y normaliza resultados de MusicBrainz.
- `src/services/coverArtService.ts`: genera URL de portadas por release ID.
- `src/components/*`: componentes de UI.
- `src/types/musicBrainz.ts`: tipos TypeScript de API y modelo normalizado.
