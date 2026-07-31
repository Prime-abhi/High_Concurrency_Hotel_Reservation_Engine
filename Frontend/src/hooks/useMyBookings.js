import { useEffect, useState } from 'react'

const STORAGE_KEY = 'meridian.myBookings'

export function useMyBookings() {
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [bookings])

  function addBooking(booking) {
    setBookings(prev => [booking, ...prev])
  }

  function removeBooking(reservationId) {
    setBookings(prev => prev.filter(b => b.reservationId !== reservationId))
  }

  return { bookings, addBooking, removeBooking }
}
