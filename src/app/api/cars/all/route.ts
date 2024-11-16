import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();


/**
 * @swagger
 * /api/cars/all?page=1&limit=5&q='toyota':
 *   get:
 *     description: get all the cars
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Request forbidden
 *       500:
 *         description: Internal server error
 */

// GET method to fetch cars data
export async function GET(req: NextRequest) {

    // validate incoming request
    // const isAuthorizedRequest = req.headers.get('x-api-key') === process.env.NEXT_PUBLIC_X_API_KEY!
    // if (!isAuthorizedRequest) return NextResponse.json({ success: false, error: 'Request forbidden' }, { status: 403 });

    // read info from search params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // this is going to be the key name for redis cache
    const cacheKey = `search:${query}:${page}:${limit}`;

    try {
        // look for data in radis cache - if found return that data
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return NextResponse.json({ success: true, result: JSON.parse(cachedData) }, { status: 200 });

        // fetch from database, cars data and count of total result found - will call both the queries in parallel using Promise.all
        const [cars, totalCount] = await Promise.all([
            prisma.car.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { company: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                }, // where clause is important to handle search query 
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }, // will see the recently added results at first
                include: { User: { select: { username: true } } }, // (optional as we already have userID)- attach username - as username is also a unique property
            }), // query 1
            prisma.car.count({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { company: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
            }), // query 2
        ]);

        // construct result obj
        const result = {
            cars,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
        };

        // save the result in redis with key name - we save data is json format - that's why we were parsing the found data above
        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 60 * 5, // cache exprire time in seconds - here it is set to 5 mins
        });

        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error) {
        console.error('Error fetching cars:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}