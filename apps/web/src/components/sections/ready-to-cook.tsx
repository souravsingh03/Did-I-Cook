"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { 
  RecipeCard, 
  BackgroundPattern, 
  FloatingDecorations, 
  readyToCookDecorations,
  FormInput,
  FormSelect,
  Button
} from "@/components/ui";

const topicOptions = [
  "Are Software Engineers Cooked? (AI)",
  "Is a Hot Dog a Sandwich",
  "How Many Holes in a Polo?",
  "Which Is Better? Never Have to Sleep, Never Have to Eat, Never Have to Breathe",
  "Are AI Generated Images Considered Art?",
  "Random",
];

export function ReadyToCookSection() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState(topicOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");

  const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "https://did-i-cook.onrender.com";

  const handleCreateRoom = async () => {
    if (!createName.trim()) {
      setCreateError("Please enter your name");
      return;
    }
    
    setCreateError("");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ROOT}/api/debates`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ topic: selectedTopic }),
      });

      const debate = await response.json();
      localStorage.setItem("visitorName", createName);
      router.push(`/debate/${debate.id}`);
    } catch (error) {
      console.error("Failed to create debate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setJoinError("Please enter a room code");
      return;
    }
    if (!joinName.trim()) {
      setJoinError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setJoinError("");
    try {
      const response = await fetch(`${API_ROOT}/api/debates/${roomCode.toUpperCase()}`);

      if (!response.ok) {
        setJoinError("Room not found");
        return;
      }

      localStorage.setItem("visitorName", joinName);
      router.push(`/debate/${roomCode.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to join debate:", error);
      setJoinError("Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      id="ready-to-cook" 
      className="w-full py-20 bg-gradient-to-b from-white via-amber-50/50 to-orange-50/30 relative overflow-hidden scroll-mt-4"
    >
      <BackgroundPattern imageUrl="/ForkKnife.png" />
      <FloatingDecorations decorations={readyToCookDecorations} />
      
      <div ref={ref} className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent pb-3">
            Ready to Cook?
          </h2>
          <div className="flex items-center justify-center gap-4 mt-2 mb-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-orange-400" />
            <div className="w-2 h-2 rotate-45 bg-orange-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-orange-400" />
          </div>
          <p className="text-lg text-gray-600">
            Start a new debate or join an existing one
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <RecipeCard title="Create Room" variant="amber" stamp="📋">
              <div className="space-y-5">
                <FormInput 
                  label="Your Name" 
                  placeholder="Enter your name" 
                  variant="amber"
                  value={createName}
                  onChange={setCreateName}
                />
                <FormSelect  
                  label="Topic" 
                  options={topicOptions} 
                  variant="amber" 
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                />
                {createError && (
                  <p className="text-red-500 text-sm">{createError}</p>
                )}
                <Button fullWidth onClick={handleCreateRoom}>
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </RecipeCard>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          >
            <RecipeCard title="Join Room" variant="orange" stamp="🥄">
              <div className="space-y-5">
                <FormInput 
                  label="Your Name" 
                  placeholder="Enter your name" 
                  variant="orange"
                  value={joinName}
                  onChange={setJoinName}
                />
                <FormInput 
                  label="Room Code" 
                  placeholder="e.g. A7K2" 
                  variant="orange"
                  value={roomCode}
                  onChange={setRoomCode}
                />
                {joinError && (
                  <p className="text-red-500 text-sm">{joinError}</p>
                )}
                <Button fullWidth onClick={handleJoinRoom}>
                  {isLoading ? "Joining..." : "Join Room"}
                </Button>
              </div>
            </RecipeCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
