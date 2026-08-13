package com.example.sprint_planning.security.oauth;

import com.example.sprint_planning.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** On Google login failure, bounce back to the SPA's callback with an error fragment. */
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final AppProperties appProperties;

    public OAuth2LoginFailureHandler(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String target = UriComponentsBuilder.fromUriString(appProperties.frontendUrl())
                .path("/oauth/callback")
                .build()
                .toUriString()
                + "#error=" + URLEncoder.encode("google_login_failed", StandardCharsets.UTF_8);
        response.sendRedirect(target);
    }
}
