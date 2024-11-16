import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// POST method to login
export async function POST(req: NextRequest) {
    try {
        // validate incoming request
        const isAuthorizedRequest = req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
        if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });

        const { email, password } = await req.json(); // read payload data from request

        if (!email || !password) return NextResponse.json({ success: false, error: 'Please provide valid credentials!' }, { status: 400 });

        // find user from db by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

        // verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

        // generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '15d' }
        );

        // Set JWT token in HTTP-only cookie
        const response = NextResponse.json({ success: true, message: 'Login successful', userId: user.id }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}