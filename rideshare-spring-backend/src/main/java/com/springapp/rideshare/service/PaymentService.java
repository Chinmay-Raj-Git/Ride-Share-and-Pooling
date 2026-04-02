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
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (booking.getPrice() * 100)); // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "booking_" + bookingId);

        Order order = client.orders.create(orderRequest);

        booking.setRazorpayOrderId(order.get("id"));
        bookingRepository.save(booking);

        JSONObject response = new JSONObject();
        response.put("orderId", (String) order.get("id"));
        response.put("amount", (String) order.get("amount"));
        response.put("currency", (String) order.get("currency"));
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