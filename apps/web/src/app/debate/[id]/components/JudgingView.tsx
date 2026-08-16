"use client";

import { Debate, PHASE_INFO } from "../types";

interface JudgingViewProps {
  debate: Debate;
}

export function JudgingView({ debate }: JudgingViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-4">Debate Complete!</h1>
        <p className="text-xl text-gray-700 mb-8">The AI judge is reviewing the arguments...</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-700 mb-4">All Arguments</h3>
          <div className="space-y-4 text-left">
            {debate.turns.map((turn, index) => (
              <div key={turn.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">
                  {PHASE_INFO[index]?.name} - {turn.visitorName}
                </p>
                <p className="text-gray-800">{turn.argument}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
