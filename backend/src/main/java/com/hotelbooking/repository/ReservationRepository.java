package com.hotelbooking.repository;

import com.hotelbooking.model.Reservation;
import com.hotelbooking.model.ReservationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Classic interval-overlap check: two ranges [a,b) and [c,d) overlap iff a < d AND c < b.
     * Only CONFIRMED / MAINTENANCE_BLOCK rows count as "occupying" the room.
     *
     * This is the query the whole availability guarantee rests on - it must run
     * inside the same transaction as the pessimistic lock acquired in BookingService,
     * otherwise a second transaction could pass this check before the first commits.
     */
    @Query("""
           SELECT r FROM Reservation r
           WHERE r.room.id = :roomId
             AND r.status IN :blockingStatuses
             AND r.checkIn < :checkOut
             AND r.checkOut > :checkIn
           """)
    List<Reservation> findOverlapping(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("blockingStatuses") List<ReservationStatus> blockingStatuses
    );

    /**
     * Same overlap query, but with a row-level pessimistic write lock ("SELECT ... FOR UPDATE")
     * on any existing matching reservations. Combined with locking the Room row itself
     * (see RoomRepository#findByIdForUpdate), this closes the race window: a second
     * transaction attempting to book the same room+date range blocks until the first
     * transaction commits or rolls back, instead of both reading "available" simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
           SELECT r FROM Reservation r
           WHERE r.room.id = :roomId
             AND r.status IN :blockingStatuses
             AND r.checkIn < :checkOut
             AND r.checkOut > :checkIn
           """)
    List<Reservation> findOverlappingForUpdate(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("blockingStatuses") List<ReservationStatus> blockingStatuses
    );

    List<Reservation> findByRoom_Hotel_IdAndCheckInLessThanEqualAndCheckOutGreaterThanEqual(
            Long hotelId, LocalDate windowEnd, LocalDate windowStart
    );

    List<Reservation> findByRoom_Id(Long roomId);
}
