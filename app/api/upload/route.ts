import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// POST /api/upload - Upload an image file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const oldUrl = formData.get('oldUrl') as string | null

    if (!file) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'No file provided',
        },
        { status: 400 },
      )
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid file type. Only images are allowed.',
        },
        { status: 400 },
      )
    }

    // Delete old file if provided (Vercel Blob handles this automatically via URL)
    // Note: You may want to implement explicit deletion if needed
    // For now, we'll just upload the new file

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: blob.url,
          filename,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error uploading file:', error)
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
