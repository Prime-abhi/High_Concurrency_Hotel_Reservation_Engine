package com.hotel.hre.entity;

public enum ReservationStatus {
    CONFIRMED,
    CANCELLED,
    MAINTENANCE_BLOCK,   // used by admins to block a room for maintenance
    COMPLETED
}
