"use client";

interface TimerProps {
  timeLeft: number | null;
}

export function Timer({ timeLeft }: TimerProps) {
  if (timeLeft === null) return null;
  const isLow = timeLeft <= 10;
  
  return (
    <div className="text-center py-2">
      <span className={`text-4xl font-mono font-bold ${
        isLow ? "text-red-500" : "text-orange-600"
      }`}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
}
