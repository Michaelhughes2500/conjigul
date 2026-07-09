/* Conjigul integrations panel — vanilla JS, no framework. */
'use strict';

const PROVIDERS = [
  {
    id: 'google-classroom',
    label: 'Google Classroom',
    description: 'Share Conjigul community updates as Classroom announcements.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.announcements',
    ],
  },
  {
    id: 'google-docs',
    label: 'Google Docs',
    description: 'Export your friends list or gallery captions to a Google Doc.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file',
    ],
  },
  {
    id: 'google-forms',
    label: 'Google Forms',
    description: 'Generate an RSVP or contact form from a Conjigul template.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/drive.file',
    ],
  },
  {
    id: 'google-keep',
    label: 'Google Keep',
    description: 'Push quick reminders to Keep (Workspace + service account required).',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/keep'],
  },
];

const TOKEN_KEY_PREFIX = 'conjigul_integration_tokens:';
const PENDING_KEY = 'conjigul_integration_pending';

function tokenKey(id) {
  return TOKEN_KEY_PREFIX + id;
}

function loadTokens(id) {
  try {
    const raw = localStorage.getItem(tokenKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(id, tokens) {
  localStorage.setItem(tokenKey(id), JSON.stringify(tokens));
}

function clearTokens(id) {
  localStorage.removeItem(tokenKey(id));
}

function randomBase64Url(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  let str = btoa(String.fromCharCode(...arr));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256Base64Url(input) {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  let str = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let cachedClientId = null;
async function getClientId() {
  if (cachedClientId !== null) return cachedClientId;
  const r = await fetch('/api/integrations/config');
  const data = await r.json();
  cachedClientId = data.clientId || '';
  return cachedClientId;
}

async function startConnect(provider) {
  const clientId = await getClientId();
  if (!clientId) {
    throw new Error('Google OAuth client id is not configured. Set GOOGLE_OAUTH_CLIENT_ID in the server environment.');
  }
  const redirectUri = `${window.location.origin}/integrations/callback`;
  const state = randomBase64Url(16);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  const pending = {
    id: provider.id,
    state,
    codeVerifier,
    redirectUri,
    returnTo: '/integrations',
  };
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  const url = new URL(provider.authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', provider.scopes.join(' '));
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  window.location.assign(url.toString());
}

function isExpired(tokens) {
  if (!tokens || !tokens.expiresAt) return true;
  return Date.now() > tokens.expiresAt - 60_000;
}

function setStatus(message, kind) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = message || '';
  el.className = 'integrations-status' + (kind ? ' ' + kind : '');
}

function renderCards() {
  const grid = document.getElementById('integrationsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const provider of PROVIDERS) {
    const tokens = loadTokens(provider.id);
    const connected = !!tokens && !isExpired(tokens);

    const card = document.createElement('article');
    card.className = 'integration-card';
    card.innerHTML = `
      <div class="integration-card-header">
        <h2 class="integration-card-title"></h2>
        <span class="integration-card-status ${connected ? 'connected' : ''}"></span>
      </div>
      <p class="integration-card-description"></p>
      <div class="integration-card-actions"></div>
    `;
    card.querySelector('.integration-card-title').textContent = provider.label;
    card.querySelector('.integration-card-status').textContent = connected ? 'Connected' : 'Not connected';
    card.querySelector('.integration-card-description').textContent = provider.description;

    const actions = card.querySelector('.integration-card-actions');
    if (connected) {
      const disconnect = document.createElement('button');
      disconnect.type = 'button';
      disconnect.className = 'button button--ghost';
      disconnect.textContent = 'Disconnect';
      disconnect.addEventListener('click', () => {
        clearTokens(provider.id);
        setStatus(`${provider.label} disconnected.`, 'success');
        renderCards();
      });
      actions.appendChild(disconnect);
    } else {
      const connect = document.createElement('button');
      connect.type = 'button';
      connect.className = 'button';
      connect.textContent = 'Connect';
      connect.addEventListener('click', async () => {
        try {
          connect.disabled = true;
          connect.textContent = 'Redirecting…';
          await startConnect(provider);
        } catch (err) {
          connect.disabled = false;
          connect.textContent = 'Connect';
          setStatus(err instanceof Error ? err.message : String(err), 'error');
        }
      });
      actions.appendChild(connect);
    }
    grid.appendChild(card);
  }
}

window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith(TOKEN_KEY_PREFIX)) {
    renderCards();
  }
});

renderCards();
