'use client';

import { useEffect, useState } from 'react';
import { FlashCard } from '../types/flashcard';
import { flashcardService } from '../services/flashcardService';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function FlashCardsPage() {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFlashCards();
    }, []);

    const loadFlashCards = async () => {
        try {
            const data = await flashcardService.getFlashCards();
            setCards(data);
        } catch (err) {
            setError('Failed to load flash cards');
            console.error(err);
        } finally {
            setLoading(false);
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Flash Cards</h1>
                <Link
                    href="/flashcards/new"
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    New Card
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.id}
                        href={`/flashcards/${card.id}`}
                        className="block"
                    >
                        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {card.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {card.difficulty}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                                {card.front}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Last reviewed: {card.last_reviewed ? new Date(card.last_reviewed).toLocaleDateString() : 'Never'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {cards.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No flash cards yet</p>
                    <Link
                        href="/flashcards/new"
                        className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create your first card
                    </Link>
                </div>
            )}
        </div>
    );
} 