/**
 * Configuração única do site. Troque os valores aqui e todas as páginas mudam.
 * Nunca coloque números inventados: enquanto o telefone não existir, deixe vazio.
 */
export const SITE = {
  name: 'Pharma Minas',
  tagline: 'Importação de Medicamentos',
  legalName: 'PHARMA MINAS ASSESSORIA NA IMPORTACAO DE MEDICAMENTOS LTDA',
  cnpj: '62.024.527/0001-03',
  // Endereço base (canonical, sitemap e imagem de pré-visualização). Hoje: Vercel. Para usar o domínio definitivo, defina PUBLIC_SITE_URL no build.
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? 'https://pharma-minas.vercel.app',
  email: 'compras@pharmaminas.com.br',
  instagram: '@pharmaminas_',
  instagramUrl: 'https://www.instagram.com/pharmaminas_/',
  address: 'Av. Augusto de Lima, 1376, Loja A, Barro Preto, Belo Horizonte/MG, CEP 30190-003', // fonte: Comprovante de Inscrição do CNPJ (01/08/2025)
  /** Telefone fixo do cadastro do CNPJ. Não é WhatsApp. */
  phone: '(31) 3201-8081',
  phoneHref: 'tel:+553132018081',
  hours: 'Segunda a sexta, das 09h às 18h',
  /** Só dígitos, com DDI e DDD. Ex.: 5531999999999. Vazio = botões levam ao formulário. */
  WHATSAPP_NUMBER: '',
  /** Texto exibido enquanto o número não existe. */
  phoneDisplay: '(31) 3201-8081',
  whatsappMessage: 'Olá! Gostaria de consultar sobre a importação de um medicamento.',
  /** Endpoint que recebe o formulário (pendência técnica: ver /public/api/cotacao.php). */
  FORM_ENDPOINT: '/api/cotacao.php',
};

export const hasWhatsApp = SITE.WHATSAPP_NUMBER.replace(/\D/g, '').length >= 12;

export function whatsappHref(message: string = SITE.whatsappMessage): string {
  if (!hasWhatsApp) return '/contato#cotacao';
  return `https://wa.me/${SITE.WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export const NAV = [
  { label: 'Início', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contato', href: '/contato' },
];
