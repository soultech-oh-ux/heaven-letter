const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const table = 'meditation_letters';

function configured() {
  if (!base || !secret) throw new Error('SUPABASE_NOT_CONFIGURED');
}
function headers(extra = {}) {
  return {
    apikey: secret,
    Authorization: 'Bearer ' + secret,
    'Content-Type': 'application/json',
    ...extra
  };
}
async function request(method, path, body, prefer) {
  configured();
  const response = await fetch(base + '/rest/v1/' + table + path, {
    method,
    headers: headers(prefer ? { Prefer: prefer } : {}),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('SUPABASE_REQUEST_FAILED_' + response.status);
  return response.status === 204 ? null : response.json();
}
async function readVersion(id) {
  if (!/^[a-f0-9]{24}$/.test(id || '')) return null;
  const rows = await request('GET', '?id=eq.' + encodeURIComponent(id) + '&select=payload&limit=1');
  return rows?.[0]?.payload || null;
}
async function read() {
  const rows = await request('GET', '?id=eq.latest&select=payload&limit=1');
  return rows?.[0]?.payload || null;
}
async function publishAtomically(id, payload) {
  if (!/^[a-f0-9]{24}$/.test(id || '')) throw new Error('INVALID_ID');
  configured();
  const response = await fetch(base + '/rest/v1/rpc/publish_meditation_letter', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ p_id: id, p_payload: payload }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('SUPABASE_ATOMIC_PUBLISH_FAILED_' + response.status);
}
module.exports = { read, readVersion, publishAtomically };
