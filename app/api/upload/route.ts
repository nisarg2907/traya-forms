import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

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

    // Delete old file if provided and valid
    if (oldUrl && oldUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = oldUrl.replace('/uploads/', '')
        const oldFilePath = path.join(uploadsDir, oldFilename)
        
        // Security check: ensure the path is within uploadsDir (prevent directory traversal)
        if (path.resolve(oldFilePath).startsWith(path.resolve(uploadsDir))) {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath)
          }
        }
      } catch (deleteError) {
        // Log but don't fail the upload if old file deletion fails
        console.warn('Failed to delete old file:', deleteError)
      }
    }

    // Ensure uploads directory exists (check again in case it was deleted)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    const filePath = path.join(uploadsDir, filename)

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    // Create URL path
    const imageUrl = `/uploads/${filename}`

    return NextResponse.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: imageUrl,
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
