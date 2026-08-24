package com.hotelbooking.config;

import com.hotelbooking.model.Hotel;
import com.hotelbooking.model.Room;
import com.hotelbooking.model.RoomType;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    // Real hotel room photos from Unsplash (free to use, no auth required)
    private static final String STD_1  = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";
    private static final String STD_2  = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80";
    private static final String DLX_1  = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";
    private static final String DLX_2  = "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80";
    private static final String SUITE  = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80";
    private static final String FAMILY = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80";
    private static final String STD_3  = "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80";
    private static final String DLX_3  = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80";

    @Override
    public void run(String... args) {
        if (hotelRepository.count() > 0) {
            return;
        }

        Hotel hotel = new Hotel();
        hotel.setName("Grand Meridian Hotel");
        hotel.setCity("Indore");
        hotel.setAddress("12 Rajwada Circle");
        hotel = hotelRepository.save(hotel);

        seedRoom(hotel, "101", RoomType.STANDARD, new BigDecimal("2500"), 2,
                STD_1,
                "A calm, well-lit room with a king bed, soft linens and everything you need for a comfortable business stay.",
                "Free WiFi,Air conditioning,Work desk,Safe,Flat-screen TV");
        seedRoom(hotel, "102", RoomType.STANDARD, new BigDecimal("2500"), 2,
                STD_2,
                "A bright, neatly furnished room with queen bed, blackout curtains and a private ensuite bathroom.",
                "Free WiFi,Air conditioning,Work desk,Ensuite bathroom,Hair dryer");
        seedRoom(hotel, "201", RoomType.DELUXE, new BigDecimal("4200"), 3,
                DLX_1,
                "Spacious deluxe room with city views, a king bed, plush sofa seating area, and premium bath amenities.",
                "Free WiFi,Air conditioning,Smart TV,Minibar,City view,Premium toiletries");
        seedRoom(hotel, "202", RoomType.DELUXE, new BigDecimal("4200"), 3,
                DLX_2,
                "Elegant interiors with warm lighting, a king bed, 55\" smart TV, and a dedicated work and lounge area.",
                "Free WiFi,Air conditioning,Smart TV,Minibar,Work area,Iron & board");
        seedRoom(hotel, "301", RoomType.SUITE, new BigDecimal("7800"), 4,
                SUITE,
                "Our signature suite — a separate living room, walk-in wardrobe, deep soaking tub and panoramic city views.",
                "Free WiFi,Air conditioning,Smart TV,Minibar,Balcony,Bathtub,Living room,Butler service");
        seedRoom(hotel, "401", RoomType.FAMILY, new BigDecimal("6000"), 5,
                FAMILY,
                "Two queen beds, a pull-out sofa, and plenty of space for the whole family. Adjoining bathroom with double vanity.",
                "Free WiFi,Air conditioning,Smart TV,Extra beds,Double vanity,Sofa bed");

        Hotel hotel2 = new Hotel();
        hotel2.setName("Riverside Business Inn");
        hotel2.setCity("Indore");
        hotel2.setAddress("45 Bypass Road");
        hotel2 = hotelRepository.save(hotel2);

        seedRoom(hotel2, "1A", RoomType.STANDARD, new BigDecimal("2100"), 2,
                STD_3,
                "A tidy, efficient room with a queen bed, fast WiFi and ergonomic desk — ideal for business travellers.",
                "Free WiFi,Air conditioning,Work desk,Safe");
        seedRoom(hotel2, "1B", RoomType.DELUXE, new BigDecimal("3500"), 2,
                DLX_3,
                "Upgraded deluxe room with a king bed, rainfall shower, 50\" smart TV and complimentary minibar.",
                "Free WiFi,Air conditioning,Smart TV,Minibar,Rainfall shower");
    }

    private void seedRoom(Hotel hotel, String number, RoomType type, BigDecimal price, int occupancy,
                           String photoUrl, String description, String amenities) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(number);
        room.setRoomType(type);
        room.setBasePrice(price);
        room.setMaxOccupancy(occupancy);
        room.setPhotoUrl(photoUrl);
        room.setDescription(description);
        room.setAmenities(amenities);
        room.setActive(true);
        roomRepository.save(room);
    }
}
