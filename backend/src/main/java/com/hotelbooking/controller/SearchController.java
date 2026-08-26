package com.hotelbooking.controller;

import com.hotelbooking.dto.RoomAvailabilityResponse;
import com.hotelbooking.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {

    private final AvailabilityService availabilityService;

    @GetMapping("/availability")
    public List<RoomAvailabilityResponse> search(
            @RequestParam Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return availabilityService.search(hotelId, checkIn, checkOut);
    }
}
