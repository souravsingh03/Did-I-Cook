package com.didicook.api.config;

import java.util.Arrays;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/user");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String env = System.getenv("CORS_ALLOWED_ORIGINS");
        String[] origins;
        if (env != null && !env.isBlank()) {
            origins = Arrays.stream(env.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toArray(String[]::new);
        } else {
            origins = new String[] {
                "http://localhost:3000",
                "https://did-i-cook-gold.vercel.app",
                "https://did-i-cook.onrender.com"
            };
        }

        registry.addEndpoint("/ws")
                .setAllowedOrigins(origins)
                .withSockJS();
    }
}
