package com.hotelbooking.exception;

/**
 * Thrown whenever a booking attempt loses the race for a room - either because
 * an overlapping reservation already exists, or because a concurrent transaction
 * committed first and invalidated this transaction's optimistic lock.
 */
public class RoomNotAvailableException extends RuntimeException {
    public RoomNotAvailableException(String message) {
        super(message);
    }
}
