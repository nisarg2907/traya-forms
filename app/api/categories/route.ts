import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// In-memory cache for categories (since categories don't change)
let categoriesCache: any[] | null = null
let cacheTimestamp: number | null = null

// GET /api/categories - Fetch all categories
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Return cached categories if available
    if (categoriesCache !== null) {
      const cacheAge = cacheTimestamp ? Date.now() - cacheTimestamp : 0
      console.log(`[Categories API] ✅ Cache HIT (age: ${cacheAge}ms)`)
      
      return NextResponse.json(
        {
          success: true,
          data: categoriesCache,
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

    console.log(`[Categories API] ❌ Cache MISS - Fetching from database...`)
    
    // Fetch from database if not cached
    const dbStartTime = Date.now()
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
    })
    const dbTime = Date.now() - dbStartTime
    console.log(`[Categories API] ✅ Database query completed in ${dbTime}ms (${categories.length} categories)`)

    // Cache the categories
    categoriesCache = categories
    cacheTimestamp = Date.now()

    const totalTime = Date.now() - startTime
    console.log(`[Categories API] ✅ Total request time: ${totalTime}ms`)

    return NextResponse.json(
      {
        success: true,
        data: categories,
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
    console.error('[Categories API] ❌ Error fetching categories:', error)
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
