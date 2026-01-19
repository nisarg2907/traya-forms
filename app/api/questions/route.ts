import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// In-memory cache for questions (since questions don't change)
let questionsCache: any[] | null = null
let cacheTimestamp: number | null = null

// GET /api/questions - Fetch all questions with their options, ordered by section and order
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Return cached questions if available
    if (questionsCache !== null) {
      const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : 0
      console.log(`[Questions API] ✅ Cache HIT (age: ${cacheAge}ms)`)
      
      return NextResponse.json(
        {
          success: true,
          data: questionsCache,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'X-Cache': 'HIT',
            'X-Cache-Age': `${cacheAge}`,
          },
        }
      )
    }

    console.log(`[Questions API] ❌ Cache MISS - Fetching from database...`)
    
    // Fetch from database if not cached
    const dbStartTime = Date.now()
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
    const dbTime = Date.now() - dbStartTime
    console.log(`[Questions API] ✅ Database query completed in ${dbTime}ms (${questions.length} questions)`)

    // Cache the questions
    questionsCache = questions
    cacheTimestamp = Date.now()

    const totalTime = Date.now() - startTime
    console.log(`[Questions API] ✅ Total request time: ${totalTime}ms`)

    return NextResponse.json(
      {
        success: true,
        data: questions,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache': 'MISS',
          'X-DB-Time': `${dbTime}`,
          'X-Total-Time': `${totalTime}`,
        },
      }
    )
  } catch (error) {
    console.error('[Questions API] ❌ Error fetching questions:', error)
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
