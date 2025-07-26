import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import SwipeableCard from '../components/SwipeableCard';

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

const Home: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: '1',
      name: 'Sofia',
      age: 22,
      location: 'Brazil',
      level: 23,
      isVerified: true,
      topics: ['Carnival History', 'Modern Art Movements'],
      backgroundColor: '#86efac',
      status: 'unavailable'
    },
    {
      id: '2',
      name: 'Marcus',
      age: 28,
      location: 'Germany',
      level: 15,
      isVerified: true,
      topics: ['Tech Innovation', 'Sustainable Living'],
      backgroundColor: '#93c5fd',
      status: 'available'
    },
    {
      id: '3',
      name: 'Yuki',
      age: 25,
      location: 'Japan',
      level: 31,
      isVerified: false,
      topics: ['Anime Culture', 'Japanese Cuisine'],
      backgroundColor: '#fbbf24',
      status: 'available'
    },
    {
      id: '4',
      name: 'Emma',
      age: 24,
      location: 'Canada',
      level: 18,
      isVerified: true,
      topics: ['Climate Science', 'Outdoor Adventures'],
      backgroundColor: '#f472b6',
      status: 'available'
    },
    {
      id: '5',
      name: 'Diego',
      age: 30,
      location: 'Mexico',
      level: 42,
      isVerified: true,
      topics: ['Latin Music', 'Photography'],
      backgroundColor: '#a78bfa',
      status: 'available'
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right', card: CardData) => {
    console.log(`Swiped ${direction} on ${card.name}`);
    
    // Move to next card
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= cards.length ? 0 : nextIndex;
    });
  };

  const currentCard = cards[currentCardIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No more cards to show!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Explore</h1>
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </button>
        </div>

        {/* Card Stack */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Background cards for stack effect */}
            {cards.slice(currentCardIndex + 1, currentCardIndex + 3).map((card, index) => (
              <div
                key={card.id}
                className="absolute top-2 left-2 w-full max-w-sm bg-white rounded-2xl shadow-md"
                style={{
                  transform: `scale(${0.95 - index * 0.05}) translateY(${index * 4}px)`,
                  zIndex: -index - 1,
                  opacity: 0.7 - index * 0.2
                }}
              >
                <div className="h-64 bg-gray-200 rounded-t-2xl" />
                <div className="p-6 h-32" />
              </div>
            ))}
            
            {/* Current card */}
            <SwipeableCard
              key={currentCard.id}
              card={currentCard}
              onSwipe={handleSwipe}
            />
          </div>
        </div>

        {/* Card Counter */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            {currentCardIndex + 1} of {cards.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;