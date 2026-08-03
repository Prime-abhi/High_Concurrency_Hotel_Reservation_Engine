import { useState } from 'react'
import { api, extractErrorMessage } from '../../api/client'

export default function AddHotelModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Hotel name is required.'); return }
    setError('')
    setSubmitting(true)
    try {
      const hotel = await api.createHotel({ name: name.trim(), city: city.trim(), address: address.trim() })
      onCreated(hotel)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/55 flex items-center justify-center p-5 z-50">
      <div className="bg-stone rounded-2xl max-w-md w-full p-7 shadow-2xl">
        <p className="font-display text-2xl m-0">Add a new hotel</p>
        <p className="text-sm text-slate mt-1 mb-5">
          The property will appear in the hotel selector immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Hotel name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grand Palace Suites"
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Marine Drive"
              className={inp}
            />
          </div>

          {error && <p className="text-rust text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg py-2.5 border border-black/15 font-bold text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-lg py-2.5 bg-moss text-white font-bold text-sm disabled:opacity-60">
              {submitting ? 'Adding…' : 'Add hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const lbl = "block text-[11px] uppercase tracking-wide text-slate font-semibold mb-1.5"
const inp = "w-full border border-black/15 rounded-lg px-3 py-2.5 text-sm bg-white"
