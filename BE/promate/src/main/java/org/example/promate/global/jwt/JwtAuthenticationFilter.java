package org.example.promate.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            // JWT 유효성 검증
            boolean isValid = jwtProvider.validateToken(token);

            log.info("[JWT] uri={}, valid={}",
                    request.getRequestURI(), isValid);

            if (!isValid) {
                log.warn("[JWT] 유효하지 않은 토큰");
                filterChain.doFilter(request, response);
                return;
            }

            // Refresh Token 검증
            if (jwtProvider.isRefreshToken(token)) {
                log.warn("[JWT] Refresh Token으로 접근 시도");
                filterChain.doFilter(request, response);
                return;
            }

            // 사용자 ID 추출
            Long userId = jwtProvider.getUserId(token);

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.emptyList()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 인증 성공 로그
            log.info("[JWT] 인증 성공. uri={}, userId={}", request.getRequestURI(), userId);
        }

        filterChain.doFilter(request, response);
    }
}