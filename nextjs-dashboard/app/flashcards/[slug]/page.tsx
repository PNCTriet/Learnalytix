'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  image_url: string | null;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  flashcards: Flashcard[];
}

export default function FlashcardSetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchFlashcardSet() {
      try {
        const response = await fetch(`/api/flashcard-sets/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard set');
        }
        const data = await response.json();
        setFlashcardSet(data);
      } catch (err) {
        console.error('Error fetching flashcard set:', err);
        setError('Failed to load flashcard set');
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcardSet();
  }, [slug]);

  const handleNext = () => {
    if (flashcardSet && currentIndex < flashcardSet.flashcards.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Flashcard set not found</div>
      </div>
    );
  }

  const currentCard = flashcardSet.flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{flashcardSet.title}</h1>
          <p className="text-gray-600">{flashcardSet.description}</p>
        </div>

        <div className="relative h-[500px] mb-8">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ 
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
                rotateY: direction > 0 ? 90 : -90
              }}
              animate={{ 
                x: 0,
                opacity: 1,
                rotateY: 0
              }}
              exit={{ 
                x: direction > 0 ? -1000 : 1000,
                opacity: 0,
                rotateY: direction > 0 ? -90 : 90
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.5 }
              }}
              className="absolute w-full h-full"
            >
              <div className="bg-white rounded-lg shadow-lg p-8 h-full flex flex-col justify-center items-center">
                {currentCard.image_url && (
                  <div className="mb-4 w-full h-48 flex items-center justify-center overflow-hidden">
                    <img
                      src={currentCard.image_url}
                      alt="Flashcard"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Question</h2>
                <p className="text-xl text-gray-700 text-center">{currentCard.question}</p>
                <div className="mt-4">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Answer</h2>
                  <p className="text-xl text-gray-700 text-center">{currentCard.answer}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Previous
          </button>
          <div className="text-gray-600">
            Card {currentIndex + 1} of {flashcardSet.flashcards.length}
          </div>
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcardSet.flashcards.length - 1}
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50"
          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
} 