'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database } from '@/types/supabase';

type FlashcardSet = Database['public']['Tables']['flashcard_sets']['Row'] & {
  flashcards: Database['public']['Tables']['flashcards']['Row'][];
};

interface FlashcardSetPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function FlashcardSetPage({ params }: FlashcardSetPageProps) {
  const router = useRouter();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { slug } = use(params);

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const response = await fetch(`/api/flashcard-sets/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setFlashcardSet(null);
            setError('Flashcard set not found');
          } else {
            throw new Error('Failed to fetch flashcard set');
          }
        } else {
          const data = await response.json();
          setFlashcardSet(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [slug]);

  const handleCreateSet = async () => {
    try {
      const response = await fetch('/api/flashcard-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: slug,
          description: 'New flashcard set',
          is_public: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create flashcard set');
      }

      const data = await response.json();
      setFlashcardSet(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      // Refresh the flashcard set
      const setResponse = await fetch(`/api/flashcard-sets/${slug}`);
      if (setResponse.ok) {
        const data = await setResponse.json();
        setFlashcardSet(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!flashcardSet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Flashcard Set Not Found</h1>
          <p className="text-gray-600 mb-6">
            The flashcard set "{slug}" does not exist. Would you like to create it?
          </p>
          <button
            onClick={handleCreateSet}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Create New Set
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/admin/flashcards')}
            className="text-blue-500 hover:text-blue-600"
          >
            Back to Flashcard Sets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
          <p className="text-gray-600">{flashcardSet.description}</p>
        </div>
        <div className="space-x-4">
          <Link
            href={`/admin/flashcards/${slug}/edit`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Edit Set
          </Link>
          <button
            onClick={() => router.push(`/admin/flashcards/${slug}/new`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Card
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSet.flashcards?.map((flashcard) => (
          <div
            key={flashcard.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Question:</h3>
              <p className="text-gray-700">{flashcard.question_text}</p>
            </div>
            {flashcard.answer_text && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Answer:</h3>
                <p className="text-gray-700">{flashcard.answer_text}</p>
              </div>
            )}
            {flashcard.image_url && (
              <div className="mb-4">
                <img
                  src={flashcard.image_url}
                  alt="Flashcard image"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Link
                href={`/admin/flashcards/${slug}/${flashcard.id}`}
                className="text-blue-500 hover:text-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteFlashcard(flashcard.id)}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {flashcardSet.flashcards?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No flashcards in this set yet.</p>
          <button
            onClick={() => router.push(`/admin/flashcards/${slug}/new`)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
} 