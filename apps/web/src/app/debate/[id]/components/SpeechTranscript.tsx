"use client";

interface SpeechTranscriptProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  onEndTurn: () => void;
  isSubmitting: boolean;
}

export function SpeechTranscript({ 
  isListening, 
  transcript, 
  interimTranscript, 
  onEndTurn, 
  isSubmitting 
}: SpeechTranscriptProps) {
  return (
    <div className="bg-white rounded-2xl p-3 2xl:p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-2 2xl:mb-3">
        <div className={`w-2 h-2 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
        <span className="text-gray-500 text-sm">
          {isListening ? "Listening..." : "Mic off"}
        </span>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 2xl:p-3 min-h-[60px] max-h-[80px] 2xl:min-h-[80px] 2xl:max-h-[120px] overflow-y-auto text-gray-700 text-sm 2xl:text-base">
        {transcript}
        <span className="text-gray-400">{interimTranscript}</span>
        {!transcript && !interimTranscript && (
          <span className="text-gray-400">Your speech will appear here...</span>
        )}
      </div>
      
      <button
        onClick={onEndTurn}
        disabled={isSubmitting}
        className="mt-3 2xl:mt-4 w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-medium py-2 2xl:py-3 rounded-full transition-colors text-sm 2xl:text-base"
      >
        {isSubmitting ? "Submitting..." : "End Turn"}
      </button>
    </div>
  );
}
