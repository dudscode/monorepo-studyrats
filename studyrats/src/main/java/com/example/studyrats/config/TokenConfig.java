package com.example.studyrats.config;

import com.example.studyrats.model.User;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class TokenConfig {

    private final JwtEncoder jwtEncoder;

    public TokenConfig(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(User user) {
        List<String> roles = user.getRoles() == null ? List.of() :
                user.getRoles().stream().map(r -> r.getName().name()).toList();
        var claims = JwtClaimsSet.builder()
                .issuer("StudyRats")
                .subject(user.getEmail())
                .claim("firstName", user.getFirstName())
                .claim("idUser", user.getUserId())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(86400)).build(); // 24 horas
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
