# chat-ui

A chat interface built with React, Vite and Tailwind. It ships with a placeholder brain, so it
streams and renders properly without any API key — point one environment variable at a backend to
make the answers real.

Needs Node 18 or newer.

    npm install
    npm run dev

## How it fits together

    src/chat.js          the only thing that knows where words come from
    src/upload.js        posting documents to the knowledge base
    src/mockReplies.js   canned answers for when no backend is configured
    src/useChat.js       threads, sending, streaming, aborting, regenerating
    src/storage.js       localStorage
    src/index.css        colour tokens for both themes, prose and syntax rules

Colours are CSS custom properties declared once in `index.css` and flipped by a `data-theme`
attribute on `<html>`. Changing the accent, the warmth of the greys or the syntax palette means
editing that one block — nothing else hardcodes a colour.

Four themes ship: Light and Dark are flat, Midnight lays a black-to-navy gradient behind the
chrome, and Aero frosts it. The last two work through three extra tokens — `--bg-image`, `--chrome`
and `--glass` — which the flat themes leave switched off, so adding a fifth theme is a new
`[data-theme='…']` block and one entry in `components/ThemeMenu.jsx`.

Keyboard: `Enter` sends, `Shift+Enter` starts a new line, `Ctrl/⌘+K` opens a new chat, `Esc` stops a
reply that's still coming.

## The backend

`streamReply` in `src/chat.js` posts to `VITE_CHAT_API_URL` when it's set and falls back to the mock
when it isn't. `.env.local` already sets it, so `npm run dev` talks to the real thing; delete that
file to go back to canned answers.

The contract:

    POST /api/chat
    { "message": "what are the categories in inventory?" }

    200 OK
    { "response_id": "resp_0040…", "answer": "The categories in inventory…" }

Documents go in through a second endpoint, reached by the **Add documents** control in the composer:

    POST /api/documents/upload
    multipart/form-data, the field name "file" repeated once per document

    422
    { "detail": [{ "msg": "Field required", "loc": ["body", "file"] }] }

Anything in the 2xx range counts as accepted. On a rejection the UI shows FastAPI's `detail[0].msg`
rather than a bare status code, because "unsupported file type" is worth more than "422". The
control only renders when `VITE_UPLOAD_API_URL` is set, so the mock never offers an upload that
would go nowhere.

The variables, all in `.env.local`:

    VITE_CHAT_API_URL=/api/chat                   # where questions go
    VITE_UPLOAD_API_URL=/api/documents/upload     # where documents go
    VITE_API_TARGET=http://localhost:8000         # where the dev proxy forwards /api

`VITE_CHAT_API_URL` stays relative on purpose. It resolves against whatever origin served the page,
so the same build artifact works on a laptop, in staging and in production with no rebuild and no
CORS. `VITE_API_TARGET` is read by `vite.config.js` when it sets up the dev proxy; it is the local
stand-in for the gateway and is not referenced by any client code.

## Deploying behind a gateway

`npm run build` writes static files to `dist/`. The dev proxy does not travel with them — the
gateway in front of the app owns that routing:

    /            ->  dist/, with any unmatched path falling back to index.html
    /api/chat    ->  the chat service

The SPA fallback matters: a hard refresh on any path has to return `index.html` rather than a 404.

If the gateway mounts the UI somewhere other than the root, build with `PUBLIC_BASE` set to that
path — `PUBLIC_BASE=/chat/ npm run build` — or the asset URLs come out absolute from `/` and 404.
`VITE_CHAT_API_URL` is independent of it, so set that to whatever path the gateway exposes.

`npm run preview` serves the built bundle and reuses the dev proxy, which makes it a real smoke test
of a production build before it ships.

Three things worth knowing about that contract:

- **Only the newest question is sent.** The payload has room for one `message`, so follow-ups like
  "what about the second one?" only work if the server keeps its own conversation state. The
  `response_id` coming back looks like the handle for that — if the API grows a way to pass it back,
  `streamFromServer` is where it goes.
- **Citations are stripped.** Answers arrive with file-search markers like `【3:0†source】` in the
  prose. They render as nothing useful, so `tidy()` removes them along with any space they leave
  stranded before punctuation.
- **The answer is revealed a word at a time.** It arrives in one piece; `reveal()` hands it to the
  UI gradually so the caret and the stop button still mean something. It adds about 9ms per word —
  yield the whole string instead to turn it off.

## Building

    npm run build      # static bundle in dist/
    npm run preview    # serve that bundle locally

Everything in `dist/` is public, including any `VITE_`-prefixed variable that was set at build time.
Keep the API key on the server.
