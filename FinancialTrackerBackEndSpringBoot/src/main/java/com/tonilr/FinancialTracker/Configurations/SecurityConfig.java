package com.tonilr.FinancialTracker.Configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import com.tonilr.FinancialTracker.repos.UserSettingsRepo;

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserSettingsRepo userSettingsRepo;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/system/status") // Permitir CSRF para el endpoint crítico
                .ignoringRequestMatchers("/auth/**") // Permitir CSRF para autenticación
                .ignoringRequestMatchers("/user/login", "/user/add", "/user/forgot-password", "/user/reset-password")
                .ignoringRequestMatchers("/marketdata/**") // Permitir CSRF para marketdata
                .ignoringRequestMatchers("/api/update-control/**") // Permitir CSRF para update-control
                .ignoringRequestMatchers("/api/test/health", "/api/test/cors-test") // Permitir CSRF para endpoints de prueba
            )
            .headers(headers -> headers
                .frameOptions().deny()
                .xssProtection()
                .and()
                .contentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/api/email/**").authenticated()
                .requestMatchers("/marketdata/**").permitAll()
                .requestMatchers("/api/update-control/**").permitAll() // Permitir explícitamente update-control
                .requestMatchers("/user/login", "/user/add", "/user/forgot-password", "/user/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/user/{userId}/settings").authenticated()
                .requestMatchers(HttpMethod.PUT, "/user/{userId}/settings").authenticated()
                .requestMatchers("/user/*/settings").authenticated()
                .requestMatchers("/account/**", "/transaction/**").authenticated()
                
                // Endpoint CRÍTICO para el sistema de ahorro de costos - SIEMPRE público
                .requestMatchers("/api/system/status").permitAll()
                
                // Endpoints de testing para debugging
                .requestMatchers("/api/test/health").permitAll()
                .requestMatchers("/api/test/cors-test").permitAll()
                
                // Endpoints de testing solo en desarrollo
                .requestMatchers("/api/test/**").hasRole("ADMIN") // Solo admins en producción
                .requestMatchers("/api/system/metrics").hasRole("ADMIN") // Solo admins
                
                // Actuator solo en desarrollo
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .cors(cors -> cors.configurationSource(corsConfigurationSource));
        
        log.info("Configuración de seguridad aplicada - CSRF habilitado, CORS unificado, endpoints restringidos");
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
