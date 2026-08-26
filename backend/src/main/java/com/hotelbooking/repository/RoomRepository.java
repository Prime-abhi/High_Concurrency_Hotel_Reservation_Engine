package com.hotelbooking.repository;

import com.hotelbooking.model.Room;
import com.hotelbooking.model.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotel_IdAndRoomType(Long hotelId, RoomType roomType);

    List<Room> findByHotel_Id(Long hotelId);

    /**
     * Locks the room row itself (SELECT ... FOR UPDATE) for the duration of the
     * booking transaction. Any other transaction trying to book, cancel, or
     * re-price this same room will queue behind this lock at the database level -
     * this is what actually serializes concurrent booking attempts on "the last room".
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdForUpdate(@Param("id") Long id);
}
