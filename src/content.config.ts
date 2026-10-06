import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** título curto no <title> (≤ 60 caracteres) */
      seoTitle: z.string().optional(),
      /** meta description (≤ 155 caracteres) */
      metaDescription: z.string(),
      /** resumo do card e da caixa "Resumo" */
      cardSummary: z.string(),
      summary: z.string(),
      category: z.string(),
      breadcrumbLabel: z.string(),
      readingTime: z.number().default(4),
      order: z.number(),
      card: image(),
      cardAlt: z.string(),
      cover: image(),
      coverAlt: z.string(),
      notice: z.string(),
      cta: z.object({ title: z.string(), text: z.string() }),
      faq: z.array(z.object({ q: z.string(), a: z.array(z.string()) })),
      references: z.array(z.string()),
      /** Enquanto true: selo "RASCUNHO", noindex e fora do sitemap. Passar a false só após revisão técnica e jurídica. */
      draft: z.boolean().default(true),
      reviewer: z.string().default('[Nome], CRF-[UF] [CONFIRMAR]'),
      publishedAt: z.string().optional(),
      updatedAt: z.string().optional(),
    }),
});

export const collections = { blog };
