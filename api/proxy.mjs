// ============================================================
// FIFA 2026 — Proxy de Manifiestos HLS/DASH
// ============================================================
// Modo de uso:
//   Vercel Edge:  desplegar api/proxy.mjs como serverless function
//   Local Node:   node api/proxy.mjs            (abre :3001)
//   Netlify:      renombrar a netlify/functions/proxy.mjs
//
// Endpoints:
//   GET /api/proxy?stream=rtve1   → extrae .m3u8 de la web y lo devuelve reescrito
//   GET /api/proxy?url=<encoded>   → proxy directo de cualquier recurso HLS (segmentos, playlists)
// ============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Origin, Referer, User-Agent, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// ============================================================
// CONFIGURACIÓN DE CADA EMISORA
// ============================================================
// Cada entrada define:
//   pageUrl      → URL de la página del directo
//   origin       → Origin HTTP a falsear
//   referrer     → Referer HTTP a falsear
//   pattern      → regex para extraer el manifiesto del HTML
//   type         → 'hls' | 'dash'
//   auth         → true si requiere autenticación (cookies)

// ============================================================
// Cada entrada soporta dos modos:
//   streamUrl → URL directa del manifiesto (modo "proxy directo", sin scraping)
//   pageUrl   → URL de la página del directo (modo scraping, fallback)
//   origin, referrer, pattern, type, auth, label
// ============================================================
const SITES = {
  rtve1: {
    streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la1/la1_main.m3u8',
    pageUrl: 'https://www.rtve.es/play/videos/directo/canales-lineales/la-1/',
    origin: 'https://www.rtve.es',
    referrer: 'https://www.rtve.es/play/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'RTVE La 1'
  },
  rtve2: {
    streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/la2/la2_main.m3u8',
    pageUrl: 'https://www.rtve.es/play/videos/directo/canales-lineales/la-2/',
    origin: 'https://www.rtve.es',
    referrer: 'https://www.rtve.es/play/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'RTVE La 2'
  },
  rtveTD: {
    streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/tdp/tdp_main.m3u8',
    pageUrl: 'https://www.rtve.es/play/videos/directo/canales-lineales/tdp/',
    origin: 'https://www.rtve.es',
    referrer: 'https://www.rtve.es/play/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'RTVE Teledeporte'
  },
  rtve24h: {
    streamUrl: 'https://rtvelivestream.rtve.es/rtvesec/24h/24h_main.m3u8',
    pageUrl: 'https://www.rtve.es/play/videos/directo/canales-lineales/24h/',
    origin: 'https://www.rtve.es',
    referrer: 'https://www.rtve.es/play/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'RTVE 24h'
  },
  tvrsport: {
    streamUrl: 'https://tvr-sport.lg.mncdn.com/tvrsport/smil:tvrsport.smil/playlist.m3u8',
    origin: 'https://tvr-sport.lg.mncdn.com',
    referrer: 'https://www.tvr.ro/',
    type: 'hls',
    auth: false,
    label: 'TVR Sport'
  },
  tvpworld: {
    streamUrl: 'https://lowa8026-cmyk.github.io/tvpvod/399731.m3u8',
    origin: 'https://lowa8026-cmyk.github.io',
    referrer: 'https://tvpworld.com/',
    type: 'hls',
    auth: false,
    label: 'TVP World'
  },
  bbc: {
    pageUrl: 'https://www.bbc.co.uk/iplayer/live/bbc',
    origin: 'https://www.bbc.co.uk',
    referrer: 'https://www.bbc.co.uk/iplayer/',
    pattern: /https?:\/\/[^"'\s]+\.mpd[^"'\s]*/,
    type: 'dash',
    auth: true,
    label: 'BBC iPlayer'
  },
  itv: {
    pageUrl: 'https://www.itv.com/watch',
    origin: 'https://www.itv.com',
    referrer: 'https://www.itv.com/watch/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: true,
    label: 'ITVX'
  },
  sbs: {
    pageUrl: 'https://www.sbs.com.au/ondemand/',
    origin: 'https://www.sbs.com.au',
    referrer: 'https://www.sbs.com.au/ondemand/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: true,
    label: 'SBS On Demand'
  },
  vix: {
    pageUrl: 'https://vix.com/es-es/canal/fifa-mundial-2026',
    origin: 'https://vix.com',
    referrer: 'https://vix.com/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: true,
    label: 'ViX'
  },
  azteca: {
    pageUrl: 'https://www.aztecadeportes.com/envivo/',
    origin: 'https://www.aztecadeportes.com',
    referrer: 'https://www.aztecadeportes.com/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'Azteca Deportes'
  },
  globo: {
    pageUrl: 'https://globoplay.globo.com/',
    origin: 'https://globoplay.globo.com',
    referrer: 'https://globoplay.globo.com/',
    pattern: /https?:\/\/[^"'\s]+\.(m3u8|mpd)[^"'\s]*/,
    type: 'hls',
    auth: true,
    label: 'Globoplay'
  },
  mewatch: {
    pageUrl: 'https://www.mewatch.sg/live',
    origin: 'https://www.mewatch.sg',
    referrer: 'https://www.mewatch.sg/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: true,
    label: 'mewatch'
  },
  caracol: {
    pageUrl: 'https://www.caracoltv.com/',
    origin: 'https://www.caracoltv.com',
    referrer: 'https://www.caracoltv.com/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'Caracol Play'
  },
  rcn: {
    pageUrl: 'https://www.rcnradio.com/deportes',
    origin: 'https://www.rcnradio.com',
    referrer: 'https://www.rcnradio.com/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'Deportes RCN'
  },
  fifa: {
    pageUrl: 'https://www.plus.fifa.com/',
    origin: 'https://www.plus.fifa.com',
    referrer: 'https://www.plus.fifa.com/',
    pattern: /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/,
    type: 'hls',
    auth: false,
    label: 'FIFA+'
  },
};

// ============================================================
// USER-AGENT COMÚN (evita bloqueos)
// ============================================================
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

// ============================================================
// MANEJADOR PRINCIPAL
// ============================================================
async function handleRequest(req) {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');
  const streamId = url.searchParams.get('stream');

  // ==========================================================
  // CASO 1: Proxy directo de un recurso (?url=...)
  // Se usa para segmentos .ts, playlists variantes, etc.
  // ==========================================================
  if (targetUrl) {
    return proxyResource(targetUrl, req);
  }

  // ==========================================================
  // CASO 2: Extraer manifiesto de una emisora (?stream=...)
  // ==========================================================
  if (streamId) {
    return extractManifest(streamId, req);
  }

  return jsonResponse({ error: 'Parámetro ?stream= o ?url= requerido' }, 400);
}

// ============================================================
// PROXY DIRECTO DE UN RECURSO
// ============================================================
async function proxyResource(resourceUrl, req) {
  try {
    const decodedUrl = decodeURIComponent(resourceUrl);
    const range = req.headers.get('range') || '';

    const fetchHeaders = {
      'User-Agent': UA,
      'Origin': new URL(decodedUrl).origin,
      'Referer': new URL(decodedUrl).origin + '/',
    };
    if (range) fetchHeaders['Range'] = range;

    const response = await fetch(decodedUrl, { headers: fetchHeaders });

    const resHeaders = {
      ...CORS_HEADERS,
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Cache-Control': 'public, max-age=30',
    };

    // Pasar cabeceras de rango para soporte de búsqueda en video
    if (response.headers.get('Content-Range')) {
      resHeaders['Content-Range'] = response.headers.get('Content-Range');
    }
    if (response.headers.get('Content-Length')) {
      resHeaders['Content-Length'] = response.headers.get('Content-Length');
    }
    if (response.headers.get('Accept-Ranges')) {
      resHeaders['Accept-Ranges'] = response.headers.get('Accept-Ranges');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return jsonResponse({ error: 'Error al proxyar recurso: ' + err.message }, 502);
  }
}

// ============================================================
// EXTRACCIÓN DE MANIFIESTO DESDE LA WEB DE LA EMISORA
// ============================================================
async function extractManifest(streamId, req) {
  const site = SITES[streamId];
  if (!site) {
    return jsonResponse({ error: 'Emisora desconocida: ' + streamId }, 404);
  }

  try {
    // 1. Obtener URL del manifiesto
    let rawManifestUrl = null;

    // Modo A: URL directa conocida (streamUrl) — más rápido, sin scraping
    if (site.streamUrl) {
      rawManifestUrl = site.streamUrl;
    }

    // Modo B: Scrapear la página del directo para extraer la URL
    if (!rawManifestUrl && site.pageUrl) {
      const pageHeaders = {
        'User-Agent': UA,
        'Origin': site.origin,
        'Referer': site.referrer,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      };

      const pageRes = await fetch(site.pageUrl, { headers: pageHeaders });
      const html = await pageRes.text();

      let manifestUrl = html.match(site.pattern);

      if (!manifestUrl) {
        const jsonPatterns = [
          /window\.__INITIAL_STATE__\s*=\s*({.*?});/s,
          /window\.__DATA__\s*=\s*({.*?});/s,
          /<script id="__NEXT_DATA__"[^>]*>({.*?})<\/script>/s,
          /window\.__PRELOADED_STATE__\s*=\s*({.*?});/s,
        ];

        for (const jp of jsonPatterns) {
          const jsonMatch = html.match(jp);
          if (jsonMatch) {
            try {
              const state = JSON.parse(jsonMatch[1]);
              const found = deepFindUrl(state, site.type);
              if (found) {
                manifestUrl = [found];
                break;
              }
            } catch (e) {}
          }
        }
      }

      if (manifestUrl) {
        rawManifestUrl = manifestUrl[0].replace(/&amp;/g, '&');
      }
    }

    if (!rawManifestUrl) {
      return jsonResponse({
        error: 'No se pudo obtener el manifiesto de ' + site.label,
        hint: 'La URL directa puede haber expirado o la página haber cambiado.'
      }, 502);
    }

    // 3. Obtener el contenido del manifiesto
    const manifestHeaders = {
      'User-Agent': UA,
      'Origin': site.origin,
      'Referer': site.pageUrl,
      'Accept': '*/*',
    };
    const manifestRes = await fetch(rawManifestUrl, { headers: manifestHeaders });
    let manifestText = await manifestRes.text();

    // 4. Reescribir URLs en el manifiesto para que pasen por el proxy
    const baseUrl = rawManifestUrl.substring(0, rawManifestUrl.lastIndexOf('/') + 1);
    manifestText = rewriteManifestUrls(manifestText, baseUrl, site.pageUrl);

    // 5. Devolver manifiesto reescrito con CORS
    const contentType = site.type === 'dash'
      ? 'application/dash+xml'
      : 'application/vnd.apple.mpegurl';

    return new Response(manifestText, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-Stream': streamId,
        'X-Proxy-Source': rawManifestUrl,
      },
    });

  } catch (err) {
    return jsonResponse({ error: 'Error al extraer manifiesto: ' + err.message }, 502);
  }
}

// ============================================================
// REESCRITURA DE URLS EN EL MANIFIESTO
// ============================================================
// Convierte URLs absolutas y relativas dentro del .m3u8/.mpd
// para que apunten al proxy (/api/proxy?url=...)
function rewriteManifestUrls(manifest, baseUrl, pageUrl) {
  // HLS (.m3u8)
  // Reescribe líneas que contienen URLs de recursos:
  //   - Líneas que empiezan con http (URLs absolutas)
  //   - Líneas después de #EXTINF (segmentos)
  //   - Líneas después de #EXT-X-STREAM-INF (playlists variantes)
  //   - Líneas después de #EXT-X-MAP (inicializadores)
  //   - URLs en cabeceras #EXT-X-KEY, #EXT-X-SESSION-KEY, etc.
  if (!manifest.includes('<xml') && !manifest.includes('<MPD')) {
    // Es HLS
    return manifest.replace(
      /^(https?:\/\/[^\s#]+|(?!#)(?!https?)[^\s#]+\.(?:m3u8|ts|aac|mp4|vtt|webvtt|key|m4s))(?:\s*)$/gm,
      (line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        // Si ya está proxyada, no reescribir
        if (trimmed.includes('/api/proxy?url=')) return line;

        let absoluteUrl;
        if (trimmed.startsWith('http')) {
          absoluteUrl = trimmed;
        } else if (trimmed.startsWith('/')) {
          absoluteUrl = new URL(trimmed, pageUrl).href;
        } else {
          absoluteUrl = new URL(trimmed, baseUrl).href;
        }
        const encoded = encodeURIComponent(absoluteUrl);
        // Preservar espacios al inicio (indentación)
        const indent = line.match(/^\s*/)[0];
        return indent + '/api/proxy?url=' + encoded;
      }
    );
  }

  // DASH (.mpd)
  if (manifest.includes('<MPD') || manifest.includes('<mpd')) {
    return manifest.replace(
      /(baseURL|sourceURL|media|initialization)="([^"]+)"/gi,
      (attr, key, val) => {
        if (val.startsWith('http') && !val.includes('/api/proxy')) {
          const encoded = encodeURIComponent(val);
          return `${key}="/api/proxy?url=${encoded}"`;
        }
        if (!val.startsWith('http') && !val.startsWith('/api/proxy')) {
          const absolute = val.startsWith('/')
            ? new URL(val, pageUrl).href
            : new URL(val, baseUrl).href;
          const encoded = encodeURIComponent(absolute);
          return `${key}="/api/proxy?url=${encoded}"`;
        }
        return attr;
      }
    );
  }

  return manifest;
}

// ============================================================
// BÚSQUEDA PROFUNDA DE URL DE MANIFIESTO EN OBJETOS JSON
// ============================================================
function deepFindUrl(obj, type) {
  const ext = type === 'dash' ? 'mpd' : 'm3u8';
  const results = [];

  function search(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(search);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        if (value.includes('.' + ext) && (value.startsWith('http') || value.startsWith('//'))) {
          results.push(value.startsWith('//') ? 'https:' + value : value);
        }
      } else if (typeof value === 'object') {
        search(value);
      }
    }
  }

  search(obj);
  return results.length > 0 ? results[0] : null;
}

// ============================================================
// HELPERS
// ============================================================
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

// ============================================================
// EXPORT (Vercel Edge / Netlify)
// ============================================================
export default handleRequest;
export const config = { runtime: 'edge' };
