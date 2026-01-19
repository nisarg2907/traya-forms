import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/questions - Fetch all questions with their options, ordered by section and order
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
        category: true,
      },
      orderBy: [
        { section: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: questions,
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
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
