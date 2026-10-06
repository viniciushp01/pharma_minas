/**
 * Configuração única do site. Troque os valores aqui e todas as páginas mudam.
 * Nunca coloque números inventados: enquanto o telefone não existir, deixe vazio.
 */
export const SITE = {
  name: 'Pharma Minas',
  tagline: 'Importação de Medicamentos',
  legalName: 'PHARMA MINAS ASSESSORIA NA IMPORTACAO DE MEDICAMENTOS LTDA',
  cnpj: '62.024.527/0001-03',
  // Endereço base (canonical, sitemap e imagem de pré-visualização). Hoje: Vercel. [CONFIRMAR] trocar pelo domínio definitivo (ou definir PUBLIC_SITE_URL no build).
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) ?? 'https://pharma-minas.vercel.app',
  email: 'compras@pharmaminas.com.br',
  instagram: '@pharmaminas_',
  instagramUrl: 'https://www.instagram.com/pharmaminas_/',
  address: '', // [CONFIRMAR] endereço
  hours: '', // [CONFIRMAR] horário de atendimento
  /** Só dígitos, com DDI e DDD. Ex.: 5531999999999. Vazio = botões levam ao formulário. */
  WHATSAPP_NUMBER: '',
  /** Texto exibido enquanto o número não existe. */
  phoneDisplay: '(XX) XXXXX-XXXX [CONFIRMAR]',
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
