import { useState, useEffect } from 'react'

export type QuestionType = "text" | "single" | "multiple" | "gender" | "upload" | "image" | "number" | "boolean";

export interface QuizQuestion {
  id: string
  question: string
  type: QuestionType
  section: number
  order: number
  placeholder?: string | null
  disclaimer?: string | null
  isRequired: boolean
  options?: {
    id: string
    label: string
    subLabel?: string | null
    value: string
    images?: string[]
    order: number
  }[]
}

export interface Category {
  id: string
  title: string
  subtitle: string
  order: number
}

export function useQuizData() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch questions and categories in parallel
        const [questionsRes, categoriesRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/categories'),
        ])

        if (!questionsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch quiz data')
        }

        const questionsData = await questionsRes.json()
        const categoriesData = await categoriesRes.json()

        // Transform questions to match expected format
        const transformedQuestions: QuizQuestion[] = questionsData.data.map((q: any) => {
          // Map Prisma enum to our QuestionType
          let type: QuestionType = q.type.toLowerCase() as QuestionType
          // Handle NUMBER enum
          if (q.type === 'NUMBER') {
            type = 'number'
          } else if (q.type === 'BOOLEAN') {
            type = 'boolean'
          }
          
          return {
            id: q.id,
            question: q.question,
            type,
            section: q.section,
            order: q.order,
            placeholder: q.placeholder,
            disclaimer: q.disclaimer,
            isRequired: q.isRequired,
            options: q.options?.map((opt: any) => ({
              id: opt.value,
              label: opt.label,
              subLabel: opt.subLabel,
              value: opt.value,
              images: opt.images || [],
              order: opt.order,
            })),
          }
        })

        setQuestions(transformedQuestions)
        setCategories(categoriesData.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching quiz data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
        // Fallback to static data if API fails
        const { questions: staticQuestions, sections } = await import('./quiz-data')
        setQuestions(staticQuestions as any)
        setCategories(sections.map((s, i) => ({
          id: `cat-${s.id}`,
          title: s.title,
          subtitle: s.subtitle,
          order: s.id,
        })))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { questions, categories, loading, error }
}

export function getSectionProgress(currentQuestion: number, totalQuestions: number): number {
  return Math.round((currentQuestion / totalQuestions) * 100)
}

export function getCurrentSection(questionIndex: number, questions: QuizQuestion[]): number {
  if (questionIndex >= questions.length) return 4
  return questions[questionIndex]?.section || 1
}
