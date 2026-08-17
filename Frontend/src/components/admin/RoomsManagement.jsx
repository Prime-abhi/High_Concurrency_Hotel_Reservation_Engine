import { useState } from 'react'
import { currency, ROOM_TYPE_LABEL } from '../../utils/format'
import AddRoomModal from './AddRoomModal'

export default function RoomsManagement({ hotelId, rooms, onRoomsChanged, onUpdatePrice, onDeactivate }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [priceInput, setPriceInput] = useState('')

  function startEdit(room) {
    setEditingId(room.id)
    setPriceInput(room.basePrice)
  }

  async function saveEdit(room) {
    if (!priceInput || Number(priceInput) <= 0) return
    await onUpdatePrice(room.id, Number(priceInput))
    setEditingId(null)
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display text-xl m-0">Manage rooms</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brass text-ink font-bold text-sm rounded-lg px-5 py-2.5"
        >
          + Add new room
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-sm text-slate">No rooms yet — add the first one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map(room => (
            <div key={room.id} className="bg-white border border-black/[0.07] rounded-xl overflow-hidden">
              <div className="h-[130px]">
                <img src={room.photoUrl} alt={room.roomType} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display text-[16.5px] m-0">{ROOM_TYPE_LABEL[room.roomType] || room.roomType}</p>
                    <p className="text-xs text-slate mt-0.5 mb-2.5">Room {room.roomNumber} · sleeps {room.maxOccupancy}</p>
                  </div>
                  <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
                    room.active ? 'bg-moss/15 text-moss' : 'bg-rust/10 text-rust'
                  }`}>
                    {room.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  {editingId === room.id ? (
                    <input
                      autoFocus
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onBlur={() => saveEdit(room)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(room)}
                      className="border border-black/15 rounded-md px-2 py-1 text-sm w-24"
                    />
                  ) : (
                    <span className="font-bold text-[15px]">{currency(room.basePrice)}/night</span>
                  )}
                  <div className="flex gap-1.5">
                    <button onClick={() => startEdit(room)}
                      className="border border-black/10 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate">
                      Edit price
                    </button>
                    {room.active && (
                      <button onClick={() => onDeactivate(room.id)}
                        className="border border-rust/30 text-rust rounded-md px-2.5 py-1.5 text-xs font-semibold">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddRoomModal
          hotelId={hotelId}
          onClose={() => setShowAddModal(false)}
          onCreated={(room) => { setShowAddModal(false); onRoomsChanged(room) }}
        />
      )}
    </div>
  )
}
