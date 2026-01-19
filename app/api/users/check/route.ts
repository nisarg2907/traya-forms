import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/users/check?phone=xxx - Check if user exists and has completed quiz
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Phone number is required',
        },
        { status: 400 },
      )
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        answers: {
          select: {
            id: true,
            questionId: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        hasCompleted: false,
      })
    }

    // Check if user has any answers (has completed quiz)
    const hasCompleted = user.answers.length > 0

    return NextResponse.json({
      exists: true,
      hasCompleted,
      userId: user.id,
    })
  } catch (error) {
    console.error('Error checking user:', error)
    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      {
        error: 'Internal server error',
        message,
      },
      { status: 500 },
    )
  }
}
