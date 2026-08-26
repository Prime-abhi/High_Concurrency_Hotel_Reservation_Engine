package com.hotelbooking.controller;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.dto.BookingResponse;
import com.hotelbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse book(@Valid @RequestBody BookingRequest request) {
        return bookingService.book(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id) {
        bookingService.cancel(id);
    }
}
