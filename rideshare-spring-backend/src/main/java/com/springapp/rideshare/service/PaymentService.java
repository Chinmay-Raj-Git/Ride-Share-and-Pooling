package com.springapp.rideshare.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.springapp.rideshare.entity.Booking;
import com.springapp.rideshare.repository.BookingRepository;

import jakarta.transaction.Transactional;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final BookingRepository bookingRepository;

    public PaymentService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public JSONObject createOrder(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (booking.getPrice() == null || booking.getPrice() <= 0) {
            throw new RuntimeException("Booking price is invalid or not set");
        }

        if ("PAID".equals(booking.getPaymentStatus())) {
            throw new RuntimeException("Booking is already paid");
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        // Convert rupees to paise (Razorpay requires integer paise)
        int amountInPaise = (int) Math.round(booking.getPrice() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);

        Order order = client.orders.create(orderRequest);

        booking.setRazorpayOrderId(order.get("id").toString());
        bookingRepository.save(booking);

        // Build response — use toString() to avoid ClassCastException (Razorpay returns Integer for amount)
        JSONObject response = new JSONObject();
        response.put("orderId", order.get("id").toString());
        response.put("amount", amountInPaise);          // always return the int we sent
        response.put("currency", "INR");
        response.put("bookingId", bookingId);
        return response;
    }

    @Transactional
    public String verifyPayment(String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySignature) throws Exception {
        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        boolean isValid = Utils.verifySignature(payload, razorpaySignature, keySecret);

        if (!isValid) {
            throw new RuntimeException("Invalid payment signature");
        }

        Booking booking = bookingRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Booking not found for this order"));

        booking.setRazorpayPaymentId(razorpayPaymentId);
        booking.setPaymentStatus("PAID");
        bookingRepository.save(booking);

        return "Payment verified successfully. Booking ID: " + booking.getId();
    }
}
