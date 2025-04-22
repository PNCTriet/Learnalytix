import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });

    const { data: flashcardSets, error } = await supabase
      .from('flashcard_sets')
      .select(`
        *,
        flashcards (
          *
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcard sets:', error);
      throw error;
    }

    return NextResponse.json(flashcardSets);
  } catch (error) {
    console.error('Error in GET /api/flashcard-sets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, description, isPublic } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    console.log('Creating flashcard set with data:', {
      title,
      description,
      slug,
      is_public: isPublic,
      user_id: session.user.id
    });

    const { data: flashcardSet, error } = await supabase
      .from('flashcard_sets')
      .insert({
        title,
        description,
        slug,
        is_public: isPublic,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flashcard set:', error);
      return NextResponse.json({ 
        error: 'Failed to create flashcard set',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Error in POST /api/flashcard-sets:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 