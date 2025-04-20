import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FlashCard } from '../types/flashcard'

const supabase = createClientComponentClient()

export const flashcardService = {
    // Get all flash cards for the current user
    async getFlashCards() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as FlashCard[]
    },

    // Create a new flash card
    async createFlashCard(flashcard: Omit<FlashCard, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'last_reviewed' | 'next_review'>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('flashcards')
            .insert([
                {
                    ...flashcard,
                    user_id: user.id,
                    last_reviewed: null,
                    next_review: null
                }
            ])
            .select()
            .single()

        if (error) throw error
        return data as FlashCard
    },

    // Update a flash card
    async updateFlashCard(id: string, updates: Partial<FlashCard>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('flashcards')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error
        return data as FlashCard
    },

    // Delete a flash card
    async deleteFlashCard(id: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('flashcards')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw error
    },

    // Get flash cards due for review
    async getDueFlashCards() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('user_id', user.id)
            .lte('next_review', new Date().toISOString())
            .order('next_review', { ascending: true })

        if (error) throw error
        return data as FlashCard[]
    },

    // Update review status
    async updateReviewStatus(id: string, difficulty: 'easy' | 'medium' | 'hard') {
        const now = new Date()
        const nextReview = new Date(now)

        // Spaced repetition algorithm
        switch (difficulty) {
            case 'easy':
                nextReview.setDate(now.getDate() + 7) // Review in 7 days
                break
            case 'medium':
                nextReview.setDate(now.getDate() + 3) // Review in 3 days
                break
            case 'hard':
                nextReview.setDate(now.getDate() + 1) // Review tomorrow
                break
        }

        return this.updateFlashCard(id, {
            last_reviewed: now.toISOString(),
            next_review: nextReview.toISOString(),
            difficulty
        })
    }
} 