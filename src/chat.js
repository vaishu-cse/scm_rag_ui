import { mockStream } from './mockReplies';
import { pause } from './pause';
import { getAuthToken } from './auth';

const endpoint = import.meta.env.VITE_CHAT_API_URL;

export const usingMock = !endpoint;

// The backend puts file-search citations like 【3:0†source】 in the prose. They don't
// render as anything a reader can use, so they don't reach the page.
const citation = /【[^】]*】/g;

export async function* streamReply(messages, { signal } = {}) {
  if (endpoint) yield* streamFromServer(messages, signal);
  else yield* mockStream(messages, signal);
}

async function* streamFromServer(messages, signal) {
  // The endpoint takes one question and keeps no history of its own on this side, so
  // only the message that prompted this reply gets sent.
  const question = messages.findLast(m => m.role === 'user')?.content ?? '';
  const token = getAuthToken();

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message: question }),
    signal,
  });

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(detail || `the server answered ${res.status}`);
  }

  const body = await res.json();
  if (typeof body.answer !== 'string') throw new Error('the reply had no answer in it');

  yield* reveal(tidy(body.answer), signal);
}

async function safeText(res) {
  try {
    const data = await res.clone().json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    if (typeof data?.message === 'string') return data.message;
  } catch {
    // ignore and fall back to status-only text
  }
  return '';
}

function tidy(answer) {
  return answer
    .replace(citation, '')
    .replace(/[ \t]+([.,;:!?])/g, '$1')
    .trim();
}

// The answer arrives complete rather than as a stream. Handing it over a word at a time
// keeps the caret and the stop button honest; yield `text` in one piece to turn that off.
async function* reveal(text, signal) {
  for (const word of text.match(/\S+\s*/g) ?? []) {
    if (signal?.aborted) return;
    yield word;
    await pause(9, signal);
  }
}
