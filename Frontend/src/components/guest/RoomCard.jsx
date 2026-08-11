import { currency, ROOM_TYPE_LABEL, amenityList } from '../../utils/format'

export default function RoomCard({ room, nights, onView, onReserve }) {
  const amenities = amenityList(room.amenities)
  const photo = room.photoUrl || `https://picsum.photos/seed/room-${room.roomId}/600/400`

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-black/[0.07] shadow-[0_4px_14px_rgba(28,35,33,0.05)] hover:shadow-[0_10px_24px_rgba(28,35,33,0.1)] hover:-translate-y-0.5 transition">
      <div className="relative h-40">
        <img src={photo} alt={ROOM_TYPE_LABEL[room.roomType] || room.roomType} className="w-full h-full object-cover" />
        <span className={`absolute top-2.5 right-2.5 text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white ${
          room.available ? 'bg-moss/90' : 'bg-rust/90'
        }`}>
          {room.available ? 'Available' : 'Booked'}
        </span>
      </div>
      <div className="p-4 pb-[18px]">
        <p className="font-display text-lg m-0">{ROOM_TYPE_LABEL[room.roomType] || room.roomType}</p>
        <p className="text-[12.5px] text-slate mt-0.5 mb-2.5">Room {room.roomNumber} · sleeps {room.maxOccupancy}</p>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10.5px] bg-slate/[0.07] text-slate px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        )}

        <p className="font-display text-[22px] m-0">
          {currency(room.totalPriceForStay)}
          <span className="font-sans text-[11.5px] font-normal text-slate"> / {nights} nights</span>
        </p>
        <p className="text-[11.5px] text-slate mt-0.5 mb-3">{currency(room.basePrice)} per night</p>

        <div className="flex gap-2">
          <button onClick={() => onView(room)}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold bg-ink/[0.06] text-ink">
            View room
          </button>
          <button
            disabled={!room.available}
            onClick={() => onReserve(room)}
            className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold bg-ink text-stone disabled:bg-black/[0.06] disabled:text-slate/40 disabled:cursor-not-allowed"
          >
            {room.available ? 'Reserve' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
