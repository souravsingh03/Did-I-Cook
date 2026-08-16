package com.didicook.api.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Debate {
    private String player1Id;
    private String player1Name;
    private boolean player1Ready;

    private String player2Id;
    private String player2Name;
    private boolean player2Ready;

    private int currentPhase;
    private String currentSpeaker;
    private Instant phaseStartTime;

    private String id;
    private String topic;
    private String status;
    private List<Turn> turns;

    public Debate() {
        this.id = generateRoomId();
        this.turns = new ArrayList<>();
        this.status = "waiting";
    }
    
    public Debate(String topic) {
        this();
        this.topic = topic;
    }
    private String generateRoomId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 4; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public String getId() {return id;}
    public String getTopic() {return topic;}
    public String getStatus() {return status;}
    public List<Turn> getTurns() {return turns;}

    public String getPlayer1Id() {return player1Id;}
    public String getPlayer1Name() {return player1Name;}
    public boolean isPlayer1Ready() {return player1Ready;}
    public String getPlayer2Id() {return player2Id;}
    public String getPlayer2Name() {return player2Name;}
    public boolean isPlayer2Ready() {return player2Ready;}

    public int getCurrentPhase() {return currentPhase;}
    public String getCurrentSpeaker() {return currentSpeaker;}
    public Instant getPhaseStartTime() {return phaseStartTime;}

    public void setId(String id) {this.id = id;}
    public void setTopic(String topic) {this.topic = topic;}
    public void setStatus(String status) {this.status = status;}
    public void setTurns(List<Turn> turns) {this.turns = turns;}
    public void addTurn(Turn turn) {this.turns.add(turn);}

    public void setPlayer1Id(String player1Id) {this.player1Id = player1Id;}
    public void setPlayer1Name(String player1Name) {this.player1Name = player1Name;}
    public void setPlayer1Ready(boolean player1Ready) {this.player1Ready = player1Ready;}
    public void setPlayer2Id(String player2Id) {this.player2Id = player2Id;}
    public void setPlayer2Name(String player2Name) {this.player2Name = player2Name;}
    public void setPlayer2Ready(boolean player2Ready) {this.player2Ready = player2Ready;}

    // Phase setters
    public void setCurrentPhase(int currentPhase) {this.currentPhase = currentPhase;}
    public void setCurrentSpeaker(String currentSpeaker) {this.currentSpeaker = currentSpeaker;}
    public void setPhaseStartTime(Instant phaseStartTime) {this.phaseStartTime = phaseStartTime;}

}