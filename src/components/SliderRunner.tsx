import React, { useState, useEffect } from 'react';
import { Slide } from '@/types/editor';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderRunnerProps {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
  width?: string | number;
  height?: string | number;
  showDots?: boolean;
  showArrows?: boolean;
  onSlideChange?: (index: number) => void;
}

const SliderRunner = ({
  slides,
  autoPlay = true,
  interval = 5000,
  width = '100%',
  height = '600px',
  onSlideChange,
}: SliderRunnerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      goTo((currentIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length, currentIndex]);

  const nextSlide = () => goTo((currentIndex + 1) % slides.length);
  const prevSlide = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  if (!slides.length) return null;

  return (
    <div
      className="relative overflow-hidden bg-gray-100 group"
      style={{ width, height }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: slides[currentIndex].background,
            backgroundImage: slides[currentIndex].background.startsWith('http')
              ? `url(${slides[currentIndex].background})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {slides[currentIndex].elements.map((element) => (
            <motion.div
              key={element.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initial={element.animation?.initial as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              animate={element.animation?.animate as any}
              transition={element.animation?.transition}
              style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                ...element.style,
                ...(element.rotation ? { transform: `rotate(${element.rotation}deg)`, transformOrigin: 'center center' } : {}),
              }}
            >
              {element.type === 'text' && <p>{element.content}</p>}
              {element.type === 'image' && (
                <img
                  src={element.content}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {element.type === 'button' && (
                <button className="w-full h-full">{element.content}</button>
              )}
              {element.type === 'box' && <div className="w-full h-full" />}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SliderRunner;