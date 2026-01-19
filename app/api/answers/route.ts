import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/answers - Submit or update an answer for a user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, questionId, answerType, value } = body

    if (!userId || !questionId || !answerType) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'userId, questionId, and answerType are required',
        },
        { status: 400 },
      )
    }

    // Prepare answer data based on type
    const answerData: any = {
      userId,
      questionId,
      answerType,
    }

    // Set the appropriate value field based on answerType
    switch (answerType) {
      case 'STRING':
      case 'SINGLE':
        answerData.stringValue = String(value)
        break
      case 'MULTIPLE':
        // Store array as JSON string
        answerData.stringValue = JSON.stringify(Array.isArray(value) ? value : [value])
        break
      case 'NUMBER':
        answerData.numberValue = Number(value)
        break
      case 'BOOLEAN':
        answerData.booleanValue = Boolean(value)
        break
      case 'IMAGE_URL':
        answerData.imageUrl = String(value)
        break
      default:
        return NextResponse.json(
          {
            error: 'Validation error',
            message: 'Invalid answerType',
          },
          { status: 400 },
        )
    }

    // Upsert answer (create or update)
    const answer = await prisma.answer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: answerData,
      create: answerData,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Answer saved successfully',
        data: answer,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error saving answer:', error)
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

// GET /api/answers?userId=xxx - Get all answers for a user
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'userId is required',
        },
        { status: 400 },
      )
    }

    const answers = await prisma.answer.findMany({
      where: {
        userId,
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: answers,
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
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
