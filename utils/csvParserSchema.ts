import { z } from 'zod'

export const csvParserSchema = z.object({
    italian: z.string(),
    polish: z.string()
})

export const formSchema = z.object({
  courseName: z.string().min(2, {
    message: "Nazwa fiszek musi być większa niż 2 litery",
  }),
  lessonID: z.string(),
  file: z.any().optional()
})


