<?php
/**
 * Endpoint do formulário de cotação — PENDÊNCIA TÉCNICA.
 *
 * O front-end (src/scripts/quote.ts) já envia os campos abaixo por POST (multipart) e espera JSON:
 *   sucesso: {"ok":true}        erro: {"ok":false,"error":"..."} com status HTTP != 200
 *
 * Campos: origem, pagina, aceite_lgpd_em (ISO 8601, gerado no navegador), ts (ms), website (honeypot),
 *         nome, email, whatsapp, medicamento, receita (sim|nao), mensagem, lgpd.
 *
 * O que já faz: método, tamanho, honeypot, tempo mínimo de preenchimento e validação no servidor.
 * O que falta (decidir com o cliente — ver README, "Recebimento do formulário"):
 *   1) enviar e-mail por SMTP autenticado (ex.: PHPMailer) para compras@pharmaminas.com.br
 *   2) e/ou gravar em MySQL (aceite LGPD com data/hora do servidor + prazo de retenção definido)
 *   3) proteção extra contra spam (Cloudflare Turnstile ou reCAPTCHA)
 *   4) limitar frequência por IP
 *
 * Enquanto o passo 1 ou 2 não existir, responde 501 de propósito: o site mostra a mensagem de erro
 * com o e-mail alternativo, em vez de dizer que o pedido foi recebido sem ninguém ter recebido.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function out(int $status, array $body): never { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method_not_allowed']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) out(413, ['ok' => false, 'error' => 'too_large']);

// honeypot e tempo mínimo (2 s): robôs respondem "ok" para não aprenderem a burlar
if (trim((string)($_POST['website'] ?? '')) !== '') out(200, ['ok' => true]);
$ts = (int)($_POST['ts'] ?? 0);
if ($ts > 0 && (microtime(true) * 1000 - $ts) < 2000) out(200, ['ok' => true]);

$f = fn(string $k, int $max = 200): string => mb_substr(trim((string)($_POST[$k] ?? '')), 0, $max);
$d = [
  'nome' => $f('nome', 120), 'email' => $f('email', 160), 'whatsapp' => preg_replace('/\D/', '', $f('whatsapp', 30)),
  'medicamento' => $f('medicamento', 160), 'receita' => $f('receita', 3), 'mensagem' => $f('mensagem', 1500),
  'lgpd' => $f('lgpd', 3), 'aceite_em' => $f('aceite_lgpd_em', 40), 'origem' => $f('origem', 20), 'pagina' => $f('pagina', 120),
];

$errors = [];
if (mb_strlen($d['nome']) < 3) $errors[] = 'nome';
if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if (strlen($d['whatsapp']) < 10 || strlen($d['whatsapp']) > 11) $errors[] = 'whatsapp';
if (mb_strlen($d['medicamento']) < 2) $errors[] = 'medicamento';
if (!in_array($d['receita'], ['sim', 'nao'], true)) $errors[] = 'receita';
if ($d['lgpd'] !== 'sim') $errors[] = 'lgpd';
if ($errors) out(422, ['ok' => false, 'error' => 'validation', 'fields' => $errors]);

// TODO (pendência técnica): enviar e-mail e/ou gravar no banco aqui. Remover o 501 quando estiver pronto.
out(501, ['ok' => false, 'error' => 'not_configured']);
