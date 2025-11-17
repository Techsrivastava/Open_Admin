import { z } from "zod"

export const packageFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  overview: z.string().min(1),
  duration: z.string().min(1),
  originalPrice: z.string().min(1),
  offerPrice: z.string().optional(),
  advancePayment: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  region: z.string().optional(),
  category: z.string().min(1),
  coupons: z.array(z.string()).optional(),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string()
  })),
  maxParticipants: z.string().min(1),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  howToReach: z.array(z.string()),
  fitnessRequired: z.array(z.string()),
  cancellationPolicy: z.array(z.string()),
  whatToCarry: z.array(z.object({ item: z.string() })),
  trekInfo: z.array(z.object({ title: z.string(), value: z.string() })),
  batchDates: z.array(z.object({
    startDate: z.string(),
    endDate: z.string(),
    price: z.string(),
    availability: z.boolean(),
    seatsAvailable: z.union([z.string(), z.number()]).optional()
  })),
  additionalServices: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.string(),
    isOptional: z.boolean()
  })),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })),
  images: z.object({
    cardImage: z.string().optional(),
    trekMap: z.string().optional(),
    gallery: z.array(z.string()).optional()
  }),
  pdf: z.union([z.array(z.string()), z.string()]).optional(),
  assignedGuides: z.array(z.string()).optional(),
  views: z.number().optional(),
  bookingsCount: z.number().optional(),
  rating: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  standoutReason: z.string().optional(),
  isTrending: z.boolean().optional(),
  trendingScore: z.number().optional(),
  moreLikeThis: z.array(z.string()).optional(),
  season: z.string().optional(),
  labels: z.array(z.string()).optional(),
})

export type PackageFormValues = z.infer<typeof packageFormSchema>