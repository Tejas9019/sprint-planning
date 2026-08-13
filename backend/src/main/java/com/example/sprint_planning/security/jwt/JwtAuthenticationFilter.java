package com.example.sprint_planning.security.jwt;

import com.example.sprint_planning.common.exception.InvalidTokenException;
import com.example.sprint_planning.rbac.AuthorityMapper;
import com.example.sprint_planning.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

/**
 * Authenticates each request from a {@code Authorization: Bearer <jwt>} header.
 * Authorities are read straight from the token claims, so no DB lookup happens here.
 * Invalid/expired tokens are ignored (the request proceeds unauthenticated and the
 * security entry point produces a 401 if the route requires auth).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final AuthorityMapper authorityMapper;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, AuthorityMapper authorityMapper) {
        this.tokenProvider = tokenProvider;
        this.authorityMapper = authorityMapper;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                authenticate(token, request);
            } catch (InvalidTokenException ex) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }

    private void authenticate(String token, HttpServletRequest request) {
        Claims claims = tokenProvider.parseAccessToken(token);
        AuthenticatedUser principal = new AuthenticatedUser(
                tokenProvider.getUserId(claims),
                tokenProvider.getEmail(claims),
                tokenProvider.getTenantId(claims));
        Collection<GrantedAuthority> authorities =
                authorityMapper.toAuthorities(tokenProvider.getRoles(claims), tokenProvider.getPermissions(claims));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
