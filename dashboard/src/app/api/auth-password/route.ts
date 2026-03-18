import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { password } = await request.json()
        const correctPassword = process.env.AUTH_PASSWORD

        if (password === correctPassword) {
            const cookieStore = await cookies();
            cookieStore.set('noxpay-global-auth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
