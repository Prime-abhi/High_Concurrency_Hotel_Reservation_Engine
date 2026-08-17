import { currency, ROOM_TYPE_LABEL, amenityList } from '../../utils/format'

export default function RoomDetailModal({ room, nights, onClose, onReserve }) {
  if (!room) return null
  const amenities = amenityList(room.amenities)
  const photo = room.photoUrl || `https://picsum.photos/seed/room-${room.roomId}/700/500`

  return (
    <div className="fixed inset-0 bg-ink/55 flex items-center justify-center p-5 z-50 overflow-y-auto">
      <div className="bg-stone rounded-2xl max-w-xl w-full my-auto">
        <img src={photo} alt={room.roomType} className="w-full h-64 object-cover rounded-t-2xl" />
        <div className="p-7">
          <p className="font-display text-2xl m-0">{ROOM_TYPE_LABEL[room.roomType] || room.roomType} · Room {room.roomNumber}</p>
          <p className="text-slate text-sm mt-1">
            Sleeps {room.maxOccupancy} · {room.available ? 'Available for your dates' : 'Not available for your dates'}
          </p>

          {amenities.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-4">
              {amenities.map(a => (
                <div key={a} className="text-[12.5px] bg-slate/[0.06] text-slate rounded-lg py-2 px-2.5 text-center">{a}</div>
              ))}
            </div>
          )}

          {room.description && <p className="text-[13.5px] text-slate leading-relaxed">{room.description}</p>}

          <div className="flex items-center justify-between mt-5">
            <div>
              <p className="font-display text-2xl m-0">{currency(room.totalPriceForStay)}</p>
              <p className="text-[11.5px] text-slate m-0">{currency(room.basePrice)} / night · {nights} nights</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-semibold border border-black/[0.15]">
                Close
              </button>
              <button
                disabled={!room.available}
                onClick={() => onReserve(room)}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold bg-ink text-stone disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {room.available ? 'Reserve this room' : 'Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
