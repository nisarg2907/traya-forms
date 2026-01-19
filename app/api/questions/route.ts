import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// In-memory cache for questions (since questions don't change)
let questionsCache: any[] | null = null

// GET /api/questions - Fetch all questions with their options, ordered by section and order
export async function GET() {
  try {
    // Return cached questions if available
    if (questionsCache !== null) {
      return NextResponse.json(
        {
          success: true,
          data: questionsCache,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      )
    }

    // Fetch from database if not cached
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

    // Cache the questions
    questionsCache = questions

    return NextResponse.json(
      {
        success: true,
        data: questions,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
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
