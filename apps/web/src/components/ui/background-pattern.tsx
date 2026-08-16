"use client";

interface BackgroundPatternProps {
  imageUrl: string;
  size?: string;
  opacity?: string;
}

export function BackgroundPattern({ 
  imageUrl, 
  size = "80px 80px", 
  opacity = "opacity-[0.07]" 
}: BackgroundPatternProps) {
  return (
    <div 
      className={`absolute inset-0 ${opacity} pointer-events-none`}
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: size,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
