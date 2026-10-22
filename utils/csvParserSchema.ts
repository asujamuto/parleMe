import { z } from 'zod'

export const wordRowSchema = z.object({
  italian: z.string().trim().min(1, { message: "brak tekstu w kolumnie italian" }),
  polish: z.string().trim().min(1, { message: "brak tekstu w kolumnie polish" }),
})

export type WordRow = z.infer<typeof wordRowSchema>
