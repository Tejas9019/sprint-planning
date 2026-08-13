package com.example.sprint_planning.security.oauth;

import com.example.sprint_planning.tenant.service.TenantService;
import com.example.sprint_planning.user.AuthProvider;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Finds, links, or creates the local {@link User} backing a Google sign-in. */
@Service
public class GoogleAccountService {

    private final UserRepository userRepository;
    private final TenantService tenantService;

    public GoogleAccountService(UserRepository userRepository, TenantService tenantService) {
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    /**
     * Resolve the user for a verified Google profile:
     * <ul>
     *   <li>existing email -> link the Google provider (account linking by verified email)</li>
     *   <li>new email -> create a GOOGLE user (no password) plus a personal tenant</li>
     * </ul>
     */
    @Transactional
    public User resolve(String email, String givenName, String familyName, String subject) {
        String normalized = email.trim().toLowerCase();
        return userRepository.findByEmail(normalized)
                .map(existing -> linkProvider(existing, subject))
                .orElseGet(() -> createGoogleUser(normalized, givenName, familyName, subject));
    }

    private User linkProvider(User user, String subject) {
        if (user.getProviderSubject() == null) {
            user.setProviderSubject(subject);
        }
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
        }
        return userRepository.save(user);
    }

    private User createGoogleUser(String email, String givenName, String familyName, String subject) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(orDefault(givenName, "Google"));
        user.setLastName(orDefault(familyName, "User"));
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setProviderSubject(subject);
        user.setEmailVerified(true);
        user.setPassword(null);
        user = userRepository.save(user);
        tenantService.createPersonalTenant(user);
        return user;
    }

    private String orDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
