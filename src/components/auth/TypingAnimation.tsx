import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export const TypingAnimation = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypingAnimationProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && currentText === currentPhrase) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setCurrentText((prev) => {
          if (isDeleting) {
            return currentPhrase.substring(0, prev.length - 1);
          } else {
            return currentPhrase.substring(0, prev.length + 1);
          }
        });
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className="relative">
      {/* Wallpaper background */}
      <div className="absolute inset-0 -m-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10" />
      
      {/* Typing text */}
      <div className="relative z-10 font-semibold text-3xl md:text-4xl lg:text-5xl min-h-[120px] flex items-center px-4">
        <span className="text-white drop-shadow-lg">{currentText}</span>
        <span className="animate-typing-cursor ml-1 text-white drop-shadow-lg">|</span>
      </div>
    </div>
  );
};
