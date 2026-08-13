package com.example.sprint_planning.rbac;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AuthorityMapperTest {

    private final AuthorityMapper mapper = new AuthorityMapper();

    @Test
    void mapsRolesAndPermissionsToAuthorities() {
        var authorities = mapper.toAuthorities(List.of("ROLE_ADMIN"), List.of("TASK_CREATE", "TASK_READ"));
        assertThat(authorities.stream().map(GrantedAuthority::getAuthority))
                .containsExactlyInAnyOrder("ROLE_ADMIN", "TASK_CREATE", "TASK_READ");
    }

    @Test
    void toleratesNulls() {
        assertThat(mapper.toAuthorities(null, null)).isEmpty();
    }
}
