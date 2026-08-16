"use client";

import { Turn } from "../types";

interface PreviousArgumentsProps {
  turns: Turn[];
}

const SPEAKING_PHASES = [
  "Opening Statement",
  "Opening Statement", 
  "Argument",
  "Argument",
  "Closing Statement",
  "Closing Statement",
  "Brief Response",
  "Brief Response",
];

export function PreviousArguments({ turns }: PreviousArgumentsProps) {
  if (turns.length === 0) return null;
  
  return (
    <div className="mt-4 bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">Previous Arguments</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {turns.map((turn, index) => (
          <div key={turn.id} className="p-3 bg-gray-50 rounded text-sm">
            <p className="text-gray-500 text-xs mb-1">
              {SPEAKING_PHASES[index] || "Argument"} - {turn.visitorName}
            </p>
            <p className="text-gray-800">{turn.argument}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
