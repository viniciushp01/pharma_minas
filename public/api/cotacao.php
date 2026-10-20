<?php
/**
 * Endpoint do formulário de cotação — envia cada pedido por e-mail (SMTP autenticado).
 *
 * O front-end (src/scripts/quote.ts) envia os campos por POST (multipart) e espera JSON:
 *   sucesso: {"ok":true}        erro: {"ok":false,"error":"..."} com status HTTP != 200
 *
 * Campos: origem, pagina, aceite_lgpd_em (ISO 8601, gerado no navegador), ts (ms), website (honeypot),
 *         nome, email, whatsapp, medicamento, receita (sim|nao), mensagem, lgpd.
 *
 * Proteções: método, tamanho, honeypot, tempo mínimo de preenchimento, validação no servidor
 * e limite de envios por IP.
 *
 * Configuração (senha do SMTP etc.) fica FORA da pasta pública, em:
 *   /home/USUARIO/pharmaminas-config/formulario.php      (um nível acima do public_html)
 * Modelo: formulario.exemplo.php (vem junto com o pacote, fora do zip do site).
 * Sem esse arquivo o endpoint responde 501 de propósito: o site mostra a mensagem de erro
 * com o e-mail alternativo, em vez de dizer que o pedido foi recebido sem ninguém ter recebido.
 *
 * Próxima etapa possível: gravar também em MySQL (ver README, "Recebimento do formulário").
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

// ---- Configuração (fora do public_html) ----
$cfgPath = getenv('PHARMA_FORM_CONFIG') ?: dirname(__DIR__, 2) . '/pharmaminas-config/formulario.php';
$cfg = is_file($cfgPath) ? require $cfgPath : null;
if (!is_array($cfg) || empty($cfg['smtp_host']) || empty($cfg['smtp_user']) || empty($cfg['smtp_pass']) || empty($cfg['to'])) {
  error_log('[cotacao] configuração ausente ou incompleta: ' . $cfgPath);
  out(501, ['ok' => false, 'error' => 'not_configured']);
}
date_default_timezone_set($cfg['timezone'] ?? 'America/Sao_Paulo');

// ---- Limite de envios por IP (padrão: 5 a cada 10 min) ----
$limit = (int)($cfg['rate_limit'] ?? 5);
$window = (int)($cfg['rate_window_sec'] ?? 600);
$rlDir = dirname($cfgPath) . '/limite-envios';
if ($limit > 0 && (is_dir($rlDir) || @mkdir($rlDir, 0700, true)) && is_writable($rlDir)) {
  $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
  $file = $rlDir . '/' . hash('sha256', $ip . '|' . ($cfg['smtp_user'])) . '.json'; // IP não fica gravado em claro
  $now = time();
  $hits = is_file($file) ? (json_decode((string)@file_get_contents($file), true) ?: []) : [];
  $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - $window));
  if (count($hits) >= $limit) out(429, ['ok' => false, 'error' => 'too_many_requests']);
  $hits[] = $now;
  @file_put_contents($file, json_encode($hits), LOCK_EX);
  if (random_int(1, 50) === 1) { // limpeza ocasional dos arquivos antigos
    foreach (glob($rlDir . '/*.json') ?: [] as $old) if (@filemtime($old) < $now - $window) @unlink($old);
  }
}

// ---- Montagem do e-mail ----
$e = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$oneLine = fn(string $s): string => trim(preg_replace('/[\r\n\t]+/', ' ', $s));
$w = $d['whatsapp'];
$wDisplay = strlen($w) === 11 ? sprintf('(%s) %s-%s', substr($w, 0, 2), substr($w, 2, 5), substr($w, 7))
                              : sprintf('(%s) %s-%s', substr($w, 0, 2), substr($w, 2, 4), substr($w, 6));
$waLink = 'https://wa.me/55' . $w;
$agora = date('d/m/Y \à\s H:i');
$receita = $d['receita'] === 'sim' ? 'Sim' : 'Não';
$origens = ['home' => 'Página inicial', 'contato' => 'Página de contato', 'modal' => 'Botão "Solicitar cotação"'];
$origem = $origens[$d['origem']] ?? ($d['origem'] ?: 'Site');
$pagina = $d['pagina'] !== '' ? $d['pagina'] : '/';
$aceiteNav = '';
if ($d['aceite_em'] !== '' && ($t = strtotime($d['aceite_em'])) !== false) $aceiteNav = date('d/m/Y H:i:s', $t);
$msg = $d['mensagem'] !== '' ? $d['mensagem'] : '—';

$assunto = $oneLine('Nova cotação — ' . $d['medicamento'] . ' — ' . $d['nome']);

$linhas = [
  ['Nome', $e($d['nome'])],
  ['E-mail', '<a href="mailto:' . $e($d['email']) . '">' . $e($d['email']) . '</a>'],
  ['WhatsApp', '<a href="' . $e($waLink) . '">' . $e($wDisplay) . '</a>'],
  ['Medicamento', '<strong>' . $e($d['medicamento']) . '</strong>'],
  ['Possui receita', $e($receita)],
  ['Mensagem', nl2br($e($msg))],
];
$tr = '';
foreach ($linhas as [$k, $v]) {
  $tr .= '<tr><td style="padding:8px 12px;color:#5b6472;white-space:nowrap;width:1%;vertical-align:top;border-bottom:1px solid #eceef2">' . $k
       . '</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #eceef2">' . $v . '</td></tr>';
}
$html = '<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;font-size:15px">'
  . '<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e3e6eb">'
  . '<div style="background:#0f2a44;color:#fff;padding:16px 20px;font-size:17px"><strong>Nova solicitação de cotação</strong><br>'
  . '<span style="font-size:13px;opacity:.85">Recebida pelo site em ' . $e($agora) . '</span></div>'
  . '<table role="presentation" style="width:100%;border-collapse:collapse;margin:8px 0">' . $tr . '</table>'
  . '<div style="padding:12px 20px 4px">'
  . '<a href="' . $e($waLink) . '" style="display:inline-block;background:#1f8f4e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;margin:0 8px 8px 0">Abrir no WhatsApp</a>'
  . '<a href="mailto:' . $e($d['email']) . '?subject=' . rawurlencode('Re: cotação de ' . $d['medicamento']) . '" style="display:inline-block;background:#0f2a44;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;margin:0 8px 8px 0">Responder por e-mail</a>'
  . '</div>'
  . '<div style="padding:12px 20px 16px;font-size:12px;color:#6b7280;line-height:1.5;border-top:1px solid #eceef2">'
  . 'Origem: ' . $e($origem) . ' (' . $e($pagina) . ')<br>'
  . 'Aceite da Política de Privacidade: sim — registrado pelo servidor em ' . $e(date('d/m/Y H:i:s'))
  . ($aceiteNav !== '' ? ' (navegador: ' . $e($aceiteNav) . ')' : '') . '<br>'
  . 'Contém dados de saúde (LGPD, art. 11). Não encaminhe para fora da equipe de atendimento.'
  . '</div></div></body></html>';

$texto = "Nova solicitação de cotação — recebida pelo site em $agora\n\n"
  . "Nome: {$d['nome']}\nE-mail: {$d['email']}\nWhatsApp: $wDisplay  ($waLink)\n"
  . "Medicamento: {$d['medicamento']}\nPossui receita: $receita\nMensagem: $msg\n\n"
  . "Origem: $origem ($pagina)\n"
  . 'Aceite da Política de Privacidade: sim — registrado pelo servidor em ' . date('d/m/Y H:i:s')
  . ($aceiteNav !== '' ? " (navegador: $aceiteNav)" : '') . "\n"
  . "Contém dados de saúde (LGPD, art. 11). Não encaminhe para fora da equipe de atendimento.\n";

// ---- Envio ----
require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

$m = new PHPMailer\PHPMailer\PHPMailer(true);
try {
  $m->isSMTP();
  $m->Host = (string)$cfg['smtp_host'];
  $m->Port = (int)($cfg['smtp_port'] ?? 465);
  $secure = (string)($cfg['smtp_secure'] ?? 'ssl');
  $m->SMTPSecure = $secure === 'ssl' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                 : ($secure === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : '');
  $m->SMTPAutoTLS = $secure !== '';
  $m->SMTPAuth = true;
  $m->Username = (string)$cfg['smtp_user'];
  $m->Password = (string)$cfg['smtp_pass'];
  $m->Timeout = 15;
  $m->CharSet = 'UTF-8';
  $m->Encoding = 'base64';
  $m->setLanguage('pt_br');

  $m->setFrom((string)($cfg['from_email'] ?? $cfg['smtp_user']), (string)($cfg['from_name'] ?? 'Site Pharma Minas'));
  foreach ((array)$cfg['to'] as $to) $m->addAddress((string)$to);
  foreach ((array)($cfg['bcc'] ?? []) as $bcc) $m->addBCC((string)$bcc);
  $m->addReplyTo($d['email'], $oneLine($d['nome']));

  $m->Subject = $assunto;
  $m->isHTML(true);
  $m->Body = $html;
  $m->AltBody = $texto;
  $m->send();
} catch (Throwable $ex) {
  error_log('[cotacao] falha no envio SMTP: ' . $m->ErrorInfo . ' | ' . $ex->getMessage());
  out(502, ['ok' => false, 'error' => 'send_failed']);
}

out(200, ['ok' => true]);
