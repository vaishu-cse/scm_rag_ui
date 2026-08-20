import { getAuthToken } from './auth';

const endpoint = import.meta.env.VITE_UPLOAD_API_URL;

export const uploadEnabled = Boolean(endpoint);

export async function uploadDocuments(files) {
  const form = new FormData();
  // The endpoint takes the same field name repeated, not file[] or numbered fields.
  for (const file of files) form.append('file', file);

  const token = getAuthToken();

  // No content-type header: the browser has to set it so it can add the multipart boundary.
  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(await explain(res));

  return res.json().catch(() => ({}));
}

async function explain(res) {
  try {
    const { detail } = await res.json();
    if (typeof detail === 'string') return detail;
    // FastAPI reports validation problems as a list, and its message beats a bare status code.
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.toLowerCase();
  } catch {
    // Not JSON, so there's nothing better to say than the status.
  }
  return `the server answered ${res.status}`;
}
