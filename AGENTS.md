# FIFA 2026 Media Center — Proxy de Manifiestos

## Desarrollo local

```bash
node server.mjs
# Abre http://localhost:3001
```

## Despliegue en Vercel

```bash
npm i -g vercel
vercel --prod
```

El endpoint `/api/proxy?stream=rtve1` se despliega automáticamente.

## Estructura

```
├── index.html          → Frontend (SPA)
├── api/proxy.mjs       → Edge Function (Vercel)
├── server.mjs          → Servidor local Node.js
├── vercel.json         → Config Vercel
└── package.json
```

## Probar el proxy

```bash
curl http://localhost:3001/api/proxy?stream=rtve1
# → Devuelve el .m3u8 reescrito con URLs apuntando al proxy
```

## Añadir una emisora

En `api/proxy.mjs`, añadir entrada al objeto `SITES` con:
- `pageUrl`: URL de la página del directo
- `pattern`: regex para extraer el manifiesto del HTML
- `type`: `'hls'` o `'dash'`

En `index.html`, añadir entrada al array `__STREAMS` con:
- `url: '/api/proxy?stream=ID'`
- `iframe: 'URL del embed oficial'`
