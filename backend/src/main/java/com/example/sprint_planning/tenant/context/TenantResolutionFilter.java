package com.example.sprint_planning.tenant.context;

import com.example.sprint_planning.common.dto.ApiError;
import com.example.sprint_planning.security.AuthenticatedUser;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Populates the request-scoped {@link TenantContext} from the authenticated principal's
 * token tenant. The {@code X-Tenant-Id} header, when present, must match the token's tenant;
 * to act in a different tenant the client must obtain a new token via the switch-tenant endpoint.
 * Runs after {@code JwtAuthenticationFilter}.
 */
@Component
public class TenantResolutionFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-Id";

    private final TenantContext tenantContext;
    private final ObjectMapper objectMapper;

    public TenantResolutionFilter(TenantContext tenantContext, ObjectMapper objectMapper) {
        this.tenantContext = tenantContext;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user && user.tenantId() != null) {
            String headerTenant = request.getHeader(TENANT_HEADER);
            if (StringUtils.hasText(headerTenant) && !matches(headerTenant, user.tenantId())) {
                writeConflict(request, response);
                return;
            }
            tenantContext.setTenantId(user.tenantId());
        }
        filterChain.doFilter(request, response);
    }

    private boolean matches(String headerTenant, UUID tokenTenant) {
        try {
            return UUID.fromString(headerTenant.trim()).equals(tokenTenant);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private void writeConflict(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ApiError body = ApiError.of(HttpStatus.FORBIDDEN.value(), "TENANT_MISMATCH",
                "X-Tenant-Id does not match the active session tenant; switch tenant to get a new token",
                request.getRequestURI());
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
