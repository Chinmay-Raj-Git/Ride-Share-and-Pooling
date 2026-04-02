package com.springapp.rideshare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestParam Long bookingId) {
        try {
            return ResponseEntity.ok(paymentService.createOrder(bookingId).toMap());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature) {
        try {
            String result = paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
// ```

// ---

// ## Postman Testing Guide

// **1. Create Order**
// ```
// POST /api/payments/create-order?bookingId=1
// Authorization: Bearer <token>
// ```
// Response: `{ "orderId": "order_xxx", "amount": 50000, "currency": "INR", "bookingId": 1 }`

// **2. Verify Payment** (after completing payment in Razorpay test mode)
// ```
// POST /api/payments/verify
//   ?razorpayOrderId=order_xxx
//   &razorpayPaymentId=pay_xxx
//   &razorpaySignature=<hmac_sha256_signature>
// Authorization: Bearer <token>