package com.hotelbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record BookingRequest(
        @NotNull Long roomId,
        @NotBlank String guestName,
        @Email @NotBlank String guestEmail,
        @NotBlank @Pattern(regexp = "^[+\\d][\\d\\s\\-]{6,14}$", message = "must be a valid phone number") String guestPhone,
        @NotNull @FutureOrPresent LocalDate checkIn,
        @NotNull @FutureOrPresent LocalDate checkOut
) {
}
