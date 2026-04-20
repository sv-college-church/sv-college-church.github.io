import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    tier: z.enum(['banner', 'featured', 'listed']),
    location: z.string().optional(),
    address: z.string().optional(),
    mapUrl: z.string().url().optional(),
    summary: z.string().optional(),
    campus: z
      .enum(['all', 'svc', 'sjsu', 'stanford', 'ucsc', 'deanza', 'scu'])
      .default('all'),
    bannerStartsAt: z.date().optional(),
    banner: z
      .object({
        text: z.string(),
        shortText: z.string(),
        emoji: z.string().optional(),
        cta: z
          .object({
            label: z.string(),
            shortLabel: z.string(),
            url: z.string(),
          })
          .optional(),
      })
      .optional(),
  }),
});

export const collections = { events };
