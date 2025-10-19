'use client';
import React, { useEffect, useState, useMemo } from 'react';
import AimList from '../../components/AimList';

// Animated rotating cube/diamond component
const AnimatedCube = React.memo(({ 
  delay, 
  duration, 
  left, 
  top, 
  size, 
  color 
}: { 
  delay: number; 
  duration: number; 
  left: number; 
  top: number; 
  size: number;
  color: string;
}) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animation: `float-rotate ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="rounded-lg backdrop-blur-sm"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          transform: 'rotate(45deg)',
          opacity: 0.6,
          boxShadow: `0 0 ${size/2}px ${color}`,
        }}
      />
    </div>
  );
});

AnimatedCube.displayName = 'AnimatedCube';

// Floating dot component
const FloatingDot = React.memo(({ 
  delay, 
  duration, 
  left, 
  top, 
  size,
  color
}: { 
  delay: number; 
  duration: number; 
  left: number; 
  top: number; 
  size: number;
  color: string;
}) => {
  return (
    <div
      className="absolute rounded-full opacity-50 blur-sm pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        animation: `float-gentle ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        boxShadow: `0 0 ${size}px ${color}`,
      }}
    />
  );
});

FloatingDot.displayName = 'FloatingDot';

export default function AimsPage() {
  const [cubes, setCubes] = useState<Array<{ 
    id: number; 
    delay: number; 
    duration: number; 
    left: number; 
    top: number; 
    size: number;
    color: string;
  }>>([]);
  
  const [dots, setDots] = useState<Array<{ 
    id: number; 
    delay: number; 
    duration: number; 
    left: number; 
    top: number; 
    size: number;
    color: string;
  }>>([]);

  const [isMobile, setIsMobile] = useState(false);

  // Your DNA colors - memoized to prevent re-creation
  const dnaColors = useMemo(() => ['#2D9A86', '#EEFE6D', '#B8E6DC', '#1A5F52', '#FFF59D'], []);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Reduce number of animations on mobile for performance
    const cubeCount = isMobile ? 4 : 8;
    const dotCount = isMobile ? 6 : 12;

    // Generate animated cubes/diamonds
    const newCubes = Array.from({ length: cubeCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      duration: Math.random() * 8 + 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: isMobile ? Math.random() * 20 + 25 : Math.random() * 30 + 40,
      color: dnaColors[Math.floor(Math.random() * dnaColors.length)],
    }));
    setCubes(newCubes);

    // Generate floating dots
    const newDots = Array.from({ length: dotCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      duration: Math.random() * 6 + 8,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: isMobile ? Math.random() * 6 + 8 : Math.random() * 8 + 12,
      color: dnaColors[Math.floor(Math.random() * dnaColors.length)],
    }));
    setDots(newDots);
  }, [dnaColors, isMobile]);

  return (
    <div className="relative min-h-screen flex justify-center items-start md:items-center overflow-hidden bg-gradient-to-br from-[#B8E6DC] via-[#2D9A86] to-[#1A5F52] p-2 sm:p-4 md:p-6 py-4 sm:py-6 md:py-4">
      {/* Animated background: Persian Solar Day */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_20%,#EEFE6D_0%,transparent_70%)] opacity-70"
          style={{ animation: 'solar-glow 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-[60%] bg-[#2D9A86] rounded-t-[50%] blur-[40px] md:blur-[60px] opacity-60"
          style={{ animation: 'wave-slow 12s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-[30%] bg-[#EEFE6D] rounded-t-[45%] blur-[50px] md:blur-[80px] opacity-40"
          style={{ animation: 'wave-fast 8s ease-in-out infinite' }}
        />
      </div>

      {/* Animated Cubes/Diamonds */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {cubes.map((cube) => (
          <AnimatedCube key={cube.id} {...cube} />
        ))}
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {dots.map((dot) => (
          <FloatingDot key={dot.id} {...dot} />
        ))}
      </div>

      {/* Main Content Container */}
      <div
        className="max-w-5xl w-full rounded-2xl sm:rounded-3xl shadow-xl md:shadow-2xl backdrop-blur-xl border border-white/40 p-4 sm:p-6 md:p-8 transition-all duration-700 md:hover:scale-[1.01] hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] z-10 my-4 sm:my-6 md:my-0"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        <AimList />
      </div>

      {/* Enhanced floating particles - Fewer on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-8 h-8 bg-gradient-to-br from-[#EEFE6D] to-[#FFF59D] rounded-full top-[15%] left-[20%] blur-[12px] opacity-70"
            style={{ animation: 'float-gentle 15s ease-in-out infinite' }}
          />
          <div 
            className="absolute w-10 h-10 bg-gradient-to-br from-[#2D9A86] to-[#4DB6AC] rounded-full top-[40%] left-[70%] blur-[14px] opacity-60"
            style={{ animation: 'float-gentle 10s ease-in-out infinite', animationDelay: '0.5s' }}
          />
          <div 
            className="absolute w-7 h-7 bg-gradient-to-br from-[#EEFE6D] to-white rounded-full top-[60%] left-[50%] blur-[16px] opacity-50"
            style={{ animation: 'float-gentle 7s ease-in-out infinite', animationDelay: '1s' }}
          />
          <div 
            className="absolute w-6 h-6 bg-[#B8E6DC] rounded-full top-[80%] left-[30%] blur-[10px] opacity-60"
            style={{ animation: 'float-gentle 15s ease-in-out infinite', animationDelay: '1.5s' }}
          />
          <div 
            className="absolute w-9 h-9 bg-gradient-to-br from-white to-[#B8E6DC] rounded-full top-[25%] left-[85%] blur-[15px] opacity-50"
            style={{ animation: 'float-gentle 10s ease-in-out infinite', animationDelay: '2s' }}
          />
        </div>
      )}

      {/* Mobile-only simplified particles */}
      {isMobile && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-6 h-6 bg-gradient-to-br from-[#EEFE6D] to-[#FFF59D] rounded-full top-[20%] left-[15%] blur-[8px] opacity-60"
            style={{ animation: 'float-gentle 12s ease-in-out infinite' }}
          />
          <div 
            className="absolute w-7 h-7 bg-gradient-to-br from-[#2D9A86] to-[#4DB6AC] rounded-full top-[70%] left-[75%] blur-[10px] opacity-50"
            style={{ animation: 'float-gentle 10s ease-in-out infinite', animationDelay: '1s' }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes float-rotate {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(15px, -20px) rotate(90deg) scale(1.05);
          }
          50% {
            transform: translate(-10px, 15px) rotate(180deg) scale(0.95);
          }
          75% {
            transform: translate(20px, 10px) rotate(270deg) scale(1.02);
          }
        }

        @media (min-width: 768px) {
          @keyframes float-rotate {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              transform: translate(30px, -40px) rotate(90deg) scale(1.1);
            }
            50% {
              transform: translate(-20px, 30px) rotate(180deg) scale(0.9);
            }
            75% {
              transform: translate(40px, 20px) rotate(270deg) scale(1.05);
            }
          }
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(15px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.95);
          }
        }

        @media (min-width: 768px) {
          @keyframes float-gentle {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(20px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
        }

        @keyframes solar-glow {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        @keyframes wave-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.02);
          }
        }

        @keyframes wave-fast {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        /* Reduce animation intensity on mobile for better performance */
        @media (max-width: 767px) {
          @keyframes wave-slow {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-10px) scale(1.01);
            }
          }

          @keyframes wave-fast {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-15px) scale(1.02);
            }
          }
        }
      `}</style>
    </div>
  );
}