import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

// Ensure uploads directory exists (in public/uploads)
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get('name') as string | null
    const gender = formData.get('gender') as string | null
    const age = formData.get('age') as string | null
    const phone = formData.get('phone') as string | null
    const hairLossStage = formData.get('hairLossStage') as string | null
    const familyHistory = formData.get('familyHistory') as string | null
    const dandruff = formData.get('dandruff') as string | null
    const supplements = formData.get('supplements') as string | null
    const sleep = formData.get('sleep') as string | null
    const stress = formData.get('stress') as string | null
    const constipation = formData.get('constipation') as string | null
    const energyLevels = formData.get('energyLevels') as string | null
    const gasAcidityBloating = formData.get('gasAcidityBloating') as string | null
    const scalpPhoto = formData.get('scalpPhoto') as File | null

    // Basic validation (same as Express version)
    if (
      !name ||
      !gender ||
      !age ||
      !phone ||
      !hairLossStage ||
      !familyHistory ||
      !dandruff ||
      !supplements ||
      !sleep ||
      !stress ||
      !constipation ||
      !energyLevels ||
      !gasAcidityBloating
    ) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'All required fields must be provided',
        },
        { status: 400 },
      )
    }

    let scalpPhotoPath: string | null = null

    if (scalpPhoto && typeof scalpPhoto === 'object') {
      const buffer = Buffer.from(await scalpPhoto.arrayBuffer())
      const ext = path.extname(scalpPhoto.name) || '.jpg'
      const filename = `scalp-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
      const filePath = path.join(uploadsDir, filename)

      fs.writeFileSync(filePath, buffer)
      scalpPhotoPath = `/uploads/${filename}`
    }

    const ipAddress =
      req.ip ??
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      null

    const formSubmission = await prisma.formSubmission.create({
      data: {
        name,
        gender,
        age: parseInt(age, 10),
        phone,
        hairLossStage,
        familyHistory,
        dandruff,
        supplements,
        sleep,
        stress,
        constipation,
        energyLevels,
        gasAcidityBloating,
        scalpPhoto: scalpPhotoPath,
        ipAddress: ipAddress ?? undefined,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Form submitted successfully',
        data: {
          id: formSubmission.id,
          submittedAt: formSubmission.submittedAt,
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

export async function GET() {
  try {
    const submissions = await prisma.formSubmission.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({
      success: true,
      count: submissions.length,
      data: submissions,
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
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

