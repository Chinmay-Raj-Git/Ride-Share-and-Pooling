package com.springapp.rideshare.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.entity.Ride;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.repository.BookingRepository;
import com.springapp.rideshare.repository.RideRepository;
import com.springapp.rideshare.repository.UserRepository;
import com.springapp.rideshare.security.SecurityUtils;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public AdminController(RideRepository rideRepository, BookingRepository bookingRepository,
            UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    private void assertAdmin() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Access denied: admin only");
        }
    }

    // ── Monitoring ─────────────────────────────────────────────────────────────

    @GetMapping("/rides")
    public ResponseEntity<?> getAllRides() {
        try {
            assertAdmin();
            return ResponseEntity.ok(rideRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        try {
            assertAdmin();
            return ResponseEntity.ok(bookingRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            assertAdmin();
            return ResponseEntity.ok(userRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ── Reports ────────────────────────────────────────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        try {
            assertAdmin();

            List<Ride> allRides = rideRepository.findAll();
            List<Booking> allBookings = bookingRepository.findAll();
            List<User> allUsers = userRepository.findAll();

            long totalRides     = allRides.size();
            long completedRides = allRides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
            long cancelledRides = allRides.stream().filter(r -> "CANCELLED".equals(r.getStatus())).count();
            long activeRides    = allRides.stream().filter(r -> "ACTIVE".equals(r.getStatus())).count();
            long totalBookings  = allBookings.size();
            double totalEarnings = allBookings.stream()
                    .filter(b -> "PAID".equals(b.getPaymentStatus()))
                    .mapToDouble(b -> b.getPrice() != null ? b.getPrice() : 0.0)
                    .sum();
            long activeUsers  = allUsers.stream().filter(u -> u.isVerified() && u.isEnabled()).count();
            long blockedUsers = allUsers.stream().filter(u -> !u.isEnabled()).count();

            Map<String, Object> report = new HashMap<>();
            report.put("totalRides",     totalRides);
            report.put("activeRides",    activeRides);
            report.put("completedRides", completedRides);
            report.put("cancelledRides", cancelledRides);
            report.put("totalBookings",  totalBookings);
            report.put("totalEarnings",  totalEarnings);
            report.put("activeUsers",    activeUsers);
            report.put("blockedUsers",   blockedUsers);

            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // ── User Management ────────────────────────────────────────────────────────

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        try {
            assertAdmin();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if ("ADMIN".equals(user.getRole())) {
                return ResponseEntity.badRequest().body("Cannot block another admin");
            }
            user.setEnabled(false);
            userRepository.save(user);
            return ResponseEntity.ok("User blocked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        try {
            assertAdmin();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok("User unblocked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
