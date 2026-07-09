/* Conjigul integrations OAuth callback — vanilla JS. */
'use strict';

const TOKEN_KEY_PREFIX = 'conjigul_integration_tokens:';
const PENDING_KEY = 'conjigul_integration_pending';

function saveTokens(id, tokens) {
  localStorage.setItem(TOKEN_KEY_PREFIX + id, JSON.stringify(tokens));
}

function showError(message) {
  const card = document.getElementById('callbackStatus');
  if (!card) return;
  card.classList.add('error');
  card.innerHTML = '';
  const h1 = document.createElement('h1');
  h1.textContent = 'Connection failed';
  const p = document.createElement('p');
  p.textContent = message;
  const back = document.createElement('p');
  back.style.marginTop = '1rem';
  const link = document.createElement('a');
  link.href = '/integrations';
  link.textContent = 'Back to integrations';
  link.style.color = '#a78bfa';
  back.appendChild(link);
  card.appendChild(h1);
  card.appendChild(p);
  card.appendChild(back);
}

async function complete() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error) {
    showError(params.get('error_description') || error);
    return;
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) {
    showError('Missing authorization code in callback URL.');
    return;
  }

  const rawPending = sessionStorage.getItem(PENDING_KEY);
  if (!rawPending) {
    showError('No pending OAuth flow found in this browser tab.');
    return;
  }

  let pending;
  try {
    pending = JSON.parse(rawPending);
  } catch {
    sessionStorage.removeItem(PENDING_KEY);
    showError('Pending OAuth state is corrupted.');
    return;
  }
  sessionStorage.removeItem(PENDING_KEY);

  if (pending.state !== state) {
    showError('OAuth state mismatch — possible tampering. Try connecting again.');
    return;
  }

  try {
    const response = await fetch('/api/integrations/oauth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        codeVerifier: pending.codeVerifier,
        redirectUri: pending.redirectUri,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Token exchange failed.');
    }
    saveTokens(pending.id, data);
    window.location.replace(pending.returnTo || '/integrations');
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
}

complete();
