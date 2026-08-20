import { useState } from 'react';

export default function AuthPage({ mode, onSubmit, onSwitchMode, submitting, error, success }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const emailAutocomplete = 'off';
  const passwordAutocomplete = 'off';

  function updateField(field) {
    return event => {
      setForm(current => ({ ...current, [field]: event.target.value }));
    };
  }

  function submit(event) {
    event.preventDefault();
    const payload = {
      ...(mode === 'signup' ? { name: form.name.trim() } : {}),
      email: form.email.trim(),
      password: form.password,
    };

    onSubmit(payload);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-soft">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-muted">SCM Assistant</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-4" autoComplete="off">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={updateField('name')}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                defaultValue=""
                className="focus-ring w-full rounded-control border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted"
                placeholder=""
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              required
              autoComplete={emailAutocomplete}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              defaultValue=""
              className="focus-ring w-full rounded-control border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted"
              placeholder=""
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              required
              minLength={6}
              autoComplete={passwordAutocomplete}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              defaultValue=""
              className="focus-ring w-full rounded-control border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted"
              placeholder=""
            />
          </label>

          {error && (
            <div className="rounded-control border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-control border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-control bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : mode === 'signup' ? 'Sign up' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-medium text-accent underline-offset-2 hover:underline"
          >
            {mode === 'signup' ? 'Login' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
