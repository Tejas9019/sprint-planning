package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.config.OtpProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

        long ttlMinutes = otpProperties.ttl().toMinutes();

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #1f2937; }
                .container { max-width: 500px; margin: 40px auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
                .header { font-size: 24px; font-weight: 700; color: #4f46e5; margin-bottom: 24px; text-align: center; }
                .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 12px; }
                .text { font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
                .code-container { text-align: center; background-color: #f3f4f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
                .code { font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; font-family: monospace; }
                .footer { font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">⚡ TrackFlows</div>
                <div class="title">%s</div>
                <p class="text">Please use the verification code below to complete your action. This code is valid for <strong>%d minutes</strong>.</p>
                <div class="code-container">
                  <span class="code">%s</span>
                </div>
                <p class="text">If you did not request this code, you can safely ignore this email.</p>
                <div class="footer">
                  <p>This is an automated message from TrackFlows. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(subject, ttlMinutes, code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(otpProperties.fromAddress());
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML OTP email", e);
        }
    }
}
