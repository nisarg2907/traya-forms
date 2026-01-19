import { PrismaClient, QuestionType } from '@prisma/client'
import { questions, sections } from '../lib/quiz-data'

const prisma = new PrismaClient()

// Map question types from quiz-data.ts to Prisma QuestionType enum
function mapQuestionType(type: string): QuestionType {
  switch (type) {
    case 'text':
      return QuestionType.TEXT
    case 'number':
      return QuestionType.NUMBER
    case 'single':
      return QuestionType.SINGLE
    case 'multiple':
      return QuestionType.MULTIPLE
    case 'gender':
      return QuestionType.GENDER
    case 'boolean':
      return QuestionType.BOOLEAN
    case 'image':
      return QuestionType.IMAGE
    case 'upload':
      return QuestionType.UPLOAD
    default:
      return QuestionType.TEXT
  }
}

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  console.log('Creating categories...')
  const categoryMap = new Map<number, string>()

  for (const section of sections) {
    // Use a deterministic UUID-like approach or let Prisma generate it
    // For simplicity, we'll use a simple string ID that we can reference
    const categoryId = `cat-${section.id}`
    
    const category = await prisma.category.upsert({
      where: { id: categoryId },
      update: {
        title: section.title,
        subtitle: section.subtitle,
        order: section.id,
      },
      create: {
        id: categoryId,
        title: section.title,
        subtitle: section.subtitle,
        order: section.id,
      },
    })
    categoryMap.set(section.id, category.id)
    console.log(`✅ Created category: ${section.title} ${section.subtitle}`)
  }

  // Create questions
  console.log('\nCreating questions...')
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const categoryId = categoryMap.get(q.section) || null

    // Handle age question type - it's text in quiz-data but should be NUMBER
    let questionType = mapQuestionType(q.type)
    if (q.id === 'age') {
      questionType = QuestionType.NUMBER
    }

    const question = await prisma.question.upsert({
      where: { id: q.id },
      update: {
        question: q.question,
        type: questionType,
        section: q.section,
        order: i,
        placeholder: q.placeholder || null,
        disclaimer: q.disclaimer || null,
        isRequired: true,
        categoryId,
      },
      create: {
        id: q.id,
        question: q.question,
        type: questionType,
        section: q.section,
        order: i,
        placeholder: q.placeholder || null,
        disclaimer: q.disclaimer || null,
        isRequired: true,
        categoryId,
      },
    })

    console.log(`✅ Created question: ${q.id} (${questionType})`)

    // Create options if they exist
    if (q.options && q.options.length > 0) {
      // Delete existing options first
      await prisma.questionOption.deleteMany({
        where: { questionId: question.id },
      })

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j]
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            label: opt.label,
            subLabel: opt.subLabel || null,
            value: opt.id,
            images: opt.images || [],
            order: j,
          },
        })
      }
      console.log(`  └─ Created ${q.options.length} options`)
    }
  }

  console.log('\n✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
