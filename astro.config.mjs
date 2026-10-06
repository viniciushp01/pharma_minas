import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';

// Artigos em rascunho (padrão) e páginas ainda não revisadas ficam fora do sitemap.
const dir = new URL('./src/content/blog/', import.meta.url);
const drafts = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !/^draft:\s*false\s*$/m.test(readFileSync(new URL(f, dir), 'utf8')))
  .map((f) => `/blog/${f.replace(/\.md$/, '')}`);
const excluded = ['/404', '/politica-de-privacidade', '/faq', ...drafts] // /faq: sem revisão regulatória/jurídica ainda (noindex);

// [CONFIRMAR] domínio definitivo. Usado em canonical, sitemap e JSON-LD.
export default defineConfig({
  site: 'https://www.pharmaminas.com.br',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !excluded.some((e) => new URL(p).pathname.replace(/\/$/, '') === e || p.includes('/404')) })],
  vite: { plugins: [tailwindcss()] },
});
