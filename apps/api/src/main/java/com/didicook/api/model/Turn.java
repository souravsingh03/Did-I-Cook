package com.didicook.api.model;

import java.time.Instant;
import java.util.UUID;

public class Turn {
    private String id;
    private String visitorId;
    private String visitorName;
    private String argument;
    private Instant timestamp;
    private Integer score;

    public Turn() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }
    public Turn(String visitorId, String visitorName, String argument) {
        this();
        this.visitorId = visitorId;
        this.visitorName = visitorName;
        this.argument = argument;
    }

    public String getId() {return id;}
    public String getVisitorId() {return visitorId;}
    public String getVisitorName() {return visitorName;}
    public String getArgument() {return argument;}
    public Instant getTimestamp() {return timestamp;}
    public Integer getScore() {return score;}

    public void setId(String id) {this.id = id;}
    public void setVisitorId(String visitorId) {this.visitorId = visitorId;}
    public void setVisitorName(String visitorName) {this.visitorName = visitorName;}
    public void setArgument(String argument) {this.argument = argument;}
    public void setTimestamp(Instant timestamp) {this.timestamp = timestamp;}
    public void setScore(Integer score) {this.score = score;}

}