package com.didicook.api.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.didicook.api.model.Debate;
import com.didicook.api.model.Turn;

@Service

public class DebateService {

    private final Map<String, Debate> debates = new HashMap<>();
    
    public Debate createDebate(String topic) {
        Debate newDebate = new Debate();
        newDebate.setTopic(topic);
        debates.put(newDebate.getId(), newDebate);
        return newDebate;
    }

    public Debate getDebate(String id) {
        return debates.get(id);
    }

    public Turn addTurn(String debateId, String visitorId, String visitorName, String argument) {
        Debate selectedDebate = getDebate(debateId);
        
        // reject during buffer phases (0, 3)
        int phase = selectedDebate.getCurrentPhase();
        if (phase == 0 || phase == 3) {
            return null; 
        }
        
        // only allow current speaker to submit
        if (selectedDebate.getCurrentSpeaker() == null || !visitorId.equals(selectedDebate.getCurrentSpeaker())) {
            return null; 
        }
        
        Turn newTurn = new Turn(visitorId, visitorName, argument);
        selectedDebate.addTurn(newTurn);
        return newTurn;
    }

    public Debate joinDebate(String debateId, String visitorId, String visitorName) {
        Debate debate = getDebate(debateId);
        
        if (debate.getPlayer1Id() == null) {
            debate.setPlayer1Id(visitorId);
            debate.setPlayer1Name(visitorName);
        } else if (debate.getPlayer2Id() == null && !debate.getPlayer1Id().equals(visitorId)) {
            debate.setPlayer2Id(visitorId);
            debate.setPlayer2Name(visitorName);
        }

        return debate;
    }

    public Debate setReady(String debateId, String visitorId) {
        Debate debate = getDebate(debateId);
        if (visitorId.equals(debate.getPlayer1Id())) {
            debate.setPlayer1Ready(true);
        } else if (visitorId.equals(debate.getPlayer2Id())) {
            debate.setPlayer2Ready(true);
        }
        

        if (debate.isPlayer1Ready() && debate.isPlayer2Ready()) {
            debate.setStatus("in_progress");
            debate.setCurrentPhase(0);  
            debate.setCurrentSpeaker(null);  
            debate.setPhaseStartTime(Instant.now());
        }
        
        return debate;
    }

    public Debate nextPhase(String debateId) {
        Debate debate = getDebate(debateId);
        int phase = debate.getCurrentPhase();
        if (phase >= 9) {
            debate.setStatus("judging");
            return debate;
        }
        if (debate.getPhaseStartTime() != null) {
            long elapsed = Instant.now().toEpochMilli() - debate.getPhaseStartTime().toEpochMilli();
            if (elapsed < 1000) {
                return debate; 
            }
        }
        
        debate.setCurrentPhase(phase + 1);
        debate.setPhaseStartTime(Instant.now());
        
        int newPhase = phase + 1;
        if (newPhase == 0 || newPhase == 3) {
            debate.setCurrentSpeaker(null); // buffer phase
        } else if (newPhase == 1 || newPhase == 4 || newPhase == 6 || newPhase == 8) {
            debate.setCurrentSpeaker(debate.getPlayer1Id());
        } else {
            debate.setCurrentSpeaker(debate.getPlayer2Id());
        }
        return debate;
    }
}