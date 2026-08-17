package com.hotelbooking.dto;

import com.hotelbooking.model.RoomType;

import java.math.BigDecimal;

public record RoomAvailabilityResponse(
        Long roomId,
        String roomNumber,
        RoomType roomType,
        BigDecimal basePrice,
        BigDecimal totalPriceForStay,
        Integer maxOccupancy,
        String photoUrl,
        String description,
        String amenities,
        boolean available
) {
}
