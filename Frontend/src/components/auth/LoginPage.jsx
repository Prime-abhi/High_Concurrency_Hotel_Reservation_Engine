import { useState } from 'react'

// Hardcoded demo credentials — no real auth backend needed
const ADMIN_CREDS = { email: 'admin@meridian.com', password: 'admin123' }
const GUEST_CREDS = { email: 'guest@meridian.com', password: 'guest123' }

export default function LoginPage({ role, onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const isAdmin = role === 'admin'
  const creds = isAdmin ? ADMIN_CREDS : GUEST_CREDS
  const hint = isAdmin
    ? `Demo: ${ADMIN_CREDS.email} / ${ADMIN_CREDS.password}`
    : `Demo: ${GUEST_CREDS.email} / ${GUEST_CREDS.password}`

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (email.trim().toLowerCase() === creds.email && password === creds.password) {
      onLogin(role)
    } else {
      setError('Incorrect email or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(circle at 20% 20%, #23302b 0%, #1C2321 60%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-[10px] bg-brass text-ink flex items-center justify-center font-bold text-base">M</div>
          <span className="text-stone text-lg font-semibold">Meridian Hotels</span>
        </div>

        <div className="bg-stone rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
              style={{ background: isAdmin ? '#3d5a4a22' : '#c8a44a22', color: isAdmin ? '#3d5a4a' : '#8a6a1a' }}>
              {isAdmin ? '🗝️ Hotel Admin' : '🛎️ Guest'}
            </span>
            <h2 className="font-display text-2xl m-0">Sign in</h2>
            <p className="text-sm text-slate mt-1">{hint}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate font-semibold mb-1.5">
                Email address
              </label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder={creds.email}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate font-semibold mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              />
            </div>

            {error && (
              <p className="text-rust text-sm bg-rust/10 border border-rust/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg py-2.5 font-bold text-sm mt-2"
              style={{ background: isAdmin ? '#1C2321' : '#3d5a4a', color: '#f5f0e8' }}
            >
              Sign in
            </button>
          </form>

          <button onClick={onBack} className="mt-4 w-full text-center text-xs text-slate hover:text-ink font-medium">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
