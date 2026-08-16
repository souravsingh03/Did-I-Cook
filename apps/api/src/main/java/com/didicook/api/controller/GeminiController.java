package com.didicook.api.controller;

import com.didicook.api.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {
    @Autowired
    private GeminiService geminiService;
    @PostMapping("/score")
    public Map<String, Object> scoreDebate(@RequestBody Map<String, Object> body) {
        return geminiService.scoreDebate(body);
    }
}