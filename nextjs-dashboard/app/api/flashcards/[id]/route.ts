import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching flashcard with ID:', params.id);

    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .select(`
        *,
        flashcard_sets (
          user_id
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!flashcard) {
      console.log('No flashcard found with ID:', params.id);
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Check if the user owns the flashcard set
    if (flashcard.flashcard_sets.user_id !== session.user.id) {
      console.log('User does not own this flashcard');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Found flashcard:', flashcard);
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question_text, answer_text, image_url, order } = await request.json();

    // Verify that the user owns the flashcard
    const { data: flashcard, error: checkError } = await supabase
      .from('flashcards')
      .select('flashcard_set_id')
      .eq('id', params.id)
      .single();

    if (checkError || !flashcard) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { data: updatedFlashcard, error } = await supabase
      .from('flashcards')
      .update({
        question_text,
        answer_text,
        image_url,
        order,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify that the user owns the flashcard
    const { data: flashcard, error: checkError } = await supabase
      .from('flashcards')
      .select('flashcard_set_id')
      .eq('id', params.id)
      .single();

    if (checkError || !flashcard) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 