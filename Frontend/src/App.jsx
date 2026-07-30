import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from './api/client'
import LandingPicker from './components/LandingPicker'
import LoginPage from './components/auth/LoginPage'
import GuestDashboard from './components/guest/GuestDashboard'
import AdminDashboard from './components/admin/AdminDashboard'

// screen values: 'landing' | 'guest-login' | 'admin-login' | 'guest' | 'admin'
export default function App() {
  const [screen, setScreen] = useState('landing')
  const [hotels, setHotels] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.listHotels().then(setHotels).catch((err) => setError(extractErrorMessage(err)))
  }, [])

  function handleHotelAdded(hotel) {
    setHotels(prev => [...prev, hotel])
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink text-stone text-center">
        <div>
          <p className="font-display text-xl mb-2">Couldn't reach the booking API</p>
          <p className="text-sm text-stone/70">{error}</p>
          <p className="text-xs text-stone/50 mt-3">
            Make sure the Spring Boot backend is running at the URL set in VITE_API_BASE_URL.
          </p>
        </div>
      </div>
    )
  }

  if (hotels.length === 0 && screen !== 'landing' && screen !== 'guest-login' && screen !== 'admin-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone">
        <p className="text-slate text-sm">Loading properties…</p>
      </div>
    )
  }

  if (screen === 'landing') return <LandingPicker onSelect={setScreen} />

  if (screen === 'guest-login') {
    return (
      <LoginPage
        role="guest"
        onLogin={() => setScreen('guest')}
        onBack={() => setScreen('landing')}
      />
    )
  }

  if (screen === 'admin-login') {
    return (
      <LoginPage
        role="admin"
        onLogin={() => setScreen('admin')}
        onBack={() => setScreen('landing')}
      />
    )
  }

  if (screen === 'guest') {
    return (
      <GuestDashboard
        hotels={hotels}
        onSwitchRole={() => setScreen('admin-login')}
        onLogoClick={() => setScreen('landing')}
      />
    )
  }

  return (
    <AdminDashboard
      hotels={hotels}
      onSwitchRole={() => setScreen('guest-login')}
      onLogoClick={() => setScreen('landing')}
      onHotelAdded={handleHotelAdded}
    />
  )
}
