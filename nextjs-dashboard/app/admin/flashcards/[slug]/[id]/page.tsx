'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Flashcard {
  id: string;
  question_text: string;
  answer_text: string;
  image_url: string;
  order: number;
}

interface FlashcardPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default function EditFlashcardPage({ params }: FlashcardPageProps) {
  const router = useRouter();
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    answer_text: '',
    image_url: '',
    order: 0,
  });
  const supabase = createClientComponentClient();

  // Use React.use() to unwrap the params promise
  const { slug, id } = use(params);

  useEffect(() => {
    const fetchFlashcard = async () => {
      try {
        const response = await fetch(`/api/flashcards/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard');
        }
        const data = await response.json();
        setFlashcard(data);
        setFormData({
          question_text: data.question_text,
          answer_text: data.answer_text,
          image_url: data.image_url,
          order: data.order,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcard();
  }, [id]);

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

      // Get the public URL directly instead of signed URL
      const { data: { publicUrl } } = supabase.storage
        .from('flashcards')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Verify the file exists by trying to get its metadata
      const { data: fileData, error: fileError } = await supabase.storage
        .from('flashcards')
        .download(filePath);

      if (fileError) {
        console.error('File verification error:', fileError);
        throw new Error('File upload verification failed');
      }

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
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      router.push(`/admin/flashcards/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      router.push(`/admin/flashcards/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href={`/admin/flashcards/${slug}`} className="text-blue-500 hover:text-blue-600">
            Back to Flashcard Set
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Flashcard</h1>
        
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
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete Flashcard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 