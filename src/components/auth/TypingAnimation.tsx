import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  previewTheme?: 'light' | 'dark';
}

export const TypingAnimation = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  previewTheme = 'dark',
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
    <div className="relative max-w-3xl">
      {/* Wallpaper background with curtain/blind pattern */}
      <div className={`absolute inset-0 -m-6 backdrop-blur-sm rounded-2xl border overflow-hidden ${
        previewTheme === 'dark'
          ? 'bg-white/5 border-white/10'
          : 'bg-primary/5 border-primary/10'
      }`}>
        {/* Decorative curtain pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent" />
          <div className="absolute top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent" />
          {/* Vertical curtain lines */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-current via-transparent to-transparent"
              style={{ left: `${(i + 1) * 12}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Typing text */}
      <div className={`relative z-10 font-semibold text-2xl md:text-3xl lg:text-4xl min-h-[80px] flex items-center px-4 ${
        previewTheme === 'dark' ? 'text-white' : 'text-primary'
      }`}>
        <span className="drop-shadow-lg">{currentText}</span>
        <span className="animate-typing-cursor ml-1 drop-shadow-lg">|</span>
      </div>
    </div>
  );
};
