package com.hotelbooking.dto;

import com.hotelbooking.model.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingResponse(
        Long reservationId,
        Long roomId,
        String roomNumber,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal totalPrice,
        ReservationStatus status
) {
}
