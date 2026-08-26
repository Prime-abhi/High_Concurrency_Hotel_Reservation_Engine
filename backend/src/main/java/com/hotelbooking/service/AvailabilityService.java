package com.hotelbooking.service;

import com.hotelbooking.dto.RoomAvailabilityResponse;
import com.hotelbooking.model.Reservation;
import com.hotelbooking.model.ReservationStatus;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.ReservationRepository;
import com.hotelbooking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private static final List<ReservationStatus> BLOCKING_STATUSES =
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.MAINTENANCE_BLOCK);

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Read-only search path. No locks are taken here - this query needs to stay
     * fast (sub-100ms target) under high read concurrency, and a stale-by-a-few-
     * hundred-milliseconds "available" flag is fine for search results because
     * the actual booking transaction re-checks availability under lock anyway.
     */
    @Transactional(readOnly = true)
    public List<RoomAvailabilityResponse> search(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        validateDateRange(checkIn, checkOut);

        List<Room> rooms = roomRepository.findByHotel_Id(hotelId);
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        return rooms.stream()
                .filter(room -> Boolean.TRUE.equals(room.getActive()))
                .map(room -> {
                    List<Reservation> overlaps = reservationRepository.findOverlapping(
                            room.getId(), checkIn, checkOut, BLOCKING_STATUSES);
                    boolean available = overlaps.isEmpty();
                    BigDecimal total = room.getBasePrice().multiply(BigDecimal.valueOf(nights));
                    return new RoomAvailabilityResponse(
                            room.getId(),
                            room.getRoomNumber(),
                            room.getRoomType(),
                            room.getBasePrice(),
                            total,
                            room.getMaxOccupancy(),
                            room.getPhotoUrl(),
                            room.getDescription(),
                            room.getAmenities(),
                            available
                    );
                })
                .toList();
    }

    private void validateDateRange(LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("checkOut must be after checkIn");
        }
    }
}
