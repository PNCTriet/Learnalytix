-- Drop existing tables and functions
drop table if exists public.multiple_choice_options cascade;
drop table if exists public.flashcards cascade;
drop table if exists public.flashcard_sets cascade;
drop function if exists public.handle_updated_at() cascade;
drop type if exists public.question_type cascade;
drop type if exists public.difficulty_level cascade;
drop type if exists public.study_mode cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types for flashcard system
CREATE TYPE question_type AS ENUM ('multiple_choice', 'open_ended', 'fill_in_blank');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE study_mode AS ENUM ('learn', 'review', 'practice');

-- Create flashcard_sets table
create table if not exists public.flashcard_sets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  slug text not null unique,
  user_id uuid references auth.users(id) on delete cascade not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create flashcards table
create table if not exists public.flashcards (
  id uuid default uuid_generate_v4() primary key,
  question_text text not null,
  answer_text text,
  image_url text,
  "order" integer not null,
  flashcard_set_id uuid references flashcard_sets(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.flashcard_sets enable row level security;
alter table public.flashcards enable row level security;

-- Create policies for flashcard_sets
create policy "Users can view their own flashcard sets"
  on public.flashcard_sets for select
  using (auth.uid() = user_id);

create policy "Users can view public flashcard sets"
  on public.flashcard_sets for select
  using (is_public = true);

create policy "Users can create their own flashcard sets"
  on public.flashcard_sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcard sets"
  on public.flashcard_sets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own flashcard sets"
  on public.flashcard_sets for delete
  using (auth.uid() = user_id);

-- Create policies for flashcards
create policy "Users can view flashcards from their sets"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcards.flashcard_set_id
      and flashcard_sets.user_id = auth.uid()
    )
  );

create policy "Users can view flashcards from public sets"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcards.flashcard_set_id
      and flashcard_sets.is_public = true
    )
  );

create policy "Users can create flashcards in their sets"
  on public.flashcards for insert
  with check (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcard_set_id
      and flashcard_sets.user_id = auth.uid()
    )
  );

create policy "Users can update flashcards in their sets"
  on public.flashcards for update
  using (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcard_set_id
      and flashcard_sets.user_id = auth.uid()
    )
  );

create policy "Users can delete flashcards from their sets"
  on public.flashcards for delete
  using (
    exists (
      select 1 from public.flashcard_sets
      where flashcard_sets.id = flashcard_set_id
      and flashcard_sets.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_flashcard_sets_updated_at
  before update on public.flashcard_sets
  for each row
  execute function public.handle_updated_at();

create trigger handle_flashcards_updated_at
  before update on public.flashcards
  for each row
  execute function public.handle_updated_at();

-- Create multiple choice options table
CREATE TABLE multiple_choice_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE multiple_choice_options ENABLE ROW LEVEL SECURITY;

-- Create policies for multiple choice options
CREATE POLICY "Users can view their own multiple choice options"
ON multiple_choice_options FOR SELECT
USING (EXISTS (
    SELECT 1 FROM flashcards
    WHERE flashcards.id = multiple_choice_options.flashcard_id
    AND flashcards.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own multiple choice options"
ON multiple_choice_options FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM flashcards
    WHERE flashcards.id = multiple_choice_options.flashcard_id
    AND flashcards.user_id = auth.uid()
));

CREATE POLICY "Users can update their own multiple choice options"
ON multiple_choice_options FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM flashcards
    WHERE flashcards.id = multiple_choice_options.flashcard_id
    AND flashcards.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own multiple choice options"
ON multiple_choice_options FOR DELETE
USING (EXISTS (
    SELECT 1 FROM flashcards
    WHERE flashcards.id = multiple_choice_options.flashcard_id
    AND flashcards.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_flashcard_sets_user_id on public.flashcard_sets(user_id);
CREATE INDEX idx_flashcards_set_id on public.flashcards(flashcard_set_id);
CREATE INDEX idx_flashcards_order on public.flashcards("order");

-- Add comment to tables and columns
COMMENT ON TABLE flashcards IS 'Stores flashcard information including questions, answers, and review status';
COMMENT ON TABLE multiple_choice_options IS 'Stores options for multiple choice questions';
COMMENT ON COLUMN flashcards.time_limit IS 'Time limit in seconds for answering the question';
COMMENT ON COLUMN flashcards.study_mode IS 'Current study mode of the flashcard (learn, review, practice)';
COMMENT ON COLUMN flashcards.tags IS 'Array of tags for categorizing and filtering flashcards'; 