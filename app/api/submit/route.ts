import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/submit - Submit a complete quiz form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, answers, name, email } = body

    if (!phone) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Phone number is required',
        },
        { status: 400 },
      )
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Answers are required',
        },
        { status: 400 },
      )
    }

    // Get or create user by phone number
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        // Update name/email if provided and not already set
        ...(name && { name }),
        ...(email && { email }),
      },
      create: {
        phone,
        name: name || undefined,
        email: email || undefined,
      },
    })

    // Create all answers directly linked to user
    const answerPromises = Object.entries(answers).map(async ([questionId, value]) => {
      // Get question to determine answer type
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      })

      if (!question) return null

      // Determine answer type and value based on question type
      let answerType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SINGLE' | 'MULTIPLE' | 'IMAGE_URL' = 'STRING'
      let answerData: any = {
        userId: user.id,
        questionId,
        answerType,
      }

      switch (question.type) {
        case 'TEXT':
          answerType = 'STRING'
          answerData.stringValue = String(value)
          break
        case 'NUMBER':
          answerType = 'NUMBER'
          answerData.numberValue = Number(value)
          break
        case 'BOOLEAN':
          answerType = 'BOOLEAN'
          answerData.booleanValue = Boolean(value)
          break
        case 'SINGLE':
        case 'GENDER':
          answerType = 'SINGLE'
          answerData.stringValue = String(value)
          break
        case 'MULTIPLE':
          answerType = 'MULTIPLE'
          answerData.stringValue = JSON.stringify(Array.isArray(value) ? value : [value])
          break
        case 'IMAGE':
          answerType = 'SINGLE'
          answerData.stringValue = String(value)
          break
        case 'UPLOAD':
          answerType = 'IMAGE_URL'
          answerData.imageUrl = String(value)
          break
        default:
          answerData.stringValue = String(value)
      }

      answerData.answerType = answerType

      return prisma.answer.upsert({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId,
          },
        },
        update: answerData,
        create: answerData,
      })
    })

    await Promise.all(answerPromises.filter(Boolean))

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        data: {
          userId: user.id,
          phone: user.phone,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error submitting form:', error)
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
