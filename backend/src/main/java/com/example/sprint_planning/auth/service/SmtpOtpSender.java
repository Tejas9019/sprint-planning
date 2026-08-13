package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.config.OtpProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/** Production OTP delivery via SMTP. Active when {@code app.otp.delivery=smtp}. */
@Component
@ConditionalOnProperty(name = "app.otp.delivery", havingValue = "smtp")
public class SmtpOtpSender implements OtpSender {

    private final JavaMailSender mailSender;
    private final OtpProperties otpProperties;

    public SmtpOtpSender(JavaMailSender mailSender, OtpProperties otpProperties) {
        this.mailSender = mailSender;
        this.otpProperties = otpProperties;
    }

    @Override
    public void send(String email, String code, OtpPurpose purpose) {
        String subject = purpose == OtpPurpose.SIGNUP_VERIFY
                ? "Verify your email"
                : "Your sign-in code";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(otpProperties.fromAddress());
        message.setTo(email);
        message.setSubject(subject);
        message.setText("Your verification code is: " + code
                + "\n\nIt expires in " + otpProperties.ttl().toMinutes() + " minutes."
                + "\nIf you did not request this, you can ignore this email.");
        mailSender.send(message);
    }
}
