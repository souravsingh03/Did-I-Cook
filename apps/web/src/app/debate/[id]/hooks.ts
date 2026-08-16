"use client";

import { useState, useEffect, useRef } from "react";
import { Debate, SpeechRecognition, SpeechRecognitionEvent } from "./types";

interface UseSpeechRecognitionResult {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Recognition restart failed:", e);
        }
      }
    };

    recognition.onerror = (event: Event & { error?: string }) => {
      console.error("Speech recognition error:", event);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
        setIsListening(true);
        setTranscript("");
        setInterimTranscript("");
      } catch (e) {
        console.log("Recognition start failed:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  return {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}

interface UseDebateResult {
  debate: Debate | null;
  joinDebate: (visitorId: string, visitorName: string) => Promise<void>;
  setReady: (visitorId: string) => Promise<void>;
  submitTurn: (visitorId: string, visitorName: string, argument: string) => Promise<void>;
  nextPhase: () => Promise<void>;
}

export function useDebate(debateId: string): UseDebateResult {
  const [debate, setDebate] = useState<Debate | null>(null);
  const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "https://did-i-cook.onrender.com";
  const API_BASE = `${API_ROOT}/api/debates/${debateId}`;

  useEffect(() => {
    const fetchDebate = async () => {
      try {
        const response = await fetch(API_BASE);
        const text = await response.text();

        if (!response.ok) {
          console.error(`Failed to fetch debate: HTTP ${response.status}`, text);
          // don't attempt to parse non-OK responses
          setDebate(null);
          return;
        }

        if (!text) {
          console.error("Failed to fetch debate: empty response body");
          setDebate(null);
          return;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Failed to parse debate JSON:", parseErr, "responseText:", text);
          setDebate(null);
          return;
        }

        setDebate(data);
      } catch (error) {
        console.error("Failed to fetch debate:", error);
      }
    };

    fetchDebate();
    const interval = setInterval(fetchDebate, 1000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  const joinDebate = async (visitorId: string, visitorName: string) => {
    try {
      await fetch(`${API_BASE}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, visitorName }),
      });
    } catch (error) {
      console.error("Failed to join debate:", error);
    }
  };

  const setReady = async (visitorId: string) => {
    try {
      await fetch(`${API_BASE}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
    } catch (error) {
      console.error("Failed to set ready:", error);
    }
  };

  const submitTurn = async (visitorId: string, visitorName: string, argument: string) => {
    try {
      await fetch(`${API_BASE}/turns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, visitorName, argument }),
      });
    } catch (error) {
      console.error("Failed to submit turn:", error);
    }
  };

  const nextPhase = async () => {
    try {
      await fetch(`${API_BASE}/next-phase`, { method: "POST" });
    } catch (error) {
      console.error("Failed to advance phase:", error);
    }
  };

  return { debate, joinDebate, setReady, submitTurn, nextPhase };
}

export function useMediaStream() {
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const constraints: any = isMobile ? { video: { width: { ideal: 640 }, height: { ideal: 360 } }, audio: true } : { video: true, audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to access media devices:", error);
        setMediaError("Please allow camera and microphone access.");
      }
    };

    initMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, mediaError, localStream };
}

export function useTimer(debate: Debate | null, phaseDurations: number[]) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!debate || debate.status !== "in_progress" || !debate.phaseStartTime) {
      setTimeLeft(null);
      return;
    }

    const duration = phaseDurations[debate.currentPhase];
    
    if (duration === undefined) return;
  
    const startTime = new Date(debate.phaseStartTime).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    
    return () => clearInterval(interval);
  }, [debate?.phaseStartTime, debate?.currentPhase, debate?.status, phaseDurations]);

  return timeLeft;
}

export function useWebRTC(debateId: string, visitorId: string, localStream: MediaStream | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<any>(null);
  const hasCreatedOfferRef = useRef(false);
  const offerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!debateId || !visitorId || !localStream) return;

    let isMounted = true;
    hasCreatedOfferRef.current = false;

    const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "https://did-i-cook.onrender.com";
    const initWebRTC = async () => {
      try {
        const SockJS = (await import("sockjs-client")).default;
        const { Client } = await import("@stomp/stompjs");
        // Prefer explicit NEXT_PUBLIC_WS_URL, but never accept the deployed worker host.
        const envWs = process.env.NEXT_PUBLIC_WS_URL || `${API_ROOT}/ws`;
        let WS_ROOT = envWs;
        try {
          if (typeof WS_ROOT === 'string' && WS_ROOT.includes('worker')) {
            console.warn('NEXT_PUBLIC_WS_URL points to worker; using API /ws instead');
            WS_ROOT = `${API_ROOT}/ws`;
          }
        } catch (e) {
          WS_ROOT = `${API_ROOT}/ws`;
        }
        const client = new Client({
          webSocketFactory: () => new SockJS(WS_ROOT),
          reconnectDelay: 5000,
          debug: (str) => console.log("STOMP:", str),
        });
        const iceServers: RTCConfiguration = {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        };
        const peerConnection = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = peerConnection;
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
        peerConnection.ontrack = (event) => {
          console.log("Received remote track");
          if (isMounted) {
            setRemoteStream(event.streams[0]);
            setIsConnected(true);
          }
        };
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && client.connected) {
            client.publish({
              destination: "/app/ice-candidate",
              body: JSON.stringify({
                debateId: debateId,
                fromUser: visitorId,
                candidate: event.candidate,
              }),
            });
          }
        };

        peerConnection.onconnectionstatechange = () => {
          console.log("Connection state:", peerConnection.connectionState);
          if (peerConnection.connectionState === "connected") {
            setIsConnected(true);
          } else if (peerConnection.connectionState === "disconnected" || 
                     peerConnection.connectionState === "failed") {
            setIsConnected(false);
          }
        };
        client.onConnect = () => {
          console.log("WebSocket connected");
          stompClientRef.current = client;
          client.publish({
            destination: "/app/join",
            body: JSON.stringify({ debateId: debateId, visitorId }),
          });
          client.subscribe(`/topic/room/${debateId}/user-joined`, (message) => {
            const data = JSON.parse(message.body);
            console.log("User joined:", data);
  
            if (data.userId === visitorId && data.existingUsers > 0 && !hasCreatedOfferRef.current && isMounted) {
              hasCreatedOfferRef.current = true;
              offerTimeoutRef.current = setTimeout(() => {
                if (isMounted && peerConnection.signalingState !== 'closed') {
                  createOffer(peerConnection, client, debateId, visitorId);
                }
              }, 500); 
            }
          });

          client.subscribe(`/topic/room/${debateId}/offer`, async (message) => {
            const data = JSON.parse(message.body);
            if (data.fromUser !== visitorId && isMounted && peerConnection.signalingState !== 'closed') {
              console.log("Received offer from:", data.fromUser);
              await handleOffer(peerConnection, client, debateId, visitorId, data.offer);
            }
          });

          client.subscribe(`/topic/room/${debateId}/answer`, async (message) => {
            const data = JSON.parse(message.body);
            if (data.fromUser !== visitorId && isMounted && peerConnection.signalingState !== 'closed') {
              console.log("Received answer from:", data.fromUser);
              await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
          });

          client.subscribe(`/topic/room/${debateId}/ice-candidate`, async (message) => {
            const data = JSON.parse(message.body);
            if (data.fromUser !== visitorId && data.candidate && isMounted && peerConnection.signalingState !== 'closed') {
              console.log("Received ICE candidate from:", data.fromUser);
              try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (e) {
                console.error("Error adding ICE candidate:", e);
              }
            }
          });

          client.subscribe(`/topic/room/${debateId}/user-left`, (message) => {
            const leftUser = message.body;
            console.log("User left:", leftUser);
            if (leftUser !== visitorId) {
              setRemoteStream(null);
              setIsConnected(false);
            }
          });
        };

        client.onStompError = (frame) => {
          console.error("STOMP error:", frame);
          setConnectionError("WebSocket connection error");
        };

        // Connect
        client.activate();

        // Cleanup
        return () => {
          isMounted = false;
          if (offerTimeoutRef.current) {
            clearTimeout(offerTimeoutRef.current);
          }
          if (client.connected) {
            client.publish({
              destination: "/app/leave",
              body: JSON.stringify({ debateId: debateId, visitorId }),
            });
            client.deactivate();
          }
          peerConnection.close();
        };
      } catch (error) {
        console.error("WebRTC initialization error:", error);
        if (isMounted) {
          setConnectionError("Failed to initialize video connection");
        }
      }
    };

    const cleanup = initWebRTC();

    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [debateId, visitorId, localStream]);

  return { remoteStream, isConnected, connectionError };
}

async function createOffer(
  peerConnection: RTCPeerConnection,
  client: any,
  debateId: string,
  visitorId: string
) {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    client.publish({
      destination: "/app/offer",
      body: JSON.stringify({
        debateId: debateId,
        fromUser: visitorId,
        toUser: "opponent",
        offer: offer,
      }),
    });
    console.log("Offer sent");
  } catch (error) {
    console.error("Error creating offer:", error);
  }
}

async function handleOffer(
  peerConnection: RTCPeerConnection,
  client: any,
  debateId: string,
  visitorId: string,
  offer: RTCSessionDescriptionInit
) {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    client.publish({
      destination: "/app/answer",
      body: JSON.stringify({
        debateId: debateId,
        fromUser: visitorId,
        toUser: "opponent",
        answer: answer,
      }),
    });
    console.log("Answer sent");
  } catch (error) {
    console.error("Error handling offer:", error);
  }
}
