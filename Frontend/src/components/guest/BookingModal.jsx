import { useState } from 'react'
import { api, extractErrorMessage } from '../../api/client'
import { ROOM_TYPE_LABEL } from '../../utils/format'

export default function BookingModal({ room, checkIn, checkOut, onClose, onBooked }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [conflictMsg, setConflictMsg] = useState('')  // 409 — room taken by another guest
  const [errorMsg, setErrorMsg] = useState('')        // other errors (validation, server)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setConflictMsg('')
    setErrorMsg('')
    try {
      const reservation = await api.book({
        roomId: room.roomId,
        guestName: name,
        guestEmail: email,
        checkIn,
        checkOut,
      })
      onBooked(reservation, room)
    } catch (err) {
      const status = err?.response?.status
      const msg = extractErrorMessage(err)
      if (status === 409) {
        setConflictMsg(msg)
      } else {
        setErrorMsg(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/55 flex items-center justify-center p-5 z-50">
      <div className="bg-stone rounded-2xl shadow-2xl max-w-md w-full p-7">
        <p className="font-display text-2xl m-0">Confirm reservation</p>
        <p className="text-sm text-slate mt-1">
          {ROOM_TYPE_LABEL[room.roomType] || room.roomType} · Room {room.roomNumber} · {checkIn} → {checkOut}
        </p>

        {/* 409 conflict — room taken — show focused state */}
        {conflictMsg ? (
          <div className="mt-5 bg-rust/10 border border-rust/30 rounded-lg p-4">
            <p className="text-rust font-semibold text-sm m-0">This room just went to another guest</p>
            <p className="text-sm text-slate mt-1 mb-0">{conflictMsg}</p>
            <p className="text-xs text-slate/60 mt-1">Try different dates or choose another room.</p>
            <button onClick={onClose}
              className="mt-4 w-full rounded-lg py-2.5 bg-ink text-stone font-semibold text-sm">
              Search again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Validation / server errors shown inline above form — form stays usable */}
            {errorMsg && (
              <div className="bg-rust/10 border border-rust/20 rounded-lg px-3 py-2.5">
                <p className="text-rust text-sm m-0">{errorMsg}</p>
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate/70 font-semibold mb-1.5">
                Full name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-moss text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate/70 font-semibold mb-1.5">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-moss text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg py-2.5 border border-black/15 font-semibold text-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-lg py-2.5 bg-moss text-white font-semibold text-sm disabled:opacity-60">
                {submitting ? 'Confirming…' : 'Confirm & hold room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
