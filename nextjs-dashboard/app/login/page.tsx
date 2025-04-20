'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Login() {
    const supabase = createClientComponentClient()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [copySuccess, setCopySuccess] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('') // Clear any previous error messages

        // Validate email format
        if (!email || !email.includes('@')) {
            setErrorMsg('Please enter a valid email address')
            return
        }

        // Validate password
        if (!password || password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long')
            return
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            
            if (error) {
                // Handle specific error cases
                switch (error.message) {
                    case 'Invalid login credentials':
                        setErrorMsg('Email or password is incorrect')
                        break
                    case 'Email not confirmed':
                        setErrorMsg('Please confirm your email address first')
                        break
                    case 'Too many requests':
                        setErrorMsg('Too many login attempts. Please try again later')
                        break
                    default:
                        setErrorMsg(error.message)
                }
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error) {
            console.error('Login error:', error)
            setErrorMsg('An unexpected error occurred. Please try again later')
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy!');
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="mb-4 relative">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                            title="Copy email"
                        >
                            <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        {copySuccess && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-500">
                                {copySuccess}
                            </span>
                        )}
                    </div>

                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        Login
                    </button>

                    {errorMsg && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-500 text-center">{errorMsg}</p>
                        </div>
                    )}

                    <p className="text-center mt-4">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-500 hover:text-blue-400">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
} 