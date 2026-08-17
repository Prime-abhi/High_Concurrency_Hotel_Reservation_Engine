package com.hotelbooking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore
    private Hotel hotel;

    @Column(nullable = false)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private Integer maxOccupancy;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @Column(length = 1000)
    private String description;

    /** Simple comma-separated list (e.g. "Free WiFi,Air conditioning,Balcony") - kept as a
     *  plain string rather than a child table since amenities here are just display tags. */
    @Column(length = 500)
    private String amenities;

    private Boolean active = true;

    // Row-level optimistic lock. Every UPDATE checks this version, so two
    // concurrent transactions racing on the same room will cause one of them
    // to fail with an OptimisticLockException instead of silently overbooking.
    @Version
    private Long version;
}
