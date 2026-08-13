package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;

/** Strategy for delivering an OTP code to a recipient. Implementation chosen by {@code app.otp.delivery}. */
public interface OtpSender {

    void send(String email, String code, OtpPurpose purpose);
}
