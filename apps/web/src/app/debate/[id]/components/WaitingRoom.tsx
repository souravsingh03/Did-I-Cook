"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Debate } from "../types";

interface PlayerSlotProps {
  playerName: string | null;
  playerId: string | null;
  isReady: boolean;
  isCurrentUser: boolean;
  slotNumber: 1 | 2;
}

function PlayerSlot({ playerName, playerId, isReady, isCurrentUser, slotNumber }: PlayerSlotProps) {
  return (
    <div className={`p-3 rounded-2xl border bg-white shadow-sm ${isCurrentUser ? "border-orange-500" : "border-gray-200"}`}>
      <div className="flex justify-between items-center">
        <p className="font-medium text-gray-700">
          {playerName || <span className="text-gray-400">Waiting...</span>}
          {isCurrentUser && <span className="text-orange-500"> (You)</span>}
        </p>
        {playerId && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${isReady ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {isReady ? "✓ Ready" : "Not Ready"}
          </span>
        )}
      </div>
    </div>
  );
}

interface WaitingRoomProps {
  debate: Debate;
  visitorId: string;
  isPlayer1: boolean;
  isPlayer2: boolean;
  myReady: boolean;
  mediaError: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onReady: () => void;
}

export function WaitingRoom({ 
  debate, 
  visitorId, 
  isPlayer1, 
  isPlayer2, 
  myReady, 
  mediaError, 
  videoRef, 
  onReady 
}: WaitingRoomProps) {
  const bothPlayersJoined = debate.player1Id && debate.player2Id;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
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
          backgroundImage: `url("/ForkKnife.png")`,
          backgroundSize: '120px 120px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600">{debate.topic}</h1>
            <p className="text-gray-500 mt-1">
              Room Code: <span className="font-mono font-bold text-orange-600">{debate.id}</span>
            </p>
          </div>

          {mediaError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
              {mediaError}
            </div>
          )}

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <PlayerSlot
              playerName={debate.player1Name}
              playerId={debate.player1Id}
              isReady={debate.player1Ready}
              isCurrentUser={isPlayer1}
              slotNumber={1}
            />
            <PlayerSlot
              playerName={debate.player2Name}
              playerId={debate.player2Id}
              isReady={debate.player2Ready}
              isCurrentUser={isPlayer2}
              slotNumber={2}
            />
          </div>

          {(isPlayer1 || isPlayer2) && !myReady && bothPlayersJoined && (
            <button
              onClick={onReady}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-full transition-colors"
            >
              I'm Ready
            </button>
          )}

          {myReady && (
            <p className="text-center text-green-600 font-medium">
              ✓ Waiting for opponent...
            </p>
          )}

          {!debate.player2Id && (
            <p className="text-center text-gray-500">
              Share the room code with your opponent
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
