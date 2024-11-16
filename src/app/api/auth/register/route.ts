import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {

        // validate incoming request
        const isAuthorizedRequest = req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
        if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });

        const { username, email, password } = await req.json(); // extract data from body

        // check if user already exists - match with both username or email since both are unique properties
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        return NextResponse.json({ success: true, message: 'User created successfully', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}