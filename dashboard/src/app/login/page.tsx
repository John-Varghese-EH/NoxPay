import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const supabase = createClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session) {
        return redirect('/dashboard')
    }

    const signIn = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return redirect('/login?message=Could not authenticate user')
        }

        return redirect('/dashboard')
    }

    const signUp = async (formData: FormData) => {
        'use server'

        const origin = headers().get('origin')
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = createClient()

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
            },
        })

        if (error) {
            return redirect('/login?message=Could not create user')
        }

        return redirect('/login?message=Check email to continue sign in process')
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-violet-400 tracking-tighter">NoxPay<span className="text-slate-500">.</span></h1>
                    <p className="text-sm text-slate-500 mt-2">Sign in to your merchant dashboard</p>
                </div>

                <label className="text-md font-medium" htmlFor="email">
                    Email
                </label>
                <input
                    className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 mb-4 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <label className="text-md font-medium" htmlFor="password">
                    Password
                </label>
                <input
                    className="rounded-md px-4 py-2.5 bg-slate-900 border border-slate-700 mb-6 focus:ring-violet-500 focus:border-violet-500 text-sm"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <button
                    formAction={signIn}
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-md px-4 py-2.5 mb-2 font-medium transition-colors shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                >
                    Sign In
                </button>
                <button
                    formAction={signUp}
                    className="border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-md px-4 py-2.5 mb-2 font-medium transition-colors"
                >
                    Sign Up
                </button>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-slate-800/50 border border-slate-700 text-slate-300 text-center text-sm rounded-md">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
