import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { flashcard_set_id, question_text, answer_text, image_url, order } = body;

    if (!flashcard_set_id) {
      console.log('Missing flashcard_set_id');
      return NextResponse.json({ error: 'Missing flashcard_set_id' }, { status: 400 });
    }

    // Verify that the user owns the flashcard set
    const { data: flashcardSet, error: setError } = await supabase
      .from('flashcard_sets')
      .select()
      .eq('id', flashcard_set_id)
      .eq('user_id', session.user.id)
      .single();

    if (setError) {
      console.error('Error checking flashcard set:', setError);
      return NextResponse.json({ error: 'Error checking flashcard set' }, { status: 500 });
    }

    if (!flashcardSet) {
      console.log('Flashcard set not found or not owned by user');
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { data: flashcard, error } = await supabase
      .from('flashcards')
      .insert({
        question_text,
        answer_text,
        image_url,
        order,
        flashcard_set_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }

    console.log('Successfully created flashcard:', flashcard);
    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, question_text, answer_text, image_url, order } = await request.json();

    // Verify that the user owns the flashcard
    const { data: flashcard, error: checkError } = await supabase
      .from('flashcards')
      .select('flashcard_set_id')
      .eq('id', id)
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
      .eq('id', id)
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

export async function DELETE(request: Request) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    // Verify that the user owns the flashcard
    const { data: flashcard, error: checkError } = await supabase
      .from('flashcards')
      .select('flashcard_set_id')
      .eq('id', id)
      .single();

    if (checkError || !flashcard) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 