export interface FlashCard {
    id: string;
    front: string;
    back: string;
    category: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    last_reviewed: string | null;
    next_review: string | null;
} 