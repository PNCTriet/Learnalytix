'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import Link from 'next/link'

export default function SignUpPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) {
                setErrorMsg(error.message)
            } else {
                router.push('/login')
                router.refresh()
            }
        } catch (error) {
            setErrorMsg('An error occurred during sign up')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Sign Up</h2>

                <form onSubmit={handleSignUp}>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
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
                        Sign Up
                    </button>

                    {errorMsg && (
                        <p className="text-red-500 text-center mt-4">{errorMsg}</p>
                    )}

                    <p className="text-center mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-500 hover:text-blue-400">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
