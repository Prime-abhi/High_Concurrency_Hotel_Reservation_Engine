package com.hotelbooking.controller;

import com.hotelbooking.dto.BookingResponse;
import com.hotelbooking.dto.CreateRoomRequest;
import com.hotelbooking.dto.MaintenanceBlockRequest;
import com.hotelbooking.dto.RoomResponse;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.model.Reservation;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.ReservationRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.service.BookingService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final BookingService bookingService;
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    /** Create a new hotel property. */
    @PostMapping("/hotels")
    @ResponseStatus(HttpStatus.CREATED)
    public Hotel createHotel(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String city = body.get("city");
        String address = body.get("address");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Hotel name is required");
        }
        Hotel hotel = new Hotel();
        hotel.setName(name.trim());
        hotel.setCity(city != null ? city.trim() : "");
        hotel.setAddress(address != null ? address.trim() : "");
        return hotelRepository.save(hotel);
    }

    /** Calendar dashboard feed: every reservation (and maintenance block) for a hotel's rooms. */
    @GetMapping("/hotels/{hotelId}/reservations")
    public List<Reservation> reservationsForHotel(@PathVariable Long hotelId) {
        return roomRepository.findByHotel_Id(hotelId).stream()
                .flatMap(room -> reservationRepository.findByRoom_Id(room.getId()).stream())
                .toList();
    }

    /** Room management feed - includes deactivated rooms so staff can see full inventory status. */
    @GetMapping("/hotels/{hotelId}/rooms")
    public List<RoomResponse> roomsForHotel(@PathVariable Long hotelId) {
        return roomRepository.findByHotel_Id(hotelId).stream()
                .map(this::toRoomResponse)
                .toList();
    }

    /** The "add a new room" flow - a hotel admin can add a room in one call, photo included. */
    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request) {
        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() -> new EntityNotFoundException("Hotel " + request.hotelId() + " not found"));

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(request.roomNumber());
        room.setRoomType(request.roomType());
        room.setBasePrice(request.basePrice());
        room.setMaxOccupancy(request.maxOccupancy());
        room.setPhotoUrl(request.photoUrl());
        room.setDescription(request.description());
        room.setAmenities(request.amenities());
        room.setActive(true);

        return toRoomResponse(roomRepository.save(room));
    }

    /** Soft-delete: deactivates the room instead of hard-deleting, so existing reservation
     *  history for it stays intact. Deactivated rooms stop appearing in guest search. */
    @DeleteMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateRoom(@PathVariable Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room " + roomId + " not found"));
        room.setActive(false);
        roomRepository.save(room);
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse blockRoom(@Valid @RequestBody MaintenanceBlockRequest request) {
        return bookingService.blockForMaintenance(request);
    }

    @DeleteMapping("/blocks/{reservationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBlock(@PathVariable Long reservationId) {
        bookingService.cancel(reservationId);
    }

    /** Simple dynamic-pricing endpoint: update a room's base nightly rate. */
    @PatchMapping("/rooms/{roomId}/price")
    public RoomResponse updatePrice(@PathVariable Long roomId, @RequestBody Map<String, BigDecimal> body) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room " + roomId + " not found"));
        BigDecimal newPrice = body.get("basePrice");
        if (newPrice == null || newPrice.signum() <= 0) {
            throw new IllegalArgumentException("basePrice must be a positive number");
        }
        room.setBasePrice(newPrice);
        return toRoomResponse(roomRepository.save(room));
    }

    private RoomResponse toRoomResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getRoomType(),
                room.getBasePrice(),
                room.getMaxOccupancy(),
                room.getPhotoUrl(),
                room.getDescription(),
                room.getAmenities(),
                Boolean.TRUE.equals(room.getActive())
        );
    }
}

