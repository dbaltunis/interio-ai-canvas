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
      {/* Wallpaper background */}
      <div className={`absolute inset-0 -m-6 backdrop-blur-sm rounded-2xl border ${
        previewTheme === 'dark'
          ? 'bg-white/5 border-white/10'
          : 'bg-primary/5 border-primary/10'
      }`} />
      
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
