// api/magento/[...slug].js
// Generic proxy: /api/magento/<rest-of-path>?q=...
// Set MAGENTO_HOST in Vercel env (e.g. http://13.203.184.96)

export default async function handler(req, res) {
  const { slug = [] } = req.query; // catch-all segments
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const MAGENTO_HOST = process.env.MAGENTO_HOST;
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

  if (!MAGENTO_HOST) {
    return res.status(500).json({ error: 'MAGENTO_HOST not configured on server' });
  }

  // Build upstream URL (preserve querystring)
  const upstreamUrl = `${MAGENTO_HOST}/${path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

  try {
    // Prepare headers to forward (strip hop-by-hop and host)
    const forwardHeaders = {};
    for (const [k, v] of Object.entries(req.headers || {})) {
      if (['host', 'connection', 'content-length', 'accept-encoding'].includes(k)) continue;
      forwardHeaders[k] = v;
    }

    // Force JSON accept by default for Magento REST
    if (!forwardHeaders['accept']) forwardHeaders['accept'] = 'application/json';

    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body ? req.body : req,
      // Note: Node fetch in Vercel supports streaming of req.body
    });

    // Copy relevant response headers
    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);
    // CORS: allow your frontend origin(s)
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    // Reply with exact status & body
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    console.error('magento proxy error:', err);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
    res.status(502).json({ error: 'Upstream proxy failed', detail: String(err) });
  }
}

// Handle OPTIONS preflight quickly (Vercel calls handler for OPTIONS too)
export const config = { api: { bodyParser: true } };
