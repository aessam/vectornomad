// The editor only runs under `astro dev` on localhost, but a page from any other site open in the
// same browser could still POST to it. Accept browser requests from this origin only.
export function sameOrigin(request: Request): Response | null {
  const site = request.headers.get('sec-fetch-site');
  const origin = request.headers.get('origin');
  const self = new URL(request.url).origin;
  const ok = (site === 'same-origin' || site === 'none') && (origin === null || origin === self);
  if (ok) return null;
  return new Response(JSON.stringify({ error: 'cross-origin request refused' }), { status: 403, headers: { 'content-type': 'application/json' } });
}

export function requireJson(request: Request): Response | null {
  const ct = request.headers.get('content-type') ?? '';
  return ct.startsWith('application/json') ? null : new Response(JSON.stringify({ error: 'application/json required' }), { status: 415, headers: { 'content-type': 'application/json' } });
}
