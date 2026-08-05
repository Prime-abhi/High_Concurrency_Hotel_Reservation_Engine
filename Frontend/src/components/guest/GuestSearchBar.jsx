import { useState } from 'react'

function todayPlus(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function GuestSearchBar({ hotels, hotelId, onHotelChange, onSearch, loading }) {
  const [checkIn, setCheckIn] = useState(todayPlus(1))
  const [checkOut, setCheckOut] = useState(todayPlus(3))
  const [guests, setGuests] = useState(2)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (checkOut <= checkIn) { setError('Check-out must be after check-in.'); return }
    setError('')
    onSearch({ checkIn, checkOut, guests })
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-white border border-black/[0.08] shadow-[0_6px_20px_rgba(28,35,33,0.06)] rounded-xl p-5 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3.5 items-end mb-7">
      <div>
        <label className="block text-[11px] uppercase tracking-wide text-slate font-semibold mb-1.5">Property</label>
        <select
          value={hotelId}
          onChange={(e) => onHotelChange(Number(e.target.value))}
          className="w-full border border-black/[0.12] rounded-lg px-3 py-2.5 text-sm"
        >
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name} — {h.city}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wide text-slate font-semibold mb-1.5">Check-in</label>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
          className="w-full border border-black/[0.12] rounded-lg px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wide text-slate font-semibold mb-1.5">Check-out</label>
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
          className="w-full border border-black/[0.12] rounded-lg px-3 py-2.5 text-sm" />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wide text-slate font-semibold mb-1.5">Guests</label>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full border border-black/[0.12] rounded-lg px-3 py-2.5 text-sm">
          <option value={1}>1 guest</option>
          <option value={2}>2 guests</option>
          <option value={3}>3 guests</option>
          <option value={4}>4+ guests</option>
        </select>
      </div>
      <button type="submit" disabled={loading}
        className="bg-ink text-stone rounded-lg px-6 py-2.5 font-semibold text-sm disabled:opacity-60 whitespace-nowrap">
        {loading ? 'Searching…' : 'Search'}
      </button>
      {error && <p className="text-rust text-xs md:col-span-5">{error}</p>}
    </form>
  )
}
