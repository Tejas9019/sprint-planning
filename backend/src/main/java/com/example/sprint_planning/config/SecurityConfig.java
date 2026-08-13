package com.example.sprint_planning.config;

import com.example.sprint_planning.common.api.ApiPaths;
import com.example.sprint_planning.security.RestAccessDeniedHandler;
import com.example.sprint_planning.security.RestAuthenticationEntryPoint;
import com.example.sprint_planning.security.jwt.JwtAuthenticationFilter;
import com.example.sprint_planning.security.oauth.OAuth2LoginFailureHandler;
import com.example.sprint_planning.security.oauth.OAuth2LoginSuccessHandler;
import com.example.sprint_planning.tenant.context.TenantResolutionFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Stateless, token-based security. All requests carry a JWT except the public auth and
 * OAuth endpoints. Google login (oauth2Login) is wired only when a Google client is configured.
 */
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({JwtProperties.class, OtpProperties.class, AppProperties.class})
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final TenantResolutionFilter tenantResolutionFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          TenantResolutionFilter tenantResolutionFilter,
                          RestAuthenticationEntryPoint authenticationEntryPoint,
                          RestAccessDeniedHandler accessDeniedHandler,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.tenantResolutionFilter = tenantResolutionFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository,
            ObjectProvider<OAuth2LoginSuccessHandler> oAuth2SuccessHandler,
            ObjectProvider<OAuth2LoginFailureHandler> oAuth2FailureHandler) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(ApiPaths.AUTH + "/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/actuator/health", "/error").permitAll()
                        .anyRequest().authenticated());

        // Wire Google oauth2Login only when a client registration is actually configured,
        // so the app still boots without Google credentials.
        if (clientRegistrationRepository.getIfAvailable() != null) {
            OAuth2LoginSuccessHandler success = oAuth2SuccessHandler.getIfAvailable();
            OAuth2LoginFailureHandler failure = oAuth2FailureHandler.getIfAvailable();
            http.oauth2Login(oauth -> {
                if (success != null) {
                    oauth.successHandler(success);
                }
                if (failure != null) {
                    oauth.failureHandler(failure);
                }
            });
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(tenantResolutionFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
