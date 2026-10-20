# Pharma Minas — Website Institucional

[![Astro](https://img.shields.io/badge/Astro-v7.3-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)

Website institucional da **Pharma Minas**, especializado em importação e distribuição legal de medicamentos especiais, terapias oncológicas e tratamentos para doenças raras.

---

## 🛠️ Tecnologias Utilizadas

- **[Astro](https://astro.build/) (v7.3)** — Framework web para geração de sites estáticos (SSG) de alta performance.
- **[Tailwind CSS](https://tailwindcss.com/) (v4)** — Framework CSS utility-first para estilização moderna e responsiva.
- **[TypeScript](https://www.typescriptlang.org/) & JavaScript** — Linguagens utilizadas para tipagem estática e lógica dos componentes.
- **[Fontsource](https://fontsource.org/)** — Gerenciamento de tipografia self-hosted (*Cinzel*, *Marcellus* e *Inter*).
- **[Material Symbols](https://fonts.google.com/icons)** — Biblioteca de ícones vetoriais em SVG (`@material-symbols/svg-400`).
- **[Sharp](https://sharp.pixelplumbing.com/)** — Processamento e otimização automatizada de imagens para formato WebP.
- **PHP** — Backend para processamento e validação de solicitações de cotação em ambiente Apache/cPanel.
---

## 📨 Recebimento do formulário

Os formulários (home, contato e modal) enviam para `/api/cotacao.php`, que valida os dados e manda **um e-mail por pedido** para `compras@pharmaminas.com.br`, por SMTP autenticado (PHPMailer 6.10, já incluído em `public/api/lib/`).

- **Senhas fora do site:** a configuração fica em `/home/USUARIO/pharmaminas-config/formulario.php`, um nível acima do `public_html`. Modelo em `config/formulario.exemplo.php`.
- **Sem configuração**, o endpoint responde 501 e o site mostra a mensagem de erro com o e-mail alternativo (nunca finge que o pedido chegou).
- **Proteções:** honeypot, tempo mínimo de preenchimento, validação no servidor e limite de 5 envios por IP a cada 10 minutos.
- **Respostas:** 200 enviado · 422 dados inválidos · 429 muitos envios · 501 não configurado · 502 falha no SMTP (detalhe no `error_log` do PHP).
- **Requisito:** PHP 8.1 ou superior.
- **Próxima etapa possível:** gravar também em MySQL, com painel administrativo.
