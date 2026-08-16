package com.didicook.api.controller;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.didicook.api.model.Debate;
import com.didicook.api.model.Turn;
import com.didicook.api.service.DebateService;

@RestController
@RequestMapping("/api/debates")
public class DebateController {

    private final DebateService debateService;
    private final com.didicook.api.service.GeminiService geminiService;
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final ConcurrentHashMap<String, Map<String, Object>> resultsCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> resultStatus = new ConcurrentHashMap<>();

    public DebateController(DebateService debateService, com.didicook.api.service.GeminiService geminiService) {
        this.debateService = debateService;
        this.geminiService = geminiService;
    }

    @PostMapping
    public Debate createDebate(@RequestBody Map<String, String> body) {
        String topic = body.get("topic");
        return debateService.createDebate(topic);
    }

    @GetMapping("/{id}")
    public Debate getDebate(@PathVariable String id) {
        return debateService.getDebate(id);
    }

    @GetMapping("/{id}/results")
    public Map<String, Object> getDebateResults(@PathVariable String id) {
        System.out.println("[DebateController] /results called for debate " + id);
        Debate debate = debateService.getDebate(id);
        if (debate == null) return Map.of("error", "Debate not found");

        if (resultsCache.containsKey(id)) {
            return resultsCache.get(id);
        }

        if ("pending".equals(resultStatus.get(id))) {
            return Map.of("status", "pending");
        }

        //collect input for later scoring
        List<Map<String, Object>> phases = new java.util.ArrayList<>();
        for (int i = 0; i < debate.getTurns().size(); i++) {
            var turn = debate.getTurns().get(i);
            phases.add(Map.of(
                "type", "phase" + i,
                "speaker", turn.getVisitorId().equals(debate.getPlayer1Id()) ? 1 : 2,
                "text", turn.getArgument()
            ));
        }
        Map<String, Object> input = Map.of(
            "phases", phases,
            "player1Name", debate.getPlayer1Name() != null ? debate.getPlayer1Name() : "Player 1",
            "player2Name", debate.getPlayer2Name() != null ? debate.getPlayer2Name() : "Player 2"
        );

        //async evaluation
        resultStatus.put(id, "pending");
        executor.submit(() -> {
            try {
                System.out.println("[DebateController] Async Gemini scoring started for debate " + id);
                Map<String, Object> result = geminiService.scoreDebate(input);
                resultsCache.put(id, result);
                resultStatus.put(id, "done");
                System.out.println("[DebateController] Async Gemini scoring done for debate " + id);
            } catch (Exception e) {
                resultStatus.put(id, "error");
                System.out.println("[DebateController] Async Gemini scoring failed for debate " + id + ": " + e.getMessage());
            }
        });

        return Map.of("status", "pending");
    }

    @GetMapping("/{id}/results/status")
    public Map<String, Object> getResultsStatus(@PathVariable String id) {
        String status = resultStatus.getOrDefault(id, "pending");
        if ("done".equals(status) && resultsCache.containsKey(id)) {
            Map<String, Object> full = new java.util.HashMap<>(resultsCache.get(id));
            full.put("status", "done");
            return full;
        }
        return Map.of("status", status);
    }

    @PostMapping("/{id}/turns")
    public Turn addTurn(@PathVariable String id, @RequestBody Map<String, String> body) {
        String argument = body.get("argument");
        String visitorId = body.get("visitorId");
        String visitorName = body.get("visitorName");
        return debateService.addTurn(id, visitorId, visitorName, argument);
    }

    @PostMapping("/{id}/join") 
    public Debate joinDebate(@PathVariable String id, @RequestBody Map<String, String> body) {
        String visitorId = body.get("visitorId");
        String visitorName = body.get("visitorName");
        return debateService.joinDebate(id, visitorId, visitorName);
    }

    @PostMapping("/{id}/ready")
    public Debate setReady(@PathVariable String id, @RequestBody Map<String, String> body) {
        String visitorId = body.get("visitorId");
        return debateService.setReady(id, visitorId);
    }

    @PostMapping("/{id}/next-phase")
    public Debate nextPhase(@PathVariable String id) {
        return debateService.nextPhase(id);
    }
}