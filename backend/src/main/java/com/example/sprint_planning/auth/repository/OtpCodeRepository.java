package com.example.sprint_planning.auth.repository;

import com.example.sprint_planning.auth.OtpPurpose;
import com.example.sprint_planning.auth.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {

    Optional<OtpCode> findByChallengeId(UUID challengeId);

    long countByEmailAndPurposeAndCreatedAtAfter(String email, OtpPurpose purpose, Instant after);
}
