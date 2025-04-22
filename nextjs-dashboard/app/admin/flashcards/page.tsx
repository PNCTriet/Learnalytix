'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublic: boolean;
  flashcards: Flashcard[];
}

interface Flashcard {
  id: string;
  questionText: string;
  answerText: string | null;
  imageUrl: string | null;
  order: number;
}

export default function AdminFlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      const response = await fetch('/api/flashcard-sets');
      if (!response.ok) {
        throw new Error('Failed to fetch flashcard sets');
      }
      const data = await response.json();
      setFlashcardSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = () => {
    router.push('/admin/flashcards/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Flashcard Sets</h1>
        <button
          onClick={handleCreateSet}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create New Set
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <div
            key={set.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{set.title}</h2>
            <p className="text-gray-600 mb-4">{set.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {set.flashcards.length} cards
              </span>
              <Link
                href={`/admin/flashcards/${set.slug}`}
                className="text-blue-500 hover:text-blue-600"
              >
                Manage Cards
              </Link>
            </div>
          </div>
        ))}
      </div>

      {flashcardSets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No flashcard sets found.</p>
          <button
            onClick={handleCreateSet}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Your First Set
          </button>
        </div>
      )}
    </div>
  );
} 