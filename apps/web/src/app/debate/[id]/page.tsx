"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PHASE_INFO } from "./types";
import { useDebate, useSpeechRecognition, useMediaStream, useTimer, useWebRTC } from "./hooks";
import { 
  VideoFeed, 
  SpeechTranscript, 
  Timer, 
  PreviousArguments, 
  WaitingRoom 
} from "./components";
import { DebateResultsOverlay } from "./components/DebateResultsOverlay";

export default function DebateRoom() {
  const params = useParams();
  const router = useRouter();
  const debateId = params.id as string;
  const [results, setResults] = useState<any | null>(null);
  const [visitorId] = useState(() => 
    typeof window !== "undefined" 
      ? localStorage.getItem("visitorId") || crypto.randomUUID()
      : ""
  );
  const [visitorName, setVisitorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);
  const { debate, joinDebate, setReady, submitTurn, nextPhase } = useDebate(debateId);
  const { transcript, interimTranscript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  const { videoRef, mediaError, localStream } = useMediaStream();
  const timeLeft = useTimer(debate, PHASE_INFO.map(p => p.duration));
  const { remoteStream, isConnected, connectionError } = useWebRTC(debateId, visitorId, localStream);
  const handleReady = () => setReady(visitorId);
  
  useEffect(() => {
    if (debate && debate.status === "judging") {
      const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "https://did-i-cook.onrender.com";

      // Kick off async evaluation (returns immediately with {status:"pending"})
      fetch(`${API_ROOT}/api/debates/${debateId}/results`).catch(() => {});

      // Poll /results/status every 3s until done
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_ROOT}/api/debates/${debateId}/results/status`);
          const data = await res.json();
          if (data.status === "done") {
            clearInterval(pollInterval);
            setResults(data);
          }
        } catch (error) {
          console.error("Failed to poll results:", error);
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [debateId, debate?.status]);
  
  const handleEndTurn = useCallback(async () => {
    if (isSubmitting) return;
    
    const finalArgument = transcript.trim() || "(No speech detected)";
    setIsSubmitting(true);
    
    try {
      stopListening();
      await submitTurn(visitorId, visitorName, finalArgument);
      resetTranscript();
      await nextPhase();
    } catch (error) {
      console.error("Failed to submit turn:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [transcript, isSubmitting, stopListening, submitTurn, visitorId, visitorName, resetTranscript, nextPhase]);

  useEffect(() => {
    if (visitorId) {
      localStorage.setItem("visitorId", visitorId);
    }
    const name = localStorage.getItem("visitorName") || "Anonymous";
    setVisitorName(name);
  }, [visitorId]);

  useEffect(() => {
    if (visitorId) {
      const name = localStorage.getItem("visitorName") || "Anonymous";
      joinDebate(visitorId, name);
    }
  }, [visitorId, joinDebate]);

  useEffect(() => {
    autoSubmittedRef.current = false;
  }, [debate?.currentPhase]);

  useEffect(() => {
    if (!debate) return;
    
    const currentPhaseInfo = PHASE_INFO[debate.currentPhase];
    const isBufferPhase = currentPhaseInfo?.isBuffer;
    const isMyTurn = debate.currentSpeaker === visitorId && debate.status === "in_progress" && !isBufferPhase;
    
    if (isMyTurn && !isListening) {
      startListening();
    } else if (!isMyTurn && isListening) {
      stopListening();
    }
  }, [debate?.currentSpeaker, debate?.currentPhase, debate?.status, visitorId, isListening, startListening, stopListening]);

  //auto-advance buffer phases when timer ends (only player1 advances to prevent double-call)
  useEffect(() => {
    if (!debate || debate.status !== "in_progress") return;
    if (visitorId !== debate.player1Id) return; 
    
    const currentPhaseInfo = PHASE_INFO[debate.currentPhase];
    if (currentPhaseInfo?.isBuffer && timeLeft === 0) {
      nextPhase();
    }
  }, [timeLeft, debate?.currentPhase, debate?.status, nextPhase, visitorId, debate?.player1Id]);

  useEffect(() => {
    if (!debate || debate.status !== "in_progress") return;
    if (autoSubmittedRef.current) return;
    
    const currentPhaseInfo = PHASE_INFO[debate.currentPhase];
    const isMyTurn = debate.currentSpeaker === visitorId;
    
    // only auto-submit if timeLeft is exactly 0 AND we've been in this phase for a while
    // (timeLeft being null means timer hasn't started yet)
    if (!currentPhaseInfo?.isBuffer && isMyTurn && timeLeft === 0 && !isSubmitting && timeLeft !== null) {
      const timer = setTimeout(() => {
        if (!autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          handleEndTurn();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, debate?.currentPhase, debate?.status, debate?.currentSpeaker, visitorId, isSubmitting, handleEndTurn]);

  if (!debate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const isPlayer1 = visitorId === debate.player1Id;
  const isPlayer2 = visitorId === debate.player2Id;
  const isMyTurn = debate.currentSpeaker === visitorId;
  const myReady = isPlayer1 ? debate.player1Ready : isPlayer2 ? debate.player2Ready : false;
  const currentPhaseInfo = PHASE_INFO[debate.currentPhase];
  const combinedError = mediaError || speechError || connectionError;

  if (debate.status === "waiting") {
    return (
      <WaitingRoom
        debate={debate}
        visitorId={visitorId}
        isPlayer1={isPlayer1}
        isPlayer2={isPlayer2}
        myReady={myReady}
        mediaError={combinedError}
        videoRef={videoRef}
        onReady={handleReady}
      />
    );
  }

  // debate in progress
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-4 flex flex-col items-center justify-center relative overflow-auto">
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.25,
          backgroundPosition: ['0px 0px', '120px 120px']
        }}
        transition={{
          opacity: { duration: 1.5, ease: "easeOut" },
          backgroundPosition: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        style={{
          backgroundImage: `url("/chef%20hat.png")`,
          backgroundSize: '120px 120px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl 2xl:max-w-6xl w-full space-y-4">
        {!(debate.status === "judging" && results && typeof results === "object" && !Array.isArray(results)) && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-600">🍳 {debate.topic}</h1>
              <p className="text-gray-500 text-base">
                {currentPhaseInfo?.isBuffer 
                  ? currentPhaseInfo.name
                  : `${currentPhaseInfo?.name} — ${debate.currentSpeaker === debate.player1Id ? debate.player1Name : debate.player2Name}`
                }
              </p>
            </div>

            {!(debate.status === "judging" && results && typeof results === "object" && !Array.isArray(results)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VideoFeed
                  videoRef={isPlayer1 ? videoRef : undefined}
                  localStream={isPlayer1 ? localStream : undefined}
                  remoteStream={isPlayer2 ? remoteStream : undefined}
                  playerName={debate.player1Name}
                  isLocalPlayer={isPlayer1}
                  isSpeaking={debate.currentSpeaker === debate.player1Id}
                />
                <VideoFeed
                  videoRef={isPlayer2 ? videoRef : undefined}
                  localStream={isPlayer2 ? localStream : undefined}
                  remoteStream={isPlayer1 ? remoteStream : undefined}
                  playerName={debate.player2Name}
                  isLocalPlayer={isPlayer2}
                  isSpeaking={debate.currentSpeaker === debate.player2Id}
                />
              </div>
            )}

            <Timer timeLeft={timeLeft} />
            {debate.status === "judging" && !results ? (
              <motion.div
                className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 w-80 text-center">
                  <motion.h2
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold text-orange-600"
                  >
                    AI is judging...
                  </motion.h2>
                  <p className="mt-2 text-sm text-gray-600">Analyzing arguments and gathering supporting evidence. This usually takes a few seconds.</p>
                  <div className="mt-4 flex items-center justify-center space-x-3 h-6">
                    <motion.span className="w-3 h-3 bg-orange-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: 0 }} />
                    <motion.span className="w-3 h-3 bg-orange-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} />
                    <motion.span className="w-3 h-3 bg-orange-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }} />
                  </div>
                </div>
              </motion.div>
            ) : currentPhaseInfo?.isBuffer ? (
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-200">
                <p className="text-gray-500">
                  Prep Time — {debate.player1Name} speaks next
                </p>
              </div>
            ) : isMyTurn ? (
              <SpeechTranscript
                isListening={isListening}
                transcript={transcript}
                interimTranscript={interimTranscript}
                onEndTurn={handleEndTurn}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-200">
                <p className="text-gray-500">
                  Waiting for {debate.currentSpeaker === debate.player1Id ? debate.player1Name : debate.player2Name}...
                </p>
              </div>
            )}
          </>
        )}

      </div>

      {debate.status === "judging" && results && typeof results === "object" && !Array.isArray(results) && (
        <DebateResultsOverlay
          winner={(results as any).winner}
          player1Id={debate.player1Id ?? undefined}
          player2Id={debate.player2Id ?? undefined}
          visitorId={visitorId}
          player1Name={debate.player1Name ?? undefined}
          player2Name={debate.player2Name ?? undefined}
          player1TotalScore={(results as any).player1TotalScore}
          player2TotalScore={(results as any).player2TotalScore}
          player1Strengths={(results as any).player1Strengths || []}
          player2Strengths={(results as any).player2Strengths || []}
          player1Weaknesses={(results as any).player1Weaknesses || []}
          player2Weaknesses={(results as any).player2Weaknesses || []}
          keyEvidence={(results as any).keyEvidence || []}
          rounds={(results as any).rounds || []}
          whatDecidedIt={(results as any).whatDecidedIt}
          onReturnHome={() => router.push('/')}
        />
      )}
    </div>
  );
}
