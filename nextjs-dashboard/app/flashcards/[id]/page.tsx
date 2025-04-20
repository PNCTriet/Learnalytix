'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlashCard } from '../../types/flashcard';
import { flashcardService } from '../../services/flashcardService';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

export default function FlashCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [card, setCard] = useState<FlashCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFlashCard();
    }, [id]);

    const loadFlashCard = async () => {
        try {
            const cards = await flashcardService.getFlashCards();
            const foundCard = cards.find(c => c.id === id);
            if (!foundCard) {
                setError('Flash card not found');
                return;
            }
            setCard(foundCard);
        } catch (err) {
            setError('Failed to load flash card');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
        try {
            await flashcardService.updateReviewStatus(id, difficulty);
            router.push('/flashcards');
            router.refresh();
        } catch (err) {
            setError('Failed to update review status');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !card) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 mb-4">{error || 'Flash card not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back
                    </button>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {card.difficulty}
                    </span>
                </div>

                <div className="relative">
                    <div
                        className={`bg-white rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-center items-center cursor-pointer transition-transform duration-500 ${
                            isFlipped ? 'rotate-y-180' : ''
                        }`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="text-center">
                            <span className="text-sm text-gray-500 mb-2 block">
                                {card.category}
                            </span>
                            <h2 className="text-2xl font-semibold mb-4">
                                {isFlipped ? card.back : card.front}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Click to {isFlipped ? 'see question' : 'see answer'}
                            </p>
                        </div>
                    </div>

                    {isFlipped && (
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleDifficulty('easy')}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Easy
                            </button>
                            <button
                                onClick={() => handleDifficulty('medium')}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Medium
                            </button>
                            <button
                                onClick={() => handleDifficulty('hard')}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Hard
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Last reviewed: {card.last_reviewed ? new Date(card.last_reviewed).toLocaleDateString() : 'Never'}</p>
                    <p>Next review: {card.next_review ? new Date(card.next_review).toLocaleDateString() : 'Not scheduled'}</p>
                </div>
            </div>
        </div>
    );
} 