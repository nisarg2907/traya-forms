import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// In-memory cache for categories (since categories don't change)
let categoriesCache: any[] | null = null

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    // Return cached categories if available
    if (categoriesCache !== null) {
      return NextResponse.json(
        {
          success: true,
          data: categoriesCache,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      )
    }

    // Fetch from database if not cached
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
    })

    // Cache the categories
    categoriesCache = categories

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
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
