package com.didicook.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // Allow origins from environment variable or sensible defaults (local + Vercel + Render)
        String origins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (origins != null && !origins.isEmpty()) {
            for (String origin : origins.split(",")) {
                config.addAllowedOrigin(origin.trim());
            }
        } else {
            config.addAllowedOrigin("http://localhost:3000");
            config.addAllowedOrigin("https://did-i-cook-gold.vercel.app");
            config.addAllowedOrigin("https://did-i-cook.onrender.com");
        }
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}