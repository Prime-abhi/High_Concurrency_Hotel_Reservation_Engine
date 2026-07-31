import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const client = axios.create({ baseURL: BASE_URL })

export const api = {
  listHotels: () => client.get('/hotels').then(r => r.data),

  searchAvailability: (hotelId, checkIn, checkOut) =>
    client.get('/search/availability', { params: { hotelId, checkIn, checkOut } }).then(r => r.data),

  book: (payload) => client.post('/bookings', payload).then(r => r.data),

  cancelBooking: (id) => client.delete(`/bookings/${id}`),

  reservationsForHotel: (hotelId) => client.get(`/admin/hotels/${hotelId}/reservations`).then(r => r.data),

  roomsForHotel: (hotelId) => client.get(`/admin/hotels/${hotelId}/rooms`).then(r => r.data),

  createHotel: (payload) => client.post('/admin/hotels', payload).then(r => r.data),

  createRoom: (payload) => client.post('/admin/rooms', payload).then(r => r.data),

  deactivateRoom: (roomId) => client.delete(`/admin/rooms/${roomId}`),

  blockRoom: (payload) => client.post('/admin/blocks', payload).then(r => r.data),

  removeBlock: (reservationId) => client.delete(`/admin/blocks/${reservationId}`),

  updatePrice: (roomId, basePrice) =>
    client.patch(`/admin/rooms/${roomId}/price`, { basePrice }).then(r => r.data),
}

export function extractErrorMessage(err) {
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}
