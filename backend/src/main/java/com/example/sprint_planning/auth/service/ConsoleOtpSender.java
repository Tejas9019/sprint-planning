package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Dev OTP delivery: logs the code to the server console. Active when {@code app.otp.delivery=console} (default). */
@Component
@ConditionalOnProperty(name = "app.otp.delivery", havingValue = "console", matchIfMissing = true)
public class ConsoleOtpSender implements OtpSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleOtpSender.class);

    @Override
    public void send(String email, String code, OtpPurpose purpose) {
        log.info("==================== OTP ({}) ====================", purpose);
        log.info("  To:   {}", email);
        log.info("  Code: {}", code);
        log.info("==================================================");
    }
}
