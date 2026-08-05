import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../../api/client'
import { nightsBetween } from '../../utils/format'
import AppHeader from '../layout/AppHeader'
import Hero from './Hero'
import GuestSearchBar from './GuestSearchBar'
import RoomCard from './RoomCard'
import RoomDetailModal from './RoomDetailModal'
import BookingModal from './BookingModal'
import MyBookings from './MyBookings'
import { useMyBookings } from '../../hooks/useMyBookings'

const ROOMS_PER_PAGE = 6

export default function GuestDashboard({ hotels, onSwitchRole, onLogoClick }) {
  const [tab, setTab] = useState('browse')
  const [hotelId, setHotelId] = useState(hotels[0]?.id)
  const [dates, setDates] = useState(null)
  const [rooms, setRooms] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [detailRoom, setDetailRoom] = useState(null)
  const [bookingRoom, setBookingRoom] = useState(null)
  const [roomPage, setRoomPage] = useState(1)

  const { bookings, addBooking, removeBooking } = useMyBookings()
  const activeHotel = hotels.find(h => h.id === hotelId)

  useEffect(() => {
    if (hotelId) handleSearch({ checkIn: defaultDate(1), checkOut: defaultDate(3) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  function defaultDate(days) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  async function handleSearch({ checkIn, checkOut }) {
    setLoading(true)
    setError('')
    setConfirmed(null)
    setRoomPage(1)
    try {
      const data = await api.searchAvailability(hotelId, checkIn, checkOut)
      setRooms(data)
      setDates({ checkIn, checkOut })
      setSearched(true)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function handleBooked(reservation, room) {
    setBookingRoom(null)
    setDetailRoom(null)
    setConfirmed(reservation)
    addBooking({
      reservationId: reservation.reservationId,
      roomNumber: reservation.roomNumber,
      roomType: room.roomType,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      totalPrice: reservation.totalPrice,
      photoUrl: room.photoUrl,
      status: reservation.status,
    })
    handleSearch(dates)
  }

  async function handleCancelBooking(reservationId) {
    try {
      await api.cancelBooking(reservationId)
      removeBooking(reservationId)
      if (dates) handleSearch(dates)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const nights = dates ? nightsBetween(dates.checkIn, dates.checkOut) : 0
  const totalRoomPages = Math.ceil(rooms.length / ROOMS_PER_PAGE)
  const paginatedRooms = rooms.slice((roomPage - 1) * ROOMS_PER_PAGE, roomPage * ROOMS_PER_PAGE)

  return (
    <div className="min-h-screen">
      <AppHeader
        mode="guest"
        tabs={[
          { key: 'browse', label: 'Browse Rooms' },
          { key: 'bookings', label: `My Bookings${bookings.length ? ` (${bookings.length})` : ''}` },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        onSwitchRole={onSwitchRole}
        onLogoClick={onLogoClick}
        avatarLabel="G"
      />

      <main className="max-w-6xl mx-auto px-7 py-8">
        {tab === 'browse' ? (
          <>
            <Hero hotel={activeHotel} />

            <GuestSearchBar
              hotels={hotels}
              hotelId={hotelId}
              onHotelChange={setHotelId}
              onSearch={handleSearch}
              loading={loading}
            />

            {confirmed && (
              <div className="bg-moss/10 border border-moss/30 rounded-xl p-5 mb-5">
                <p className="font-display text-lg text-moss m-0">🎉 Reservation confirmed</p>
                <p className="text-sm text-slate mt-1 m-0">
                  Room {confirmed.roomNumber} is held from {confirmed.checkIn} to {confirmed.checkOut}.
                  Confirmation #{confirmed.reservationId}. Check <button
                    className="text-moss underline font-semibold"
                    onClick={() => setTab('bookings')}
                  >My Bookings</button> to view it.
                </p>
              </div>
            )}
            {error && <p className="text-rust text-sm mb-4">{error}</p>}

            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-display text-xl m-0">Available rooms</h3>
              {searched && (
                <span className="text-sm text-slate">
                  {rooms.filter(r => r.available).length} of {rooms.length} available
                </span>
              )}
            </div>

            {!searched ? (
              <p className="text-center py-16 text-slate/70 font-display text-lg">
                Select your dates to see what's open.
              </p>
            ) : rooms.length === 0 ? (
              <p className="text-center py-16 text-slate/70 font-display text-lg">
                No rooms found for this property.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                  {paginatedRooms.map(room => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      nights={nights}
                      onView={setDetailRoom}
                      onReserve={setBookingRoom}
                    />
                  ))}
                </div>

                {/* Room grid pagination */}
                {totalRoomPages > 1 && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate">
                      {(roomPage - 1) * ROOMS_PER_PAGE + 1}–{Math.min(roomPage * ROOMS_PER_PAGE, rooms.length)} of {rooms.length} rooms
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setRoomPage(p => Math.max(1, p - 1))}
                        disabled={roomPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalRoomPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          onClick={() => setRoomPage(n)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            n === roomPage ? 'bg-ink text-stone' : 'border border-black/15 hover:bg-black/5'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => setRoomPage(p => Math.min(totalRoomPages, p + 1))}
                        disabled={roomPage === totalRoomPages}
                        className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <h3 className="font-display text-xl mb-4">My bookings</h3>
            <MyBookings bookings={bookings} onCancel={handleCancelBooking} />
          </>
        )}
      </main>

      {detailRoom && (
        <RoomDetailModal
          room={detailRoom}
          nights={nights}
          onClose={() => setDetailRoom(null)}
          onReserve={(room) => { setDetailRoom(null); setBookingRoom(room) }}
        />
      )}

      {bookingRoom && dates && (
        <BookingModal
          room={bookingRoom}
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
          onClose={() => setBookingRoom(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  )
}
