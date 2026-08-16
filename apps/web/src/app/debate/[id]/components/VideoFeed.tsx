"use client";

import { RefObject, useEffect, useRef } from "react";

interface VideoFeedProps {
  videoRef?: RefObject<HTMLVideoElement | null>;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  playerName: string | null;
  isLocalPlayer: boolean;
  isSpeaking: boolean;
}

export function VideoFeed({ videoRef, localStream, remoteStream, playerName, isLocalPlayer, isSpeaking }: VideoFeedProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set local stream
  useEffect(() => {
    const videoElement = videoRef?.current || localVideoRef.current;
    if (videoElement && localStream && isLocalPlayer) {
      videoElement.srcObject = localStream;
    }
  }, [localStream, isLocalPlayer, videoRef]);

  // Set remote stream when it changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative rounded-2xl shadow-sm aspect-video overflow-hidden max-h-[40vh] md:max-h-[60vh]">
      {isLocalPlayer ? (
        <video
          ref={videoRef || localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">👤</div>
            <p className="text-gray-600">{playerName}</p>
            <p className="text-gray-400 text-sm">Connecting...</p>
          </div>
        </div>
      )}
      
      <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-sm shadow-sm flex items-center gap-2 z-10 ${
        isSpeaking 
          ? "bg-orange-500 text-white" 
          : "bg-white text-gray-700 border border-gray-200"
      }`}>
        {isSpeaking && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        {playerName} {isLocalPlayer && "(You)"}
      </div>
    </div>
  );
}
