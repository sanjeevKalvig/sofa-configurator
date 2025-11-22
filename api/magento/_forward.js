// api/magento/_forward.js
const MAGENTO_HOST = process.env.MAGENTO_HOST;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

function buildForwardHeaders(req) {
  const forward = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (['connection','content-length','accept-encoding'].includes(k)) continue;
    forward[k] = v;
  }
  try { forward['host'] = new URL(MAGENTO_HOST).host; } catch {}
  if (!forward['accept']) forward['accept'] = 'application/json';
  return forward;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // If you need cookies across domains (not recommended here), also set:
  // res.setHeader('Access-Control-Allow-Credentials', 'true');
}

async function fetchUpstream(path, opts = {}) {
  const upstreamUrl = `${MAGENTO_HOST}${path}`;
  return fetch(upstreamUrl, opts);
}

module.exports = { MAGENTO_HOST, ALLOWED_ORIGINS, buildForwardHeaders, setCors, fetchUpstream };
