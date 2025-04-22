'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface NewFlashcardPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function NewFlashcardPage({ params }: NewFlashcardPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question_text: '',
    answer_text: '',
    image_url: '',
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const supabase = createClientComponentClient();

  // Use React.use() to unwrap the params promise
  const { slug } = use(params);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `flashcards/${fileName}`;

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      });

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('flashcards')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('flashcards')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, get the flashcard set ID using the slug
      const response = await fetch(`/api/flashcard-sets/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flashcard set');
      }
      const flashcardSet = await response.json();

      // Then create the flashcard
      const createResponse = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          flashcard_set_id: flashcardSet.id,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create flashcard');
      }

      router.push(`/admin/flashcards/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Flashcard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="question_text" className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="answer_text" className="block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              id="answer_text"
              value={formData.answer_text}
              onChange={(e) => setFormData({ ...formData, answer_text: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full"
            />
            {uploadingImage && (
              <div className="mt-2 text-sm text-gray-500">Uploading image...</div>
            )}
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    setError('Failed to load image preview');
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Order
            </label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <Link
              href={`/admin/flashcards/${slug}`}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 