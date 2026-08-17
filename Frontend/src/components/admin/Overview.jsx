import { currency } from '../../utils/format'

function isSameOrBetween(dateStr, start, end) {
  const d = new Date(dateStr).getTime()
  return d >= new Date(start).getTime() && d < new Date(end).getTime()
}

export default function Overview({ rooms, reservations }) {
  const today = new Date().toISOString().slice(0, 10)
  const confirmed = reservations.filter(r => r.status === 'CONFIRMED')

  const occupiedTonight = confirmed.filter(r => isSameOrBetween(today, r.checkIn, r.checkOut)).length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const revenueThisMonth = confirmed
    .filter(r => new Date(r.checkIn) >= monthStart)
    .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0)

  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const upcomingCheckIns = confirmed.filter(r => {
    const ci = new Date(r.checkIn)
    return ci >= now && ci <= weekFromNow
  }).length

  const activeRooms = rooms.filter(r => r.active)
  const occupancyRate = activeRooms.length ? Math.round((occupiedTonight / activeRooms.length) * 100) : 0

  const recent = [...reservations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <KpiCard label="Total rooms" value={activeRooms.length} delta={`${rooms.length - activeRooms.length} inactive`} />
        <KpiCard label="Occupied tonight" value={occupiedTonight} delta={`${occupancyRate}% occupancy`} />
        <KpiCard label="Revenue this month" value={currency(revenueThisMonth)} delta="Confirmed bookings" />
        <KpiCard label="Upcoming check-ins" value={upcomingCheckIns} delta="Next 7 days" />
      </div>

      <div className="bg-white border border-black/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-black/[0.07] text-xs font-bold uppercase tracking-wide text-slate">
          Recent activity
        </div>
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-slate">Nothing yet — reservations will show up here.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map(r => (
                <tr key={r.id} className="border-t border-black/[0.05] first:border-t-0">
                  <td className="px-5 py-2.5">
                    {r.guestName === 'MAINTENANCE'
                      ? `Room ${r.room?.roomNumber} blocked for maintenance`
                      : r.status === 'CANCELLED'
                        ? `${r.guestName} cancelled Room ${r.room?.roomNumber}`
                        : `${r.guestName} booked Room ${r.room?.roomNumber}`}
                  </td>
                  <td className="px-5 py-2.5 text-right text-slate">{r.checkIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, delta }) {
  return (
    <div className="bg-white border border-black/[0.07] rounded-xl" style={{ padding: '18px 20px' }}>
      <p className="text-[11.5px] uppercase tracking-wide text-slate font-semibold m-0">{label}</p>
      <p className="font-display text-[28px] mt-2 m-0">{value}</p>
      <p className="text-xs text-moss font-semibold mt-1 m-0">{delta}</p>
    </div>
  )
}
