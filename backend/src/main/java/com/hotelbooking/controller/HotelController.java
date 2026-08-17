package com.hotelbooking.controller;

import com.hotelbooking.model.Hotel;
import com.hotelbooking.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelRepository hotelRepository;

    @GetMapping
    public List<Hotel> listHotels() {
        return hotelRepository.findAll();
    }
}
