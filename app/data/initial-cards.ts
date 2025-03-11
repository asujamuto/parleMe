export const categories = [
  'rzeczowniki',
  'czasowniki',
  'liczby',
  'zdania',
  'przymiotnik'
] as const;

export type Category = typeof categories[number];

export const initialCards = [
  {
    id: '1',
    italian: 'ciao',
    polish: 'cześć',
    category: 'rzeczowniki',
    example: 'Ciao, come stai?',
    confidence: 1,
  },
  {
    id: '2',
    italian: 'grazie',
    polish: 'dziękuję',
    category: 'czasowniki',
    example: 'Grazie mille!',
    confidence: 1,
  },
  {
    id: '3',
    italian: 'per favore',
    polish: 'proszę',
    category: 'czasowniki',
    example: 'Un caffè, per favore.',
    confidence: 1,
  },
  {
    id: '4',
    italian: 'uno',
    polish: 'jeden',
    category: 'liczby',
    example: 'Vorrei un caffè.',
    confidence: 1,
  },
  {
    id: '5',
    italian: 'pizza',
    polish: 'pizza',
    category: 'zdania',
    example: 'Mi piace la pizza.',
    confidence: 1,
  },
] as const;