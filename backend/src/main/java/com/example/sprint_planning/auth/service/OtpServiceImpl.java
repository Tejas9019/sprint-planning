package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.auth.model.OtpCode;
import com.example.sprint_planning.auth.repository.OtpCodeRepository;
import com.example.sprint_planning.common.exception.InvalidOtpException;
import com.example.sprint_planning.common.exception.OtpRateLimitException;
import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.common.util.HashUtil;
import com.example.sprint_planning.config.OtpProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final OtpProperties otpProperties;
    private final OtpSender otpSender;
    private final SecureRandom random = new SecureRandom();

    public OtpServiceImpl(OtpCodeRepository otpCodeRepository,
                          OtpProperties otpProperties,
                          OtpSender otpSender) {
        this.otpCodeRepository = otpCodeRepository;
        this.otpProperties = otpProperties;
        this.otpSender = otpSender;
    }

    @Override
    public OtpCode createChallenge(UUID userId, String email, OtpPurpose purpose) {
        enforceResendCooldown(email, purpose);

        String code = generateCode();
        OtpCode otp = new OtpCode();
        otp.setUserId(userId);
        otp.setEmail(email);
        otp.setCodeHash(HashUtil.sha256Hex(code));
        otp.setPurpose(purpose);
        otp.setChallengeId(UUID.randomUUID());
        otp.setExpiresAt(Instant.now().plus(otpProperties.ttl()));
        otp = otpCodeRepository.save(otp);

        otpSender.send(email, code, purpose);
        return otp;
    }

    @Override
    public OtpCode resend(UUID challengeId) {
        OtpCode existing = otpCodeRepository.findByChallengeId(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));
        return createChallenge(existing.getUserId(), existing.getEmail(), existing.getPurpose());
    }

    @Override
    public OtpCode verify(UUID challengeId, String code) {
        OtpCode otp = otpCodeRepository.findByChallengeId(challengeId)
                .orElseThrow(() -> new InvalidOtpException("Invalid or unknown challenge"));

        if (otp.isConsumed()) {
            throw new InvalidOtpException("This code has already been used");
        }
        if (Instant.now().isAfter(otp.getExpiresAt())) {
            throw new InvalidOtpException("This code has expired");
        }
        if (otp.getAttempts() >= otpProperties.maxAttempts()) {
            otp.setConsumed(true);
            otpCodeRepository.save(otp);
            throw new InvalidOtpException("Too many incorrect attempts; request a new code");
        }
        if (!HashUtil.sha256Hex(code).equals(otp.getCodeHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpCodeRepository.save(otp);
            throw new InvalidOtpException("Incorrect code");
        }

        otp.setConsumed(true);
        return otpCodeRepository.save(otp);
    }

    private void enforceResendCooldown(String email, OtpPurpose purpose) {
        Instant since = Instant.now().minus(otpProperties.resendCooldown());
        long recent = otpCodeRepository.countByEmailAndPurposeAndCreatedAtAfter(email, purpose, since);
        if (recent > 0) {
            throw new OtpRateLimitException("Please wait before requesting another code");
        }
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(otpProperties.length());
        for (int i = 0; i < otpProperties.length(); i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
