import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/users - Create or get a user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, email, name } = body

    if (!phone) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Phone number is required',
        },
        { status: 400 },
      )
    }

    // Find or create user by phone
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        // Update name/email if provided
        ...(name && { name }),
        ...(email && { email }),
      },
      create: {
        phone,
        email: email || undefined,
        name: name || undefined,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating/finding user:', error)
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

// GET /api/users?phone=xxx or ?email=xxx - Get user by identifier
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')

    if (!phone && !email) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Phone or email is required',
        },
        { status: 400 },
      )
    }

    let user = null

    if (phone) {
      user = await prisma.user.findUnique({
        where: { phone },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      })
    }

    if (!user) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'User not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
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
