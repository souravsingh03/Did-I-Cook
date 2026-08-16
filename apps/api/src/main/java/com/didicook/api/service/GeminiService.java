package com.didicook.api.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
@Service
public class GeminiService {
    @Value("${gemini.api-key}")
    private String apiKey;
    @Value("${worker.url:http://localhost:8000}")
    private String workerUrl;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public Map<String, Object> scoreDebate(Map<String, Object> input) {
        String player1Name = (String) input.getOrDefault("player1Name", "Player 1");
        String player2Name = (String) input.getOrDefault("player2Name", "Player 2");
        StringBuilder transcript = new StringBuilder();
        try {
            List<Map<String, Object>> phases = (List<Map<String, Object>>) input.get("phases");
            for (Map<String, Object> phase : phases) {
                String type = (String) phase.get("type");
                int speaker = (int) (phase.get("speaker") instanceof Integer ? phase.get("speaker") : Integer.parseInt(phase.get("speaker").toString()));
                String text = (String) phase.get("text");
                String speakerName = "Player " + speaker;
                if (speaker == 1 && player1Name != null && !player1Name.isBlank()) {
                    speakerName = player1Name;
                } else if (speaker == 2 && player2Name != null && !player2Name.isBlank()) {
                    speakerName = player2Name;
                }
                transcript.append(type).append(" - ").append(speakerName).append(": ").append(text).append("\n");
            }
        } catch (Exception e) {
            return Map.of("error", "Invalid input format for phases", "details", e.getMessage());
        }

        // If no participant produced any speech, skip calling Gemini and return zeros
        List<Map<String, Object>> phases = null;
        try {
            phases = (List<Map<String, Object>>) input.get("phases");
        } catch (Exception ignore) {
        }

        boolean anySpeech = false;
        if (phases != null) {
            for (Map<String, Object> ph : phases) {
                Object textObj = ph.get("text");
                if (textObj != null) {
                    String t = textObj.toString().trim();
                    if (!t.isEmpty() && !t.equalsIgnoreCase("(No speech detected)")) {
                        anySpeech = true;
                        break;
                    }
                }
            }
        }

        if (!anySpeech) {
            // Build a default tie result with zeroed scores and helpful feedback
            java.util.List<Map<String, Object>> roundsOut = new java.util.ArrayList<>();
            if (phases != null) {
                for (Map<String, Object> ph : phases) {
                    String title = ph.getOrDefault("type", "Round").toString();
                    Map<String, Object> r = new java.util.HashMap<>();
                    r.put("name", title);
                    r.put("winner", "tie");
                    r.put("player1Score", Map.of("logic", 0, "clarity", 0, "evidence", 0, "civility", 0));
                    r.put("player2Score", Map.of("logic", 0, "clarity", 0, "evidence", 0, "civility", 0));
                    r.put("player1Feedback", "No speech detected, preventing any evaluation of content or argument.");
                    r.put("player2Feedback", "No speech detected, preventing any evaluation of content or argument.");
                    roundsOut.add(r);
                }
            }

            Map<String, Object> early = new java.util.HashMap<>();
            early.put("winner", "tie");
            early.put("player1Name", player1Name);
            early.put("player2Name", player2Name);
            early.put("player1TotalScore", 0);
            early.put("player2TotalScore", 0);
            early.put("whatDecidedIt", "The complete absence of speech from both participants prevented any evaluation.");
            early.put("player1Strengths", new java.util.ArrayList<>());
            early.put("player2Strengths", new java.util.ArrayList<>());
            early.put("player1Weaknesses", java.util.List.of("Did not present any arguments or content."));
            early.put("player2Weaknesses", java.util.List.of("Did not present any arguments or content."));
            early.put("keyEvidence", new java.util.ArrayList<>());
            early.put("rounds", roundsOut);
            return early;
        }

        List<String> evidence = getEvidenceChunks(transcript.toString(), 5);
        StringBuilder evidenceSection = new StringBuilder();
        if (!evidence.isEmpty()) {
            evidenceSection.append("\nRelevant evidence for this debate (use to support your scoring):\n");
            for (String ev : evidence) {
                evidenceSection.append("- ").append(ev.replace("\"", "'")).append("\n");
            }
        }
        String exampleJson = "{\n" +
            "  \"winner\": \"" + player1Name + "\",\n" +
            "  \"player1Name\": \"" + player1Name + "\",\n" +
            "  \"player2Name\": \"" + player2Name + "\",\n" +
            "  \"player1TotalScore\": 78,\n" +
            "  \"player2TotalScore\": 72,\n" +
            "  \"whatDecidedIt\": \"" + player1Name + "'s opening statement established a stronger foundation with concrete examples, which " + player2Name + " never fully countered.\",\n" +
            "  \"player1Strengths\": [\n" +
            "    \"Excellent use of real-world examples\",\n" +
            "    \"Maintained composure throughout\"\n" +
            "  ],\n" +
            "  \"player2Strengths\": [\n" +
            "    \"Strong logical structure in arguments\",\n" +
            "    \"Effectively challenged opponent's assumptions\"\n" +
            "  ],\n" +
            "  \"player1Weaknesses\": [\n" +
            "    \"Could have addressed counterarguments more directly\",\n" +
            "    \"Evidence could be more current\"\n" +
            "  ],\n" +
            "  \"player2Weaknesses\": [\n" +
            "    \"Opening lacked strong examples\",\n" +
            "    \"Some arguments were repetitive\"\n" +
            "  ],\n" +
            "  \"keyEvidence\": [\n" +
            "    \"" + player1Name + " cited the 2024 McKinsey automation report\",\n" +
            "    \"" + player2Name + " referenced historical job displacement patterns\"\n" +
            "  ],\n" +
            "  \"rounds\": [\n" +
            "    {\n" +
            "      \"name\": \"Opening Statement\",\n" +
            "      \"winner\": \"" + player1Name + "\",\n" +
            "      \"player1Score\": { \"logic\": 8, \"clarity\": 9, \"evidence\": 7, \"civility\": 10 },\n" +
            "      \"player2Score\": { \"logic\": 7, \"clarity\": 8, \"evidence\": 6, \"civility\": 10 },\n" +
            "      \"player1Feedback\": \"Strong opening with clear examples, but could expand on evidence.\",\n" +
            "      \"player2Feedback\": \"Good structure, but lacked compelling real-world ties.\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"Argument\",\n" +
            "      \"winner\": \"" + player2Name + "\",\n" +
            "      \"player1Score\": { \"logic\": 7, \"clarity\": 8, \"evidence\": 6, \"civility\": 9 },\n" +
            "      \"player2Score\": { \"logic\": 8, \"clarity\": 8, \"evidence\": 7, \"civility\": 10 },\n" +
            "      \"player1Feedback\": \"Logical but evidence was weaker here.\",\n" +
            "      \"player2Feedback\": \"Excellent rebuttal with strong evidence.\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"Closing Statement\",\n" +
            "      \"winner\": \"" + player1Name + "\",\n" +
            "      \"player1Score\": { \"logic\": 8, \"clarity\": 9, \"evidence\": 7, \"civility\": 10 },\n" +
            "      \"player2Score\": { \"logic\": 7, \"clarity\": 7, \"evidence\": 6, \"civility\": 10 },\n" +
            "      \"player1Feedback\": \"Compelling close that tied back to opening.\",\n" +
            "      \"player2Feedback\": \"Solid but didn't fully recover from earlier weaknesses.\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"name\": \"Brief Response\",\n" +
            "      \"winner\": \"tie\",\n" +
            "      \"player1Score\": { \"logic\": 7, \"clarity\": 8, \"evidence\": 5, \"civility\": 10 },\n" +
            "      \"player2Score\": { \"logic\": 7, \"clarity\": 8, \"evidence\": 5, \"civility\": 10 },\n" +
            "      \"player1Feedback\": \"Brief but effective.\",\n" +
            "      \"player2Feedback\": \"Matched the brevity well.\"\n" +
            "    }\n" +
            "  ]\n" +
            "}";

        String fullPrompt = "Given the following debate, score it using the following JSON format. " +
            "Replace the placeholder round names in the example JSON with the exact round titles as they appear in the example provided below. " +
            "Do NOT rename, replace, or invent round names (do not output 'phase 0', 'phase 1', 'Round 1', etc.). " +
            "Preserve the original round names exactly (for example: 'Opening Statement', 'Argument', 'Closing Statement'). " +
            "Be concise and fair. Return ONLY valid JSON — no markdown, no commentary, no code block formatting, no explanation, no triple backticks.\n\n" +
            exampleJson +
            evidenceSection.toString() +
            "\nDebate transcript:\n" + transcript.toString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"contents\":[{\"parts\":[{\"text\":\"" + fullPrompt.replace("\"", "\\\"") + "\"}]}]}";
        HttpEntity<String> request = new HttpEntity<>(body, headers);
        java.util.List<String> apiKeys = new java.util.ArrayList<>();
        if (apiKey != null && !apiKey.isBlank()) apiKeys.add(apiKey);
        for (int i = 2; i <= 5; i++) {
            String envKey = System.getenv("GEMINI_API_KEY" + i);
            if (envKey != null && !envKey.isBlank()) apiKeys.add(envKey);
        }

        ResponseEntity<String> response = null;
        Exception lastEx = null;
        for (String keyToTry : apiKeys) {
            try {
                System.out.println("[GeminiService] Trying Gemini with key: " + (keyToTry == apiKey ? "primary" : "backup" + keyToTry.substring(Math.max(0, keyToTry.length()-4))));
                response = restTemplate.postForEntity(GEMINI_URL + "?key=" + keyToTry, request, String.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    break; 
                } else if (response.getStatusCode().value() == 429) {
                    // rate limited — try next key
                    System.out.println("[GeminiService] Key rate-limited, trying next key if available.");
                    response = null;
                    continue;
                } else {
                    break;
                }
            } catch (Exception ex) {
                lastEx = ex;
                System.out.println("[GeminiService] Request failed with key, trying next if available: " + ex.getMessage());
                response = null;
                continue;
            }
        }

        if (response == null) {
            String details = lastEx != null ? lastEx.getMessage() : "All keys failed or were rate limited";
            return Map.of("error", "Failed to call Gemini API", "details", details);
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            String text = root.path("candidates").get(0)
                                  .path("content").path("parts").get(0)
                                  .path("text").asText();
            text = text.replaceAll("(?s)```json|```", "").trim();
            int firstBrace = text.indexOf('{');
            int lastBrace = text.lastIndexOf('}');
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                text = text.substring(firstBrace, lastBrace + 1);
            }
            JsonNode scoring = mapper.readTree(text);
            Map<String, Object> scoringMap = mapper.convertValue(scoring, Map.class);
            Object roundsObj = scoringMap.get("rounds");

            java.util.List<String> originalRoundTitles = new java.util.ArrayList<>();
            try {
                List<Map<String, Object>> phasesForTitles = (List<Map<String, Object>>) input.get("phases");
                if (phasesForTitles != null) {
                    for (Map<String, Object> ph : phasesForTitles) {
                        Object t = ph.get("type");
                        if (t != null) {
                            String title = t.toString();
                            if (!originalRoundTitles.contains(title)) originalRoundTitles.add(title);
                        }
                    }
                }
            } catch (Exception ignore) {
                // if we can't build original titles, skip mapping
            }

                if (roundsObj instanceof List && !originalRoundTitles.isEmpty()) {
                List<Map<String, Object>> roundsList = (List<Map<String, Object>>) roundsObj;
                for (int i = 0; i < roundsList.size() && i < originalRoundTitles.size(); i++) {
                    Map<String, Object> r = roundsList.get(i);
                    Object nameObj = r.get("name");
                    if (nameObj != null) {
                        String name = nameObj.toString().toLowerCase().replaceAll("\\s+", "");
                        if (name.matches("phase\\d+")) {
                            r.put("name", originalRoundTitles.get(i));
                        }
                    }
                }

                // Deduplicate rounds by normalized name while preserving order
                java.util.List<Map<String, Object>> deduped = new java.util.ArrayList<>();
                java.util.Set<String> seen = new java.util.LinkedHashSet<>();
                for (Map<String, Object> r : roundsList) {
                    Object nameObj = r.get("name");
                    String key = nameObj != null ? nameObj.toString().trim().toLowerCase() : "";
                    if (!seen.contains(key)) {
                        seen.add(key);
                        deduped.add(r);
                    }
                }

                scoringMap.put("rounds", deduped);
            }

            return scoringMap;
        } catch (Exception e) {
            return Map.of("error", "Failed to parse Gemini response", "details", e.getMessage());
        }
    }

    public List<String> getEvidenceChunks(String debateTurn, int topK) {
        RestTemplate restTemplate = new RestTemplate();
        String url = workerUrl + "/search";
        ObjectMapper mapper = new ObjectMapper();
        String requestJson = "";
        try {
            Map<String, Object> requestMap = Map.of(
                "query", debateTurn,
                "top_k", topK
            );
            requestJson = mapper.writeValueAsString(requestMap);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build request JSON", e);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            List<String> evidence = new java.util.ArrayList<>();
            if (response.getStatusCode() == org.springframework.http.HttpStatus.OK) {
                try {
                    JsonNode body = mapper.readTree(response.getBody());
                    JsonNode results = body.get("results");
                    if (results != null && results.isArray()) {
                        for (JsonNode chunk : results) {
                            evidence.add(chunk.get("text").asText());
                        }
                    }
                } catch (Exception e) {
                    // parsing failed — log and return empty evidence so Gemini is used without RAG
                    System.out.println("[GeminiService] Failed to parse semantic-search response: " + e.getMessage());
                    return java.util.Collections.emptyList();
                }
            }
            return evidence;
        } catch (Exception e) {
            // semantic-search API or OpenSearch is not available — fall back to direct Gemini without evidence
            System.out.println("[GeminiService] semantic-search unavailable, falling back to direct Gemini: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }
}