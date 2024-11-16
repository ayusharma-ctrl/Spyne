import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     description: token verification
 *     responses:
 *       200:
 *         description: Token Verified
 *       401:
 *         description: Token not found
 */

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    return NextResponse.json({ isAuthenticated: true }, { status: 200 });
}