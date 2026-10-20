import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';

// Fora do sitemap: a página de erro e artigos marcados com "draft: true" (que também recebem noindex).
const dir = new URL('./src/content/blog/', import.meta.url);
const drafts = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => /^draft:\s*true\s*$/m.test(readFileSync(new URL(f, dir), 'utf8')))
  .map((f) => `/blog/${f.replace(/\.md$/, '')}`);
const excluded = ['/404', ...drafts];

// Domínio oficial. Usado em canonical, sitemap e JSON-LD. Para outro endereço, defina PUBLIC_SITE_URL no build.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://pharmaminas.com.br',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !excluded.some((e) => new URL(p).pathname.replace(/\/$/, '') === e || p.includes('/404')) })],
  vite: { plugins: [tailwindcss()] },
});
