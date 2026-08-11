import { useState } from 'react'
import { currency, ROOM_TYPE_LABEL } from '../../utils/format'

const PAGE_SIZE = 5

export default function MyBookings({ bookings, onCancel }) {
  const [page, setPage] = useState(1)

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-lg text-slate/60">No bookings yet</p>
        <p className="text-sm text-slate mt-1">Browse rooms and reserve your stay to see it here.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE)
  const paginated = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="space-y-3 mb-5">
        {paginated.map(b => (
          <div key={b.reservationId}
            className="flex items-center gap-4 bg-white border border-black/[0.07] rounded-xl"
            style={{ padding: '14px 18px' }}>
            <img
              src={b.photoUrl || `https://picsum.photos/seed/room-${b.roomNumber}/200/150`}
              alt=""
              className="w-[68px] h-[52px] object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14.5px] m-0 truncate">
                {ROOM_TYPE_LABEL[b.roomType] || b.roomType} · Room {b.roomNumber}
              </p>
              <p className="text-[12.5px] text-slate mt-0.5 m-0">
                {b.checkIn} → {b.checkOut} · #{b.reservationId}
              </p>
            </div>
            <p className="font-bold text-sm m-0 flex-shrink-0">{currency(b.totalPrice)}</p>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-moss/15 text-moss flex-shrink-0">
              {b.status || 'CONFIRMED'}
            </span>
            <button
              onClick={() => onCancel(b.reservationId)}
              className="text-rust text-xs font-semibold flex-shrink-0 hover:underline"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, bookings.length)} of {bookings.length}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  n === page ? 'bg-ink text-stone' : 'border border-black/15 hover:bg-black/5'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
