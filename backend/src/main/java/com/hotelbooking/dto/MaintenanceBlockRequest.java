package com.hotelbooking.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MaintenanceBlockRequest(
        @NotNull Long roomId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        String reason
) {
}
