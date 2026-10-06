// Conteúdo da página /faq. Fonte: claude/faq-pesquisa.md (rascunhos genéricos, sem prazos, preços ou normas).
// Trechos "[CONFIRMAR ...]" aguardam revisão regulatória/jurídica. A página fica noindex até lá.
export interface FaqItem { q: string; a: string }
export interface FaqGroup { id: string; title: string; items: FaqItem[] }

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'entendimento-basico',
    title: 'Entendimento básico',
    items: [
      { q: 'É legal importar medicamento do exterior? Quem pode pedir?', a: 'Sim, desde que a importação siga as regras sanitárias e fiscais brasileiras. O pedido é feito para uso pessoal, com prescrição médica, pelo próprio paciente ou, quando for o caso, pelo responsável legal. Nossa equipe orienta você em cada etapa. [CONFIRMAR texto com jurídico]' },
      { q: 'Quando é preciso ter autorização da Anvisa?', a: 'Em muitos casos, a importação passa por análise ou autorização da Anvisa, conforme o tipo de medicamento e a situação do pedido. Nossa equipe verifica o que se aplica ao seu caso e orienta o que deve ser enviado. [CONFIRMAR regra aplicável com regulatório]' },
      { q: 'É possível importar medicamento que não tem registro no Brasil?', a: 'Em alguns casos, sim, desde que o pedido siga as regras sanitárias e tenha prescrição médica. O que se aplica depende do medicamento e da situação do tratamento, e nossa equipe confirma isso na cotação. [CONFIRMAR texto com jurídico e regulatório]' },
      { q: 'Posso importar medicamento para outra pessoa?', a: 'O pedido costuma ser feito pelo próprio paciente ou, quando for o caso, pelo responsável legal, com os documentos de quem vai usar o medicamento. Nossa equipe explica quais documentos são necessários para o seu caso. [CONFIRMAR]' },
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos',
    items: [
      { q: 'Quais documentos são necessários?', a: 'Em geral, receita médica, documento de identidade e comprovante de endereço. Conforme o caso, podem ser pedidos também relatório médico e termo de responsabilidade. Nossa equipe confirma a lista completa do seu pedido. [CONFIRMAR lista oficial]' },
      { q: 'Posso importar sem receita médica?', a: 'A receita médica faz parte da documentação exigida na importação. Você pode solicitar uma cotação para entender os próximos passos, e nossa equipe orienta o que falta. [CONFIRMAR se cotação sem receita é permitida]' },
      { q: 'Por que alguns pedidos de importação são recusados?', a: 'Em geral, por documentação incompleta ou ilegível, receita sem as informações necessárias ou pedido que não se enquadra nas regras de uso individual. Por isso nossa equipe confere os documentos antes do envio. [CONFIRMAR texto com regulatório]' },
      { q: 'Quantos meses de tratamento posso trazer por remessa?', a: 'A quantidade depende do que consta na receita e das regras sanitárias aplicáveis ao uso individual. Nossa equipe informa o limite para o seu caso na cotação. [CONFIRMAR]' },
    ],
  },
];
