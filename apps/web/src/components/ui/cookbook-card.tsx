"use client";

interface CookbookCardProps {
  step?: number;
  title: string;
  subtitle: string;
  ingredients: string[];
  colorScheme: "red" | "orange" | "yellow";
  frontPaddingClass?: string;
}

const colorSchemes = {
  red: {
    gradient: 'linear-gradient(145deg, #e8c9a0 0%, #ddb88f 50%, #d4a87a 100%)',
    border: 'border-orange-400/40',
    textMain: 'text-orange-900',
    textMuted: 'text-orange-800/70',
    textSubtle: 'text-orange-800/60',
    divider: 'bg-orange-700/30',
    dividerDot: 'bg-orange-700/40',
    banner: 'bg-orange-400/20 border-orange-400/30',
    bannerText: 'text-orange-800/60',
  },
  orange: {
    gradient: 'linear-gradient(145deg, #f5d4a8 0%, #eac49a 50%, #deb488 100%)',
    border: 'border-amber-500/40',
    textMain: 'text-amber-900',
    textMuted: 'text-amber-800/70',
    textSubtle: 'text-amber-800/60',
    divider: 'bg-amber-700/30',
    dividerDot: 'bg-amber-700/40',
    banner: 'bg-amber-400/20 border-amber-400/30',
    bannerText: 'text-amber-800/60',
  },
  yellow: {
    gradient: 'linear-gradient(145deg, #fae6b8 0%, #f0d8a5 50%, #e6ca92 100%)',
    border: 'border-yellow-500/40',
    textMain: 'text-yellow-900',
    textMuted: 'text-yellow-800/70',
    textSubtle: 'text-yellow-800/60',
    divider: 'bg-yellow-700/30',
    dividerDot: 'bg-yellow-700/40',
    banner: 'bg-yellow-400/20 border-yellow-400/30',
    bannerText: 'text-yellow-800/60',
  },
};

export function CookbookCard({ step, title, subtitle, ingredients, colorScheme, frontPaddingClass }: CookbookCardProps) {
  const colors = colorSchemes[colorScheme];
  
  return (
    <div className="group h-80 [perspective:1000px] cursor-pointer drop-shadow-[0_8px_16px_rgba(120,80,40,0.25)] hover:drop-shadow-[0_12px_24px_rgba(120,80,40,0.35)] transition-all duration-300">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div 
            className={`h-full rounded-lg shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative border-2 ${colors.border}`}
            style={{
              background: colors.gradient,
              fontFamily: 'var(--font-caveat)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
              <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 ${frontPaddingClass || ''}`}>
              {typeof step !== 'undefined' && (
                <p className={`${colors.textMuted} text-base tracking-[0.2em] uppercase mb-2`}>Step {step}</p>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-px ${colors.divider}`} />
                <div className={`w-1.5 h-1.5 rotate-45 ${colors.dividerDot}`} />
                <div className={`w-8 h-px ${colors.divider}`} />
              </div>
              <h3 className={`text-3xl font-bold ${colors.textMain} mb-1`}>
                {title}
              </h3>
              <p className={`${colors.textSubtle} text-lg italic mt-2`}>{subtitle}</p>
            </div>
            <div className={`py-3 ${colors.banner} border-t`}>
              <p className={`${colors.bannerText} text-base text-center tracking-wider`}>Hover to read</p>
            </div>
          </div>
        </div>  
        {/* Inside Page */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div 
            className="h-full rounded-lg bg-amber-50 border-2 border-amber-300 shadow-xl relative overflow-hidden"
            style={{
              backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #d4c4a8 32px)`,
              backgroundSize: '100% 32px',
              fontFamily: 'var(--font-caveat)',
            }}
          >
            {typeof step !== 'undefined' && (
              <div className="absolute top-2 right-4 text-amber-300 text-4xl font-bold">{step}</div>
            )}
            <div className="px-6 pt-[32px]">
              <h4 className="text-2xl font-bold text-amber-900 leading-[32px] mb-0">{title}</h4>
              <ul className="text-amber-800 text-lg m-0 p-0">
                {ingredients.map((item, index) => (
                  <li key={index} className="flex gap-2 leading-[32px] list-none">
                    <span className="text-amber-600">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
