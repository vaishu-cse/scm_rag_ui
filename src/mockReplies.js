import { pause } from './pause';

const replies = [
  {
    match: /^(hi|hey+|hello|yo|good (morning|afternoon|evening))\b/i,
    text: `Hey. I'm a placeholder, so treat anything I say as scenery rather than fact — but the interface around me is real. Streaming, markdown, syntax highlighting, threads that survive a reload.

Ask for some code, or how flexbox and grid differ, and you'll see most of it at once.`,
  },
  {
    match: /\b(code|function|snippet|script|implement|write me)\b/i,
    text: `Here's a retry helper with exponential backoff. It gives up instead of looping forever, which is the part people usually leave out:

\`\`\`python
import time


def retry(fn, attempts=4, base=0.5):
    for attempt in range(attempts):
        try:
            return fn()
        except TimeoutError:
            if attempt == attempts - 1:
                raise
            time.sleep(base * 2**attempt)
\`\`\`

Two details worth keeping. The sleep sits *between* attempts rather than before the first one, so a call that succeeds immediately costs nothing. And it only catches \`TimeoutError\` — a bare \`except Exception\` here would cheerfully retry a typo four times before surfacing it.`,
  },
  {
    match: /\b(vs\.?|versus|difference|compare|better than)\b/i,
    text: `Short version: flexbox for one axis, grid when you need both.

| | Flexbox | Grid |
|---|---|---|
| Thinks in | one direction at a time | rows and columns together |
| Sizing driven by | the content | the container |
| Suits | toolbars, button rows, nav | page skeletons, galleries |
| Overlapping items | no | yes, via named areas |

Most real layouts use both — grid for the page structure, flex inside each region. Reaching for grid to lay out three buttons in a row is where it starts feeling like work.`,
  },
  {
    match: /\b(abort|cancel|signal|stop)\w*\b/i,
    text: `\`AbortController\` is two objects wearing one coat. The controller has a single useful method, \`abort()\`. Its \`signal\` is the half you hand to anything that might need stopping:

\`\`\`js
const controller = new AbortController();

fetch(url, { signal: controller.signal });
controller.abort();
\`\`\`

Anything that accepts a signal — \`fetch\`, \`addEventListener\`, most stream APIs — unwinds itself when it fires. \`fetch\` rejects with an \`AbortError\`, which is why cancelling and failing need separate handling. Treating them alike is how you end up flashing an error at someone who simply changed their mind.

This app uses one to stop me mid-sentence. Try it.`,
  },
  {
    match: /\b(steps?|how do i|deploy|ship|host|set ?up|install)\b/i,
    text: `Roughly in order:

1. **Get it running locally.** \`npm install\`, \`npm run dev\`. If it misbehaves here it will misbehave everywhere else too.
2. **Build it.** \`npm run build\` writes a static bundle to \`dist/\`. Nothing in there needs a Node runtime.
3. **Serve \`dist/\` from anything.** Nginx, S3 behind CloudFront, Netlify, a container with Caddy in it. Static files have no opinions about hosting.
4. **Keep the API key on a server, not in the bundle.** Everything under \`dist/\` is public by definition, including any environment variable Vite inlined while building.

Step four is the one that bites, because it works perfectly right up until someone reads your JavaScript.`,
  },
];

const fallback = `I don't actually know anything. I match your message against a handful of patterns and stream back an answer someone typed out by hand — enough to exercise the interface, not much else.

To make it real, point \`VITE_CHAT_API_URL\` at a small server that holds your key and proxies the model API. \`src/chat.js\` switches over the moment that variable exists and nothing in the UI has to change; the README has a server you can paste.

Meanwhile, try asking for some code, or what the difference between flexbox and grid is.`;

function replyTo(text) {
  return replies.find(reply => reply.match.test(text))?.text ?? fallback;
}

export async function* mockStream(messages, signal) {
  const asked = messages.findLast(m => m.role === 'user');
  const text = replyTo(asked?.content ?? '');

  await pause(320, signal);

  // Trailing whitespace stays attached to each word so newlines survive and the
  // markdown parses the same way half-written as it does finished.
  for (const word of text.match(/\S+\s*/g) ?? []) {
    if (signal?.aborted) return;
    yield word;
    await pause(18 + Math.random() * 27, signal);
  }
}
