import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { createClient } from 'redis';
import { validEngines, validSegments } from '@/lib/utils';
import jwt from 'jsonwebtoken'

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @swagger
 * /api/cars/[id]:
 *   put:
 *     description: Edit post details
 *     responses:
 *       200:
 *         description: Updates saved
 *       400:
 *         description: Missing or Invalid credentials
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Request forbidden
 *       404:
 *         description: Data not found
 *       500:
 *         description: Internal server error
 */

// PUT method to update car data 
export async function PUT(request: NextRequest) {

    // validate incoming request
    // const isAuthorizedRequest = request.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
    // if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });

    // validate user token
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // extract userId from token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId;

    const url = new URL(request.url);
    const carId = url.pathname.split('/').pop();
    const formData = await request.formData();

    try {

        // find car in db
        const existingCar = await prisma.car.findUnique({
            where: { id: carId },
        });

        // handle incorrect carid
        if (!existingCar) return NextResponse.json({ success: false, error: 'Car not found' }, { status: 404 });
        // handle unauthorized access
        if (existingCar.userId !== userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const company = formData.get('company') as string
        const engine = formData.get('engine') as string
        const segment = formData.get('segment') as string
        const dealer = formData.get('dealer') as string

        const existingImageIds = new Set(existingCar.images);
        const updatedImages: string[] = [];

        // Process existing images
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('existing-image-')) {
                updatedImages.push(value as string)
                existingImageIds.delete(value as string)
            }
        }

        // Delete removed images from Cloudinary
        for (const imageUrl of existingImageIds) {
            const publicId = imageUrl.split('/').pop()?.split('.')[0]; // extract the file name without extension
            if (publicId) {
                await cloudinary.uploader.destroy(`spyne-car/${publicId}`);
            }
        }

        // Upload new images
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('new-image-')) {
                const file = value as File
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'spyne-car' },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    file.arrayBuffer().then(arr => {
                        uploadStream.end(Buffer.from(arr))
                    })
                })
                if (typeof result === 'object' && result && 'secure_url' in result && typeof result.secure_url === 'string') {
                    updatedImages.push(result.secure_url)
                }
            }
        }

        // Update car in database
        const updatedCar = await prisma.car.update({
            where: { id: carId },
            data: {
                title,
                description,
                company,
                engine: engine as typeof validEngines[number],
                segment: segment as typeof validSegments[number],
                dealer,
                images: updatedImages,
            },
        });

        // Invalidate cache
        await redisClient.del(`search:*`);

        return NextResponse.json({ success: true, updatedCar }, { status: 200 });
    } catch (error) {
        console.error('Error updating car:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}


/**
 * @swagger
 * /api/cars/[id]:
 *   delete:
 *     description: Delete post
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Request forbidden
 *       404:
 *         description: Data not found
 *       500:
 *         description: Internal server error
 */

export async function DELETE(req: NextRequest) {

    // validate incoming request
    // const isAuthorizedRequest = req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
    // if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });

    // validate user token
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    // extract userId from token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId;

    const url = new URL(req.url);
    const carId = url.pathname.split('/').pop();

    try {
        const car = await prisma.car.findUnique({ where: { id: carId } });
        if (!car) return NextResponse.json({ success: false, error: 'Car not found' }, { status: 404 });

        // handle unauthorized access
        if (car.userId !== userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        // delete images from Cloudinary to save cloud space
        if (car.images.length > 0) {
            for (const imageUrl of car.images) {
                const publicId = imageUrl.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`spyne-car/${publicId}`);
                }
            }
        }

        // delete car from database
        await prisma.car.delete({ where: { id: carId } });

        // Invalidate cache
        await redisClient.del(`search:*`);

        return NextResponse.json({ success: true, message: 'Car deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting car:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}