import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    console.log('Fetching flashcard set for slug:', params.slug);

    const { data: flashcardSet, error } = await supabase
      .from('flashcard_sets')
      .select(`
        *,
        flashcards (
          *
        )
      `)
      .eq('slug', params.slug)
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!flashcardSet) {
      console.log('No flashcard set found for slug:', params.slug);
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    console.log('Found flashcard set:', flashcardSet);
    return NextResponse.json(flashcardSet);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, is_public } = await request.json();

    const { data: flashcardSet, error } = await supabase
      .from('flashcard_sets')
      .update({
        title,
        description,
        is_public,
      })
      .eq('slug', params.slug)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(flashcardSet);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('flashcard_sets')
      .delete()
      .eq('slug', params.slug)
      .eq('user_id', session.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 