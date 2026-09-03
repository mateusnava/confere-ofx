export const PLAN_LIMITS = {
  free: { pages: 0 },
  pro: { pages: 1000 },
  escritorio: { pages: 8000 },
} as const;

export const PLAN_PRICES = {
  pro: { label: "Pro", price: "R$ 19,90/mês", pages: 1000 },
  escritorio: { label: "Escritório", price: "R$ 69/mês", pages: 8000 },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;
