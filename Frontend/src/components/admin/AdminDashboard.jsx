import { useEffect, useState } from 'react'
import { api, extractErrorMessage } from '../../api/client'
import AppHeader from '../layout/AppHeader'
import Overview from './Overview'
import RoomsManagement from './RoomsManagement'
import ReservationsLedger from './ReservationsLedger'
import AddHotelModal from './AddHotelModal'

export default function AdminDashboard({ hotels: initialHotels, onSwitchRole, onLogoClick, onHotelAdded }) {
  const [hotels, setHotels] = useState(initialHotels)
  const [tab, setTab] = useState('overview')
  const [hotelId, setHotelId] = useState(initialHotels[0]?.id)
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showAddHotel, setShowAddHotel] = useState(false)

  // Keep hotels in sync if parent adds one
  useEffect(() => { setHotels(initialHotels) }, [initialHotels])

  useEffect(() => {
    if (hotelId) loadAll(hotelId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  async function loadAll(id) {
    setLoading(true)
    setError('')
    try {
      const [roomsData, reservationsData] = await Promise.all([
        api.roomsForHotel(id),
        api.reservationsForHotel(id),
      ])
      setRooms(roomsData)
      setReservations(reservationsData)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function flashToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  async function handleUpdatePrice(roomId, basePrice) {
    try {
      await api.updatePrice(roomId, basePrice)
      flashToast('Rate updated.')
      loadAll(hotelId)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleDeactivate(roomId) {
    if (!window.confirm('Remove this room from inventory? It will stop appearing for guests.')) return
    try {
      await api.deactivateRoom(roomId)
      flashToast('Room removed.')
      loadAll(hotelId)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  function handleRoomCreated(room) {
    flashToast(`Room ${room.roomNumber} added — it's now live for guests.`)
    loadAll(hotelId)
  }

  function handleHotelCreated(hotel) {
    setHotels(prev => [...prev, hotel])
    setHotelId(hotel.id)
    setShowAddHotel(false)
    flashToast(`${hotel.name} added.`)
    if (onHotelAdded) onHotelAdded(hotel)
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        mode="admin"
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'rooms', label: 'Rooms' },
          { key: 'reservations', label: 'Reservations' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        onSwitchRole={onSwitchRole}
        onLogoClick={onLogoClick}
        avatarLabel="HA"
      />

      <main className="max-w-6xl mx-auto px-7 py-8">
        {/* Header row: title + hotel selector + add hotel button */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl m-0">Hotel Admin</h2>
            <p className="text-sm text-slate mt-1 m-0">Manage hotels, rooms, reservations and pricing.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={hotelId}
              onChange={(e) => setHotelId(Number(e.target.value))}
              className="border border-black/15 rounded-lg px-3 py-2 bg-white text-sm"
            >
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <button
              onClick={() => setShowAddHotel(true)}
              className="bg-brass text-ink font-bold text-sm rounded-lg px-4 py-2 whitespace-nowrap"
            >
              + Add hotel
            </button>
          </div>
        </div>

        {error && <p className="text-rust text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : tab === 'overview' ? (
          <Overview rooms={rooms} reservations={reservations} />
        ) : tab === 'rooms' ? (
          <RoomsManagement
            hotelId={hotelId}
            rooms={rooms}
            onRoomsChanged={handleRoomCreated}
            onUpdatePrice={handleUpdatePrice}
            onDeactivate={handleDeactivate}
          />
        ) : (
          <ReservationsLedger
            reservations={reservations}
            rooms={rooms.filter(r => r.active)}
            onChanged={() => loadAll(hotelId)}
          />
        )}
      </main>

      {showAddHotel && (
        <AddHotelModal
          onClose={() => setShowAddHotel(false)}
          onCreated={handleHotelCreated}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-stone rounded-full text-sm font-semibold shadow-2xl z-[80]"
          style={{ padding: '12px 22px' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
