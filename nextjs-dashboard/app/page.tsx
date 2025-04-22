'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import Link from 'next/link';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  slug: string;
  is_public: boolean;
  flashcards: {
    id: string;
    question: string;
    answer: string;
    image_url: string | null;
  }[];
}

export default function Home() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchFlashcardSets() {
      try {
        const response = await fetch('/api/flashcard-sets');
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }
        const data = await response.json();
        setFlashcardSets(data);
      } catch (err) {
        console.error('Error fetching flashcard sets:', err);
        setError('Failed to load flashcard sets');
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcardSets();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to LearnAlytix</h1>
          <p className="text-xl text-gray-600 mb-12">Choose a flashcard set to start learning</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set) => (
            <Link 
              key={set.id} 
              href={`/flashcards/${set.slug}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {set.flashcards[0]?.image_url && (
                  <div className="relative h-48">
                    <img
                      src={set.flashcards[0].image_url}
                      alt={set.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{set.title}</h2>
                  <p className="text-gray-600 mb-4">{set.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{set.flashcards.length} cards</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {flashcardSets.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600">No flashcard sets available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
