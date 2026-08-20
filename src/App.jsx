import { useEffect, useRef, useState } from 'react';
import { LogOut, PanelLeft } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Composer from './components/Composer';
import IconButton from './components/IconButton';
import MessageList from './components/MessageList';
import Sidebar from './components/Sidebar';
import ThemeMenu from './components/ThemeMenu';
import { clearAuthSession, getAuthSession, login, saveAuthSession, signup } from './auth';
import { useChat } from './useChat';
import { useTheme } from './useTheme';

export default function App() {
  const [session, setSession] = useState(() => getAuthSession());
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const authenticated = Boolean(session?.access_token);

  async function submitAuth(payload) {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const response = authMode === 'signup' ? await signup(payload) : await login(payload);
      const nextSession = response && (response.id || response.access_token) ? response : null;

      if (!nextSession) {
        throw new Error('Authentication failed. Please try again.');
      }

      if (authMode === 'signup') {
        setAuthSuccess('Signup successful! Please login with your account.');
        setAuthMode('login');
        setAuthLoading(false);
        return;
      }

      saveAuthSession(nextSession);
      setSession(nextSession);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <AuthPage
        mode={authMode}
        onSubmit={submitAuth}
        onSwitchMode={() => {
          setAuthMode(current => (current === 'login' ? 'signup' : 'login'));
          setAuthError('');
          setAuthSuccess('');
        }}
        submitting={authLoading}
        error={authError}
        success={authSuccess}
      />
    );
  }

  return <AuthenticatedApp session={session} onLogout={() => { clearAuthSession(); setSession(null); setAuthMode('login'); setAuthError(''); }} />;
}

function AuthenticatedApp({ session, onLogout }) {
  const chat = useChat();
  const [theme, setTheme] = useTheme();
  const [draft, setDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const inputRef = useRef(null);

  const latest = useRef(chat);
  latest.current = chat;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && latest.current.streaming) {
        latest.current.stop();
        return;
      }
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        latest.current.createThread();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function send() {
    if (chat.send(draft)) setDraft('');
  }

  function pick(prompt) {
    setDraft(prompt);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close chat list"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-10 bg-black/25 md:hidden"
          />
          <Sidebar
            threads={chat.threads}
            activeId={chat.active.id}
            onSelect={id => {
              chat.select(id);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            onCreate={chat.createThread}
            onRemove={chat.removeThread}
            onRename={chat.renameThread}
            className="fixed inset-y-0 left-0 z-20 md:static md:z-auto"
          />
        </>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
          <IconButton label={sidebarOpen ? 'Hide chats' : 'Show chats'} onClick={() => setSidebarOpen(open => !open)}>
            <PanelLeft size={16} />
          </IconButton>

          <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{chat.active.title}</h1>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-line bg-bubble px-2 py-1 text-[11px] text-muted sm:inline-block">
              {session?.user?.name || 'User'}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-line bg-surface px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              <LogOut size={13} />
              Logout
            </button>
            <ThemeMenu theme={theme} onPick={setTheme} />
          </div>
        </header>

        <MessageList
          messages={chat.active.messages}
          streaming={chat.streaming}
          onRegenerate={chat.regenerate}
          onPick={pick}
        />

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={send}
          onStop={chat.stop}
          streaming={chat.streaming}
          inputRef={inputRef}
        />
      </main>
    </div>
  );
}
