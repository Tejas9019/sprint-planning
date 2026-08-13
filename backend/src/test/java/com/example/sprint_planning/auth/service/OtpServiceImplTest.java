package com.example.sprint_planning.auth.service;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.auth.model.OtpCode;
import com.example.sprint_planning.auth.repository.OtpCodeRepository;
import com.example.sprint_planning.common.exception.InvalidOtpException;
import com.example.sprint_planning.common.exception.OtpRateLimitException;
import com.example.sprint_planning.common.util.HashUtil;
import com.example.sprint_planning.config.OtpProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceImplTest {

    @Mock
    private OtpCodeRepository otpCodeRepository;
    @Mock
    private OtpSender otpSender;

    private OtpServiceImpl otpService;

    @BeforeEach
    void setUp() {
        OtpProperties props = new OtpProperties(6, Duration.ofMinutes(10), 5,
                Duration.ofSeconds(60), "console", "test@trackflows.app");
        otpService = new OtpServiceImpl(otpCodeRepository, props, otpSender);
    }

    @Test
    void createChallengePersistsHashedCodeAndSends() {
        when(otpCodeRepository.countByEmailAndPurposeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(0L);
        when(otpCodeRepository.save(any(OtpCode.class))).thenAnswer(inv -> inv.getArgument(0));

        OtpCode result = otpService.createChallenge(UUID.randomUUID(), "jane@example.com", OtpPurpose.SIGNIN);

        ArgumentCaptor<OtpCode> captor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpCodeRepository).save(captor.capture());
        assertThat(captor.getValue().getCodeHash()).hasSize(64); // sha-256 hex, never the raw code
        assertThat(result.getChallengeId()).isNotNull();
        verify(otpSender).send(eq("jane@example.com"), anyString(), eq(OtpPurpose.SIGNIN));
    }

    @Test
    void createChallengeRespectsResendCooldown() {
        when(otpCodeRepository.countByEmailAndPurposeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(1L);

        assertThatThrownBy(() -> otpService.createChallenge(UUID.randomUUID(), "jane@example.com", OtpPurpose.SIGNIN))
                .isInstanceOf(OtpRateLimitException.class);
        verify(otpSender, never()).send(anyString(), anyString(), any());
    }

    @Test
    void verifyConsumesOnCorrectCode() {
        OtpCode otp = otpCode("123456", Instant.now().plusSeconds(300), 0, false);
        when(otpCodeRepository.findByChallengeId(otp.getChallengeId())).thenReturn(Optional.of(otp));
        when(otpCodeRepository.save(any(OtpCode.class))).thenAnswer(inv -> inv.getArgument(0));

        OtpCode result = otpService.verify(otp.getChallengeId(), "123456");

        assertThat(result.isConsumed()).isTrue();
    }

    @Test
    void verifyIncrementsAttemptsOnWrongCode() {
        OtpCode otp = otpCode("123456", Instant.now().plusSeconds(300), 0, false);
        when(otpCodeRepository.findByChallengeId(otp.getChallengeId())).thenReturn(Optional.of(otp));
        when(otpCodeRepository.save(any(OtpCode.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> otpService.verify(otp.getChallengeId(), "000000"))
                .isInstanceOf(InvalidOtpException.class);
        assertThat(otp.getAttempts()).isEqualTo(1);
        assertThat(otp.isConsumed()).isFalse();
    }

    @Test
    void verifyRejectsExpiredCode() {
        OtpCode otp = otpCode("123456", Instant.now().minusSeconds(1), 0, false);
        when(otpCodeRepository.findByChallengeId(otp.getChallengeId())).thenReturn(Optional.of(otp));

        assertThatThrownBy(() -> otpService.verify(otp.getChallengeId(), "123456"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void verifyBurnsCodeAfterTooManyAttempts() {
        OtpCode otp = otpCode("123456", Instant.now().plusSeconds(300), 5, false);
        when(otpCodeRepository.findByChallengeId(otp.getChallengeId())).thenReturn(Optional.of(otp));
        when(otpCodeRepository.save(any(OtpCode.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> otpService.verify(otp.getChallengeId(), "123456"))
                .isInstanceOf(InvalidOtpException.class);
        assertThat(otp.isConsumed()).isTrue();
    }

    private OtpCode otpCode(String rawCode, Instant expiresAt, int attempts, boolean consumed) {
        OtpCode otp = new OtpCode();
        otp.setChallengeId(UUID.randomUUID());
        otp.setEmail("jane@example.com");
        otp.setPurpose(OtpPurpose.SIGNIN);
        otp.setCodeHash(HashUtil.sha256Hex(rawCode));
        otp.setExpiresAt(expiresAt);
        otp.setAttempts(attempts);
        otp.setConsumed(consumed);
        return otp;
    }
}
