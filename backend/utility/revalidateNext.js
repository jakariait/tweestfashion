// Fire-and-forget cache revalidation for the Next.js frontend.
// After a content mutation the backend pings Next's /api/revalidate route so
// ISR pages regenerate immediately instead of waiting for the revalidate window.
// Configure via env:
//   NEXT_REVALIDATE_URL  e.g. http://localhost:3000/api/revalidate
//   NEXT_REVALIDATE_SECRET  must match REVALIDATE_SECRET in the frontend .env

const REVALIDATE_URL = process.env.NEXT_REVALIDATE_URL || 'http://localhost:3000/api/revalidate';
const REVALIDATE_SECRET = process.env.NEXT_REVALIDATE_SECRET || '';

function revalidateNext({ tag, path } = {}) {
  if (!REVALIDATE_SECRET) return;
  const params = new URLSearchParams({ secret: REVALIDATE_SECRET });
  if (tag) params.set('tag', tag);
  if (path) params.set('path', path);
  const url = `${REVALIDATE_URL}?${params.toString()}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        console.warn(`[revalidate] failed for ${tag || path}: ${res.status}`);
      }
    })
    .catch((err) => console.warn('[revalidate] request error:', err.message));
}

module.exports = { revalidateNext };
