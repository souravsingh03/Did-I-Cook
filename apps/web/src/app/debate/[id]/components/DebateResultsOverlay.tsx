"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { CookbookCard } from "@/components/ui/cookbook-card";



interface Round {
  name: string;
  winner: string;
  player1Score: Record<string, number>;
  player2Score: Record<string, number>;
  player1Feedback: string;
  player2Feedback: string;
}

interface DebateResultsProps {
  winner: string;
  player1Id?: string;
  player2Id?: string;
  visitorId?: string;
  player1Name?: string;
  player2Name?: string;
  player1TotalScore?: number;
  player2TotalScore?: number;
  whatDecidedIt?: string;
  player1Strengths?: string[];
  player2Strengths?: string[];
  player1Weaknesses?: string[];
  player2Weaknesses?: string[];
  keyEvidence?: string[];
  rounds?: Round[];
  onClose?: () => void;
  onReturnHome?: () => void;
}

export const DebateResultsOverlay: React.FC<DebateResultsProps> = ({
  winner = "",
  player1Id,
  player2Id,
  visitorId,
  player1Name = "Player 1",
  player2Name = "Player 2",
  player1TotalScore = 0,
  player2TotalScore = 0,
  whatDecidedIt = "",
  player1Strengths = [],
  player2Strengths = [],
  player1Weaknesses = [],
  player2Weaknesses = [],
  keyEvidence = [],
  rounds = [],
  onClose,
  onReturnHome,
}) => {
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const isSmallScreen = size.width < 640;

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const normalize = (s?: string) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
  const winnerNorm = normalize(winner);
  const p1Norm = normalize(player1Name);
  const p2Norm = normalize(player2Name);

  let isPlayer1Winner = false;
  let isPlayer2Winner = false;
  let isTie = false;
  let derivedWinner: string | null = null;

  if (!winnerNorm || winnerNorm === "tie" || winnerNorm === "draw") {
    isTie = true;
  } else if (winnerNorm === p1Norm || winnerNorm.includes("player1") || p1Norm.includes(winnerNorm)) {
    isPlayer1Winner = true;
    derivedWinner = player1Name;
  } else if (winnerNorm === p2Norm || winnerNorm.includes("player2") || p2Norm.includes(winnerNorm)) {
    isPlayer2Winner = true;
    derivedWinner = player2Name;
  }

  if (!isTie && !isPlayer1Winner && !isPlayer2Winner && (player1TotalScore !== undefined && player2TotalScore !== undefined)) {
    if (player1TotalScore > player2TotalScore) {
      isPlayer1Winner = true;
      derivedWinner = player1Name;
    } else if (player2TotalScore > player1TotalScore) {
      isPlayer2Winner = true;
      derivedWinner = player2Name;
    } else {
      isTie = true;
    }
  }

  const titleText = isTie ? "It's a tie!" : `${derivedWinner ?? winner} Wins!`;
  const visitorVictory = visitorId ? ((visitorId === player1Id && isPlayer1Winner) || (visitorId === player2Id && isPlayer2Winner)) : false;
  const visitorDefeat = visitorId ? (!visitorVictory && !isTie && (visitorId === player1Id || visitorId === player2Id)) : false;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, when: "beforeChildren", duration: 0.45 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.36 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full pb-12 overflow-auto max-h-screen" style={{ fontFamily: 'var(--font-caveat)', fontSize: '18px' }}>
      {visitorVictory && (
        <Confetti
          width={size.width}
          height={size.height}
          numberOfPieces={isSmallScreen ? 80 : 300}
          recycle={false}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
        />
      )} 

      <main className="w-full flex justify-center">
        <section className="relative w-full max-w-5xl px-4 rounded-2xl p-8 bg-transparent text-lg md:text-xl">
          {onClose && (
            <button
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={onClose}
            >
              ✕
            </button>
          )}

          <motion.div variants={itemVariants} className="text-center mb-8">
            {isTie ? (
              <h1 className="text-5xl md:text-8xl font-extrabold text-amber-700 -mt-6 md:-mt-8 mb-4">It's a tie!</h1>
            ) : visitorVictory ? (
              <h1 className="text-5xl md:text-8xl font-extrabold text-yellow-500 -mt-6 md:-mt-8 mb-4">Victory</h1>
            ) : visitorDefeat ? (
              <h1 className="text-5xl md:text-8xl font-extrabold text-orange-700 -mt-6 md:-mt-8 mb-4">Defeat</h1>
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold text-amber-700 -mt-4 mb-2">{titleText}</h1>
            )}

            <motion.div variants={itemVariants} className="mx-auto max-w-3xl bg-amber-50 rounded-xl p-4 border border-amber-300 shadow-sm" style={{ fontFamily: 'var(--font-caveat)' }}>
              <p className="text-amber-800 text-lg md:text-xl">{whatDecidedIt || 'No decisive factor.'}</p>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="w-full max-w-md mx-auto">
              <CookbookCard
                title={player1Name}
                subtitle={`${player1TotalScore}/160`}
                ingredients={[...(player1Strengths.length ? player1Strengths : ["No strengths identified."]), ...(player1Weaknesses.length ? ["— Areas for improvement —", ...player1Weaknesses] : [])]}
                colorScheme={isPlayer1Winner ? 'yellow' : 'red'}
                frontPaddingClass="pt-12"
              />
            </div>

            <div className="w-full max-w-md mx-auto">
              <CookbookCard
                title={player2Name}
                subtitle={`${player2TotalScore}/160`}
                ingredients={[...(player2Strengths.length ? player2Strengths : ["No strengths identified."]), ...(player2Weaknesses.length ? ["— Areas for improvement —", ...player2Weaknesses] : [])]}
                colorScheme={isPlayer2Winner ? 'yellow' : 'red'}
                frontPaddingClass="pt-12"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-3xl font-semibold text-amber-900 mb-3" style={{fontFamily: 'var(--font-caveat)'}}>Key Evidence Used</h3>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-300 shadow-sm" style={{backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e9d9b8 32px)', backgroundSize: '100% 32px', fontFamily: 'var(--font-caveat)'}}>
              <ul className="list-disc list-inside text-amber-800 text-base md:text-lg leading-[32px] space-y-1 pt-1">
                {keyEvidence.length ? keyEvidence.map((e, i) => <li key={i} className="first:-mt-4">{e}</li>) : <li>No evidence provided.</li>}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-3xl font-semibold text-amber-900 mb-4" style={{fontFamily: 'var(--font-caveat)'}}>Round-by-Round Breakdown</h3>
            <div className="space-y-4">
              {rounds.length ? rounds.map((r, i) => (
                <div key={i} className="bg-amber-50 border border-amber-300 rounded-xl p-5 pt-1 shadow-sm" style={{backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e9d9b8 32px)', backgroundSize: '100% 32px', fontFamily: 'var(--font-caveat)'}}>
                  <div className="flex justify-between items-center">
                    <strong className="text-amber-900 text-lg md:text-xl leading-[32px]">{r.name}</strong>
                    <span className="text-amber-700 font-semibold text-sm md:text-base leading-[32px]">Winner: {r.winner}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-base md:text-lg font-medium text-amber-800 leading-[32px]">{player1Name} Scores</p>
                      <ul className="text-base md:text-lg text-amber-800 space-y-1 leading-[32px] pt-1">
                        {Object.entries(r.player1Score || {}).map(([k, v]) => <li key={k}>{k}: {v}/10</li>)}
                      </ul>
                      <p className="text-base md:text-lg text-amber-700 mt-1 leading-[32px]">{r.player1Feedback || "No feedback available."}</p>
                    </div>

                    <div>
                      <p className="text-base md:text-lg font-medium text-amber-800 leading-[32px]">{player2Name} Scores</p>
                      <ul className="text-base md:text-lg text-amber-800 space-y-1 leading-[32px] pt-1">
                        {Object.entries(r.player2Score || {}).map(([k, v]) => <li key={k}>{k}: {v}/10</li>)}
                      </ul>
                      <p className="text-base md:text-lg text-amber-700 mt-1 leading-[32px]">{r.player2Feedback || "No feedback available."}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-600">No round data available.</p>}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-200 shadow-lg mt-12"
                style={{ fontFamily: 'var(--font-caveat)' }}
              >
                Return to Home Page
              </button>
            )}
          </motion.div>
        </section>
      </main>
    </motion.div>
  );
};
