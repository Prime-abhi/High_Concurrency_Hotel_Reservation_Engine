import { useState } from 'react'
import { currency } from '../../utils/format'
import { api, extractErrorMessage } from '../../api/client'

const PAGE_SIZE = 8

const STATUS_STYLE = {
  CONFIRMED: 'bg-moss/15 text-moss',
  MAINTENANCE_BLOCK: 'bg-slate/15 text-slate',
  CANCELLED: 'bg-black/5 text-slate/40 line-through',
  COMPLETED: 'bg-brass/15 text-brass',
}

export default function ReservationsLedger({ reservations, rooms, onChanged }) {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [blockRoomId, setBlockRoomId] = useState(rooms[0]?.id ?? '')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')

  const [priceRoomId, setPriceRoomId] = useState(rooms[0]?.id ?? '')
  const [priceValue, setPriceValue] = useState('')

  async function handleCancel(reservationId) {
    setError(''); setMessage('')
    try {
      await api.cancelBooking(reservationId)
      onChanged()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleBlock(e) {
    e.preventDefault()
    setError(''); setMessage('')
    try {
      await api.blockRoom({
        roomId: Number(blockRoomId),
        startDate: blockStart,
        endDate: blockEnd,
        reason: blockReason || 'Maintenance',
      })
      setMessage('Room blocked for maintenance.')
      setBlockStart(''); setBlockEnd(''); setBlockReason('')
      onChanged()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handlePrice(e) {
    e.preventDefault()
    setError(''); setMessage('')
    if (!priceValue || Number(priceValue) <= 0) { setError('Enter a valid rate.'); return }
    try {
      await api.updatePrice(Number(priceRoomId), Number(priceValue))
      setMessage(`Rate updated to ${currency(priceValue)}/night.`)
      setPriceValue('')
      onChanged()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  // Filter + sort
  const filtered = reservations
    .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
    .slice()
    .sort((a, b) => b.checkIn?.localeCompare(a.checkIn))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeFilter(f) { setStatusFilter(f); setPage(1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-xl m-0">Reservation ledger</h3>
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'CONFIRMED', 'CANCELLED', 'MAINTENANCE_BLOCK'].map(s => (
            <button
              key={s}
              onClick={() => changeFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === s ? 'bg-ink text-stone' : 'border border-black/15 hover:bg-black/5'
              }`}
            >
              {s === 'ALL' ? 'All' : s === 'MAINTENANCE_BLOCK' ? 'Maintenance' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-rust text-sm mb-3">{error}</p>}
      {message && <p className="text-moss text-sm mb-3">{message}</p>}

      <div className="bg-white border border-black/[0.07] rounded-xl overflow-hidden mb-3">
        {filtered.length === 0 ? (
          <p className="p-5 text-sm text-slate">No reservations match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wide text-slate/70 bg-black/[0.02]">
                  <th className="px-5 py-2.5 font-bold">Room</th>
                  <th className="px-5 py-2.5 font-bold">Guest</th>
                  <th className="px-5 py-2.5 font-bold">Check-in</th>
                  <th className="px-5 py-2.5 font-bold">Check-out</th>
                  <th className="px-5 py-2.5 font-bold">Total</th>
                  <th className="px-5 py-2.5 font-bold">Status</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id} className="border-t border-black/[0.05]">
                    <td className="px-5 py-2.5 font-medium">{r.room?.roomNumber}</td>
                    <td className="px-5 py-2.5">{r.guestName}</td>
                    <td className="px-5 py-2.5 font-tabular">{r.checkIn}</td>
                    <td className="px-5 py-2.5 font-tabular">{r.checkOut}</td>
                    <td className="px-5 py-2.5 font-tabular">{currency(r.totalPrice ?? 0)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[r.status] ?? ''}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {r.status !== 'CANCELLED' && (
                        <button onClick={() => handleCancel(r.id)}
                          className="text-xs text-rust font-bold hover:underline">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  n === page ? 'bg-ink text-stone' : 'border border-black/15 hover:bg-black/5'
                }`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Block for maintenance */}
      <div className="bg-white border border-black/[0.07] rounded-xl p-5 mb-6">
        <p className="font-bold text-xs uppercase tracking-wide text-slate mb-4">Block a room for maintenance</p>
        <form onSubmit={handleBlock} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate mb-1">Room</label>
            <select value={blockRoomId} onChange={(e) => setBlockRoomId(e.target.value)}
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm">
              {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Start date</label>
            <input required type="date" value={blockStart} onChange={(e) => setBlockStart(e.target.value)}
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">End date</label>
            <input required type="date" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Reason</label>
            <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Plumbing repair"
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-ink text-stone rounded-lg py-2 font-bold text-sm">
            Block room
          </button>
        </form>
      </div>

      {/* Dynamic pricing */}
      <div className="bg-white border border-black/[0.07] rounded-xl p-5">
        <p className="font-bold text-xs uppercase tracking-wide text-slate mb-4">Dynamic pricing</p>
        <form onSubmit={handlePrice} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate mb-1">Room</label>
            <select value={priceRoomId} onChange={(e) => setPriceRoomId(e.target.value)}
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm">
              {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">New nightly rate (₹)</label>
            <input required type="number" min="1" value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-brass text-ink rounded-lg py-2 font-bold text-sm">
            Update rate
          </button>
        </form>
      </div>
    </div>
  )
}
