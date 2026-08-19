package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.exception.RoomNotAvailableException;
import com.hotelbooking.model.Reservation;
import com.hotelbooking.model.ReservationStatus;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.ReservationRepository;
import com.hotelbooking.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Isolated in its own Spring bean (rather than a private method on BookingService)
 * so that the {@code @Transactional} boundary is honored via the Spring proxy -
 * calling an @Transactional method on `this` from within the same class silently
 * skips the proxy and the transaction never actually starts.
 */
@Service
@RequiredArgsConstructor
public class BookingTransactionService {

    private static final List<ReservationStatus> BLOCKING_STATUSES =
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.MAINTENANCE_BLOCK);

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    /**
     * The actual booking transaction. Runs REQUIRES_NEW so it starts and commits/rolls
     * back cleanly regardless of what's happening in the caller's context, and holds
     * two pessimistic locks for its entire duration:
     *
     *   1. SELECT room FOR UPDATE           - serializes anyone else touching this room row
     *   2. SELECT overlapping reservations FOR UPDATE - serializes anyone else's overlap check
     *
     * A second transaction attempting to book the same room for an overlapping range
     * will block at step 1 until this transaction commits, then re-run its own overlap
     * check and correctly see the just-committed reservation and fail fast.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Reservation book(BookingRequest request) {
        if (!request.checkOut().isAfter(request.checkIn())) {
            throw new IllegalArgumentException("checkOut must be after checkIn");
        }

        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Room " + request.roomId() + " not found"));

        List<Reservation> overlapping = reservationRepository.findOverlappingForUpdate(
                room.getId(), request.checkIn(), request.checkOut(), BLOCKING_STATUSES);

        if (!overlapping.isEmpty()) {
            throw new RoomNotAvailableException(
                    "Room " + room.getRoomNumber() + " is no longer available for the selected dates.");
        }

        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal total = room.getBasePrice().multiply(BigDecimal.valueOf(nights));

        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setGuestName(request.guestName());
        reservation.setGuestEmail(request.guestEmail());
        reservation.setGuestPhone(request.guestPhone());
        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setTotalPrice(total);

        return reservationRepository.save(reservation);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Reservation blockForMaintenance(Long roomId, LocalDate start, LocalDate end, String reason) {
        Room room = roomRepository.findByIdForUpdate(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room " + roomId + " not found"));

        List<Reservation> overlapping = reservationRepository.findOverlappingForUpdate(
                room.getId(), start, end, BLOCKING_STATUSES);

        if (!overlapping.isEmpty()) {
            throw new RoomNotAvailableException(
                    "Room " + room.getRoomNumber() + " already has a booking or block in that range.");
        }

        Reservation block = new Reservation();
        block.setRoom(room);
        block.setGuestName("MAINTENANCE");
        block.setGuestEmail(reason == null ? "internal" : reason);
        block.setCheckIn(start);
        block.setCheckOut(end);
        block.setStatus(ReservationStatus.MAINTENANCE_BLOCK);
        block.setTotalPrice(BigDecimal.ZERO);

        return reservationRepository.save(block);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void cancel(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation " + reservationId + " not found"));
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
}
