import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

interface CardData {
  id: string;
  name: string;
  age: number;
  location: string;
  level: number;
  isVerified: boolean;
  topics: string[];
  backgroundColor: string;
  status?: 'available' | 'unavailable';
}

interface SwipeableCardProps {
  card: CardData;
  onSwipe: (direction: 'left' | 'right', card: CardData) => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ card, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [transform, setTransform] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    setCurrentX(deltaX);
    setTransform(deltaX);
    setOpacity(1 - Math.abs(deltaX) / 300);
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(currentX) > threshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      setTransform(currentX > 0 ? 300 : -300);
      setOpacity(0);
      
      setTimeout(() => {
        onSwipe(direction, card);
        resetCard();
      }, 200);
    } else {
      resetCard();
    }
  };

  const resetCard = () => {
    setTransform(0);
    setOpacity(1);
    setCurrentX(0);
  };

  const handleButtonClick = (action: 'reject' | 'unavailable' | 'accept') => {
    if (action === 'reject') {
      setTransform(-300);
      setOpacity(0);
      setTimeout(() => {
        onSwipe('left', card);
        resetCard();
      }, 200);
    } else if (action === 'accept') {
      setTransform(300);
      setOpacity(0);
      setTimeout(() => {
        onSwipe('right', card);
        resetCard();
      }, 200);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) handleEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        ref={cardRef}
        className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab transition-transform duration-200 ${
          isDragging ? 'cursor-grabbing scale-105' : ''
        }`}
        style={{
          transform: `translateX(${transform}px) rotate(${transform * 0.1}deg)`,
          opacity: opacity,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card Header */}
        <div 
          className="h-64 relative flex items-end p-6"
          style={{ backgroundColor: card.backgroundColor }}
        >
          <div className="absolute top-4 left-4 flex space-x-2">
            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              Level {card.level}
            </span>
            {card.isVerified && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Verified</span>
              </span>
            )}
          </div>
          
          <h2 className="text-6xl font-bold text-gray-800 leading-none">
            {card.name}
          </h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {card.name}, {card.age}
              </h3>
              <p className="text-gray-600">{card.location}</p>
            </div>
            
            <button className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-600 transition-colors">
              ✨ Suggest Icebreaker
            </button>
          </div>

          {/* Topics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Topics to Discuss</h4>
            <div className="flex flex-wrap gap-2">
              {card.topics.map((topic, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleButtonClick('reject')}
              className="w-12 h-12 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                card.status === 'unavailable'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              disabled={card.status === 'unavailable'}
            >
              {card.status === 'unavailable' ? 'Unavailable' : 'Available'}
            </button>
            
            <button
              onClick={() => handleButtonClick('accept')}
              className="w-12 h-12 bg-gray-100 hover:bg-green-100 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipe Indicators */}
      {isDragging && (
        <>
          <div
            className={`absolute top-1/2 left-4 transform -translate-y-1/2 text-red-500 font-bold text-2xl transition-opacity ${
              currentX < -50 ? 'opacity-100' : 'opacity-30'
            }`}
          >
            NOPE
          </div>
          <div
            className={`absolute top-1/2 right-4 transform -translate-y-1/2 text-green-500 font-bold text-2xl transition-opacity ${
              currentX > 50 ? 'opacity-100' : 'opacity-30'
            }`}
          >
            LIKE
          </div>
        </>
      )}
    </div>
  );
};

export default SwipeableCard;