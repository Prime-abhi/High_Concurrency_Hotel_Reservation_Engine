import { useRef, useState } from 'react'
import { api, extractErrorMessage } from '../../api/client'

const AMENITY_OPTIONS = ['Free WiFi', 'Air conditioning', 'Smart TV', 'Minibar', 'Balcony', 'Bathtub', 'Extra beds', 'Work desk']

export default function AddRoomModal({ hotelId, onClose, onCreated }) {
  const [roomNumber, setRoomNumber] = useState('')
  const [roomType, setRoomType] = useState('STANDARD')
  const [maxOccupancy, setMaxOccupancy] = useState(2)
  const [basePrice, setBasePrice] = useState('')
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState(['Free WiFi', 'Air conditioning'])
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  function toggleAmenity(a) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result)
      setPhotoUrl(ev.target.result) // sent to the API as-is; see README note on image storage
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!roomNumber.trim()) { setError('Enter a room number.'); return }
    if (!basePrice || Number(basePrice) <= 0) { setError('Enter a valid nightly rate.'); return }
    setError('')
    setSubmitting(true)
    try {
      const room = await api.createRoom({
        hotelId,
        roomNumber: roomNumber.trim(),
        roomType,
        basePrice: Number(basePrice),
        maxOccupancy: Number(maxOccupancy),
        photoUrl: photoUrl || `https://picsum.photos/seed/room-${roomNumber.trim()}-${Date.now()}/600/400`,
        description: description.trim() || 'A comfortable room at our property.',
        amenities: amenities.join(','),
      })
      onCreated(room)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/55 flex items-center justify-center p-5 z-50 overflow-y-auto">
      <div className="bg-stone rounded-2xl max-w-lg w-full my-auto">
        <form onSubmit={handleSubmit} className="max-h-[88vh] overflow-y-auto p-7">
          <p className="font-display text-2xl m-0">Add a new room</p>
          <p className="text-sm text-slate mt-1 mb-4">Takes about 30 seconds — it appears in the room grid immediately.</p>

          <label className={fieldLabel}>Room photo</label>
          <div
            onClick={() => fileInput.current?.click()}
            className="border-[1.5px] border-dashed border-black/20 rounded-xl p-4 text-center cursor-pointer bg-white/50"
          >
            {photoPreview
              ? <img src={photoPreview} alt="Preview" className="max-h-28 mx-auto mb-2 rounded-lg object-cover" />
              : null}
            <p className="text-[12.5px] text-slate m-0">
              {photoPreview ? 'Click to choose a different photo' : 'Click to upload a photo, or leave blank for a sample photo'}
            </p>
          </div>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          <label className={fieldLabel}>Or paste an image URL instead</label>
          <input
            value={photoUrl.startsWith('data:') ? '' : photoUrl}
            onChange={(e) => { setPhotoUrl(e.target.value); setPhotoPreview(e.target.value) }}
            placeholder="https://example.com/room-photo.jpg"
            className={fieldInput}
          />

          <label className={fieldLabel}>Room number</label>
          <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. 501" className={fieldInput} />

          <label className={fieldLabel}>Room type</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={fieldInput}>
            <option value="STANDARD">Standard Room</option>
            <option value="DELUXE">Deluxe Room</option>
            <option value="SUITE">Suite</option>
            <option value="FAMILY">Family Room</option>
          </select>

          <label className={fieldLabel}>Max occupancy</label>
          <input type="number" min="1" value={maxOccupancy} onChange={(e) => setMaxOccupancy(e.target.value)} className={fieldInput} />

          <label className={fieldLabel}>Nightly rate (₹)</label>
          <input type="number" min="1" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="3500" className={fieldInput} />

          <label className={fieldLabel}>Amenities</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {AMENITY_OPTIONS.map(a => (
              <label key={a} className="flex items-center gap-2 text-sm font-normal">
                <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>

          <label className={fieldLabel}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description guests will see..." className={`${fieldInput} min-h-[64px] resize-y`} />

          {error && <p className="text-rust text-sm mt-3">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 border border-black/15 font-bold text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-lg py-2.5 bg-moss text-white font-bold text-sm disabled:opacity-60">
              {submitting ? 'Adding…' : 'Add room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldLabel = "block text-[11px] uppercase tracking-wide text-slate font-semibold mt-4 mb-1.5"
const fieldInput = "w-full border border-black/15 rounded-lg px-3 py-2.5 text-sm bg-white"
