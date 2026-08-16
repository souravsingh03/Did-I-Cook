package com.didicook.api.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private final Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

    @MessageMapping("/join")
    public void joinRoom(Map<String, String> payload) {
        String debateId = payload.get("debateId");
        String visitorId = payload.get("visitorId");
        
        System.out.println("User " + visitorId + " joining room " + debateId);
        Set<String> users = roomUsers.computeIfAbsent(debateId, k -> ConcurrentHashMap.newKeySet());
        int existingCount = users.size();
        users.add(visitorId);

        Map<String, Object> joinResponse = new HashMap<>();
        joinResponse.put("userId", visitorId);
        joinResponse.put("existingUsers", existingCount);
        messagingTemplate.convertAndSend("/topic/room/" + debateId + "/user-joined", (Object) joinResponse);
    }

    @MessageMapping("/offer")
    public void handleOffer(Map<String, Object> payload) {
        String debateId = (String) payload.get("debateId");
        String fromUser = (String) payload.get("fromUser");
        String toUser = (String) payload.get("toUser");
        Object offer = payload.get("offer");
        
        System.out.println("Offer from " + fromUser + " to " + toUser + " in room " + debateId);
        Map<String, Object> response = new HashMap<>();
        response.put("fromUser", fromUser);
        response.put("offer", offer);
        messagingTemplate.convertAndSend("/topic/room/" + debateId + "/offer", (Object) response);
    }

    @MessageMapping("/answer")
    public void handleAnswer(Map<String, Object> payload) {
        String debateId = (String) payload.get("debateId");
        String fromUser = (String) payload.get("fromUser");
        String toUser = (String) payload.get("toUser");
        Object answer = payload.get("answer");
        
        System.out.println("Answer from " + fromUser + " to " + toUser + " in room " + debateId);
        Map<String, Object> response = new HashMap<>();
        response.put("fromUser", fromUser);
        response.put("answer", answer);
        messagingTemplate.convertAndSend("/topic/room/" + debateId + "/answer", (Object) response);
    }

    @MessageMapping("/ice-candidate")
    public void handleIceCandidate(Map<String, Object> payload) {
        String debateId = (String) payload.get("debateId");
        String fromUser = (String) payload.get("fromUser");
        Object candidate = payload.get("candidate");
        
        System.out.println("ICE candidate from " + fromUser + " in room " + debateId);
        Map<String, Object> response = new HashMap<>();
        response.put("fromUser", fromUser);
        response.put("candidate", candidate);
        messagingTemplate.convertAndSend("/topic/room/" + debateId + "/ice-candidate", (Object) response);
    }

    @MessageMapping("/leave")
    public void leaveRoom(Map<String, String> payload) {
        String debateId = payload.get("debateId");
        String visitorId = payload.get("visitorId");
        
        System.out.println("User " + visitorId + " leaving room " + debateId);
        Set<String> users = roomUsers.get(debateId);
        if (users != null) {
            users.remove(visitorId);
        }
        messagingTemplate.convertAndSend("/topic/room/" + debateId + "/user-left", visitorId);
    }
}
