export function currency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
}

export const ROOM_TYPE_LABEL = {
  STANDARD: 'Standard Room',
  DELUXE: 'Deluxe Room',
  SUITE: 'Suite',
  FAMILY: 'Family Room',
}

export function amenityList(amenities) {
  if (!amenities) return []
  return amenities.split(',').map(a => a.trim()).filter(Boolean)
}
