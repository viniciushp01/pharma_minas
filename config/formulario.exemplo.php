<?php
/**
 * Configuração do envio do formulário de cotação — Pharma Minas
 *
 * ONDE COLOCAR ESTE ARQUIVO (importante):
 *   1) Renomeie para  formulario.php
 *   2) No Gerenciador de Arquivos do cPanel, crie a pasta  pharmaminas-config  FORA do public_html,
 *      ou seja, ao lado dela:
 *        /home/SEU_USUARIO/public_html/            ← site
 *        /home/SEU_USUARIO/pharmaminas-config/     ← esta pasta
 *   3) Envie o arquivo para dentro dela:  /home/SEU_USUARIO/pharmaminas-config/formulario.php
 *   4) Permissões: pasta 0700, arquivo 0600.
 *
 * Assim ninguém consegue abrir este arquivo pelo navegador.
 */
return [
  // Caixa de e-mail criada no cPanel só para o site enviar (não use a compras@ aqui)
  'smtp_host'   => 'mail.pharmaminas.com.br',   // cPanel > E-mail Accounts > Connect Devices > "Outgoing Server"
  'smtp_port'   => 465,                         // 465 com 'ssl' (padrão do cPanel) ou 587 com 'tls'
  'smtp_secure' => 'ssl',
  'smtp_user'   => 'site@pharmaminas.com.br',
  'smtp_pass'   => 'COLE_A_SENHA_AQUI',

  // Remetente que aparece no e-mail recebido
  'from_email'  => 'site@pharmaminas.com.br',
  'from_name'   => 'Site Pharma Minas',

  // Quem recebe os pedidos (pode ter mais de um endereço)
  'to'          => ['compras@pharmaminas.com.br'],
  'bcc'         => [],

  // Limite contra abuso: no máximo 5 envios por IP a cada 10 minutos (0 desliga)
  'rate_limit'      => 5,
  'rate_window_sec' => 600,

  'timezone'    => 'America/Sao_Paulo',
];
