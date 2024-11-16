import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { validEngines, validSegments } from '@/lib/utils'
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect(); // handle redis connection

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    // validate incoming request
    const isAuthorizedRequest = req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
    if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });
    
    try {
        // validate token
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        
        // extract userId from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        const userId = decoded.userId;

        const formData = await req.formData();

        // Extract car details
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const company = formData.get('company') as string
        const engine = formData.get('engine') as string
        const segment = formData.get('segment') as string
        const dealer = formData.get('dealer') as string

        if (!validEngines.includes(engine as never))
            return NextResponse.json({ error: "Invalid engine type." }, { status: 400 });

        if (!validSegments.includes(segment as never))
            return NextResponse.json({ error: "Invalid car segment." }, { status: 400 });


        // Handle image uploads
        const imageUrls: string[] = []
        for (let i = 0; i < 10; i++) {
            const image = formData.get(`image-${i}`) as File | null
            if (image) {
                const bytes = await image.arrayBuffer()
                const buffer = Buffer.from(bytes)

                // Upload to Cloudinary
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'spyne-car' },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    ).end(buffer)
                })

                if (typeof result === 'object' && result && 'secure_url' in result && typeof result.secure_url === 'string') {
                    imageUrls.push(result.secure_url)
                }
            }
        }

        // Save to MongoDB using Prisma
        const car = await prisma.car.create({
            data: {
                title,
                description,
                company,
                engine: engine as typeof validEngines[number],
                segment: segment as typeof validSegments[number],
                dealer,
                images: imageUrls,
                userId,
            },
        })

        // Invalidate cache
        await redisClient.del(`search:*`);

        return NextResponse.json({ success: true, message: "Car added successfully", car }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ success: false, message: "Failed to add car" }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}