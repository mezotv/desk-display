import { createServerFn } from '@tanstack/react-start'

import { calculateMrr } from '@/utils/calculate-mrr.server'

export const getMrr = createServerFn({ method: 'GET' }).handler(() =>
  calculateMrr(),
)
