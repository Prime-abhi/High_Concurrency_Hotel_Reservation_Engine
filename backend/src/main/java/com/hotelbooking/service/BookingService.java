package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.dto.BookingResponse;
import com.hotelbooking.dto.MaintenanceBlockRequest;
import com.hotelbooking.model.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Public entry point for anything that mutates room inventory. Every write path
 * is serialized in two layers:
 *
 *   1. Application-level distributed lock, keyed by "roomId" (see DistributedLockService).
 *      Cheap to acquire/release, and stops redundant DB transactions from even starting
 *      when many requests hit the same room at once - this is what keeps the database
 *      from being hammered with blocked transactions during a flash-sale-style rush.
 *   2. Database pessimistic row lock inside the transaction itself (see
 *      BookingTransactionService), which is the actual source of truth and correctness
 *      guarantee - it holds even if the distributed lock were ever unavailable or
 *      misconfigured.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final DistributedLockService lockService;
    private final BookingTransactionService transactionService;

    public BookingResponse book(BookingRequest request) {
        String lockKey = "room:" + request.roomId();

        Reservation reservation = lockService.runWithLock(lockKey, () -> transactionService.book(request));

        log.info("Reservation {} confirmed for room {} ({} -> {})",
                reservation.getId(), reservation.getRoom().getId(), request.checkIn(), request.checkOut());

        return toResponse(reservation);
    }

    public BookingResponse blockForMaintenance(MaintenanceBlockRequest request) {
        String lockKey = "room:" + request.roomId();

        Reservation block = lockService.runWithLock(lockKey, () ->
                transactionService.blockForMaintenance(request.roomId(), request.startDate(), request.endDate(), request.reason()));

        return toResponse(block);
    }

    public void cancel(Long reservationId) {
        transactionService.cancel(reservationId);
    }

    private BookingResponse toResponse(Reservation reservation) {
        return new BookingResponse(
                reservation.getId(),
                reservation.getRoom().getId(),
                reservation.getRoom().getRoomNumber(),
                reservation.getCheckIn(),
                reservation.getCheckOut(),
                reservation.getTotalPrice(),
                reservation.getStatus()
        );
    }
}
