package com.hotelbooking.dto;

import com.hotelbooking.model.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateRoomRequest(
        @NotNull Long hotelId,
        @NotBlank String roomNumber,
        @NotNull RoomType roomType,
        @NotNull @Positive BigDecimal basePrice,
        @NotNull @Positive Integer maxOccupancy,
        String photoUrl,
        String description,
        String amenities
) {
}
