package com.hotelbooking.dto;

import com.hotelbooking.model.RoomType;

import java.math.BigDecimal;

public record RoomResponse(
        Long id,
        String roomNumber,
        RoomType roomType,
        BigDecimal basePrice,
        Integer maxOccupancy,
        String photoUrl,
        String description,
        String amenities,
        boolean active
) {
}
