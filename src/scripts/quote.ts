// Comportamento do formulário de cotação (todas as instâncias) e do modal.
type Errors = Record<string, string>;

const MSG = {
  nome: 'Informe o seu nome completo.',
  email: 'Informe um e-mail válido, como nome@exemplo.com.',
  whatsapp: 'Informe o WhatsApp com DDD, por exemplo (31) 99999-9999.',
  medicamento: 'Informe o medicamento que você procura.',
  receita: 'Escolha uma opção.',
  lgpd: 'Para enviar, aceite a Política de Privacidade.',
};

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(f: HTMLFormElement): Errors {
  const v = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement | null)?.value || '').trim();
  const e: Errors = {};
  if (v('nome').length < 3 || !/\S+\s+\S+/.test(v('nome'))) e.nome = MSG.nome;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) e.email = MSG.email;
  const digits = v('whatsapp').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) e.whatsapp = MSG.whatsapp;
  if (v('medicamento').length < 2) e.medicamento = MSG.medicamento;
  if (!f.querySelector<HTMLInputElement>('input[name="receita"]:checked')) e.receita = MSG.receita;
  if (!(f.elements.namedItem('lgpd') as HTMLInputElement).checked) e.lgpd = MSG.lgpd;
  return e;
}

function showErrors(f: HTMLFormElement, e: Errors) {
  f.querySelectorAll<HTMLElement>('[data-error-for]').forEach((p) => {
    const name = p.dataset.errorFor!;
    const msg = e[name];
    p.textContent = msg || '';
    p.classList.toggle('is-on', !!msg);
    const ctrl = f.querySelector<HTMLElement>(`[name="${name}"]`);
    if (name === 'receita') return;
    ctrl?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  });
}

function initForm(root: HTMLElement) {
  const f = root.querySelector<HTMLFormElement>('[data-quote-form]')!;
  const success = root.querySelector<HTMLElement>('[data-quote-success]')!;
  const errBox = root.querySelector<HTMLElement>('[data-form-error]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const btn = f.querySelector<HTMLButtonElement>('[data-submit]')!;
  const lbl = btn.querySelector<HTMLElement>('[data-submit-label]')!;
  const busy = btn.querySelector<HTMLElement>('[data-submit-busy]')!;
  const demo = root.dataset.demo === 'true';
  const endpoint = root.dataset.endpoint || '';
  let touched = false;

  (f.querySelector('[data-field-page]') as HTMLInputElement).value = location.pathname;
  (f.querySelector('[data-field-ts]') as HTMLInputElement).value = String(Date.now());

  f.querySelectorAll<HTMLInputElement>('[data-mask="phone"]').forEach((i) =>
    i.addEventListener('input', () => { i.value = maskPhone(i.value); }));

  // depois da primeira tentativa, revalida enquanto a pessoa corrige
  f.addEventListener('input', () => { if (touched) showErrors(f, validate(f)); });
  f.addEventListener('change', () => { if (touched) showErrors(f, validate(f)); });

  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    touched = true;
    errBox.hidden = true;
    const errors = validate(f);
    showErrors(f, errors);
    const keys = Object.keys(errors);
    if (keys.length) {
      status.textContent = keys.length === 1 ? 'Há 1 campo para corrigir.' : `Há ${keys.length} campos para corrigir.`;
      const first = f.querySelector<HTMLElement>(keys[0] === 'receita' ? 'input[name="receita"]' : `[name="${keys[0]}"]`);
      first?.focus();
      return;
    }
    (f.querySelector('[data-field-consent-at]') as HTMLInputElement).value = new Date().toISOString();
    btn.disabled = true; lbl.hidden = true; busy.hidden = false; f.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando…';
    try {
      if (demo) { await new Promise((r) => setTimeout(r, 900)); }
      else {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      }
      f.hidden = true; success.hidden = false; success.focus();
      status.textContent = 'Pedido enviado.';
      document.dispatchEvent(new CustomEvent('quote:sent'));
    } catch (err) {
      console.warn('[cotação] falha no envio:', err);
      errBox.hidden = false; errBox.scrollIntoView({ block: 'nearest' });
      status.textContent = 'Não foi possível enviar o pedido.';
    } finally {
      btn.disabled = false; lbl.hidden = false; busy.hidden = true; f.removeAttribute('aria-busy');
    }
  });

  root.addEventListener('quote:reset', () => {
    f.reset(); f.hidden = false; success.hidden = true; errBox.hidden = true; touched = false; showErrors(f, {});
  });
}

document.querySelectorAll<HTMLElement>('[data-quote-root]').forEach(initForm);

// ---- Modal ----
const dlg = document.getElementById('quote-modal') as HTMLDialogElement | null;
if (dlg) {
  let opener: HTMLElement | null = null;
  const open = (from?: HTMLElement) => {
    opener = from || (document.activeElement as HTMLElement);
    // se o formulário já foi enviado antes, volta ao estado inicial
    dlg.querySelector('[data-quote-root]')?.dispatchEvent(new CustomEvent('quote:reset'));
    if (!dlg.open) dlg.showModal();
    document.body.classList.add('is-locked');
    dlg.querySelector<HTMLElement>('input[name="nome"]')?.focus();
  };
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => { document.body.classList.remove('is-locked'); opener?.focus(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); }); // clique no overlay
  dlg.querySelectorAll('[data-close-quote]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-open-quote]');
    if (!t) return;
    e.preventDefault();
    open(t);
  });
  if (location.hash === '#solicitar-cotacao') open();
}
