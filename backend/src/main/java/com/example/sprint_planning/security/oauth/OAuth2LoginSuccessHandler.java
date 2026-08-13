package com.example.sprint_planning.security.oauth;

import com.example.sprint_planning.auth.dto.AuthTokensResponse;
import com.example.sprint_planning.auth.service.AuthService;
import com.example.sprint_planning.config.AppProperties;
import com.example.sprint_planning.user.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

/**
 * After a successful Google login, mint our own JWT session and hand it to the SPA by
 * redirecting to {@code <frontend>/oauth/callback} with tokens in the URL fragment
 * (fragments are not sent to servers, reducing token leakage via logs/referrers).
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleAccountService googleAccountService;
    private final AuthService authService;
    private final AppProperties appProperties;

    public OAuth2LoginSuccessHandler(GoogleAccountService googleAccountService,
                                     AuthService authService,
                                     AppProperties appProperties) {
        this.googleAccountService = googleAccountService;
        this.authService = authService;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        String givenName = principal.getAttribute("given_name");
        String familyName = principal.getAttribute("family_name");
        String subject = principal.getAttribute("sub");

        if (email == null) {
            redirectError(response, "google_no_email");
            return;
        }

        User user = googleAccountService.resolve(email, givenName, familyName, subject);
        AuthTokensResponse tokens = authService.issueOAuthSession(
                user, request.getHeader("User-Agent"), request.getRemoteAddr());

        String fragment = "accessToken=" + enc(tokens.accessToken())
                + "&refreshToken=" + enc(tokens.refreshToken())
                + "&expiresIn=" + tokens.expiresIn();
        String target = UriComponentsBuilder.fromUriString(appProperties.frontendUrl())
                .path("/oauth/callback")
                .build()
                .toUriString() + "#" + fragment;
        response.sendRedirect(target);
    }

    private void redirectError(HttpServletResponse response, String code) throws IOException {
        String target = UriComponentsBuilder.fromUriString(appProperties.frontendUrl())
                .path("/oauth/callback")
                .build()
                .toUriString() + "#error=" + enc(code);
        response.sendRedirect(target);
    }

    private String enc(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
