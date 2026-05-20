const storageKeys = {
  profile: 'reconnect:profile',
  people: 'reconnect:people',
  customResources: 'reconnect:customResources',
  savedResources: 'reconnect:savedResources',
  checkins: 'reconnect:checkins',
  plan: 'reconnect:plan',
};

const seedResources = [
  {
    id: 'resource-211',
    name: '211 Community Resource Line',
    category: 'Any Need',
    city: 'United States',
    mode: 'Call or online',
    contact: 'Dial 211 or visit 211.org',
    url: 'https://www.211.org/',
    trusted: true,
    details: 'Local referrals for housing, food, utilities, transportation, legal help, and other non-emergency needs.',
    tags: ['housing', 'food', 'utilities', 'local navigator'],
  },
  {
    id: 'resource-hud-shelter',
    name: 'HUD Find Shelter',
    category: 'Housing',
    city: 'United States',
    mode: 'Online locator',
    contact: 'hud.gov/findshelter',
    url: 'https://www.hud.gov/findshelter',
    trusted: true,
    details: 'Search shelter, food pantry, health clinic, and clothing resources by location.',
    tags: ['shelter', 'food', 'health clinic', 'clothing'],
  },
  {
    id: 'resource-careeronestop',
    name: 'CareerOneStop American Job Center Finder',
    category: 'Work',
    city: 'United States',
    mode: 'Online locator',
    contact: 'careeronestop.org',
    url: 'https://www.careeronestop.org/',
    trusted: true,
    details: 'Find job centers, training referrals, career counseling, and job search help.',
    tags: ['jobs', 'training', 'resume', 'workforce'],
  },
  {
    id: 'resource-dol-reentry',
    name: 'U.S. Department of Labor Reentry Resources',
    category: 'Work',
    city: 'United States',
    mode: 'Online guide',
    contact: 'dol.gov reentry resources',
    url: 'https://www.dol.gov/agencies/eta/reentry/resources',
    trusted: true,
    details: 'Employment resources for people with records, including job centers, bonding, and employer incentives.',
    tags: ['reentry', 'federal bonding', 'employment', 'training'],
  },
  {
    id: 'resource-lsc',
    name: 'Legal Services Corporation Legal Aid Finder',
    category: 'Legal',
    city: 'United States',
    mode: 'Online locator',
    contact: 'lsc.gov',
    url: 'https://www.lsc.gov/about-lsc/what-legal-aid/i-need-legal-help',
    trusted: true,
    details: 'Find civil legal aid organizations for housing, benefits, family, consumer, and other civil issues.',
    tags: ['civil legal aid', 'housing law', 'benefits', 'family law'],
  },
  {
    id: 'resource-samhsa',
    name: 'SAMHSA National Helpline',
    category: 'Health',
    city: 'United States',
    mode: 'Call or online',
    contact: '1-800-662-HELP (4357)',
    url: 'https://www.samhsa.gov/find-help/helplines/national-helpline',
    trusted: true,
    details: 'Confidential treatment referral and information for mental health, drug, and alcohol support.',
    tags: ['recovery', 'mental health', 'treatment locator', 'substance use'],
  },
  {
    id: 'resource-doj-reentry',
    name: 'Justice Department Reentry Resources',
    category: 'Supervision',
    city: 'United States',
    mode: 'Online guide',
    contact: 'justice.gov/reentry',
    url: 'https://www.justice.gov/reentry',
    trusted: true,
    details: 'National reentry information and links for returning citizens, families, and communities.',
    tags: ['reentry', 'supervision', 'planning', 'community'],
  },
  {
    id: 'resource-findhelp',
    name: 'Findhelp Social Care Search',
    category: 'Any Need',
    city: 'United States',
    mode: 'Online locator',
    contact: 'findhelp.org',
    url: 'https://www.findhelp.org/',
    trusted: true,
    details: 'Search free or reduced-cost support for food, housing, transit, health care, money, care, education, and work.',
    tags: ['food', 'housing', 'transportation', 'health care'],
  },
];

const goalLibrary = {
  Housing: [
    'Save one housing resource and call before noon.',
    'Ask what documents are required for intake.',
    'Write down the next appointment, address, and backup option.',
  ],
  Work: [
    'Find one American Job Center or workforce program near your city.',
    'Prepare a short record-aware work story focused on accountability and skills.',
    'Apply to two second-chance or background-friendly roles.',
  ],
  Legal: [
    'Use the legal aid finder for civil issues like housing, benefits, family, or debt.',
    'Collect case numbers, deadlines, letters, and supervision documents in one folder.',
    'Confirm advice with a qualified legal professional before acting.',
  ],
  Health: [
    'Save a treatment, recovery, or counseling resource.',
    'Pick one support meeting, clinic, or check-in time for this week.',
    'Create a trigger interrupt plan before stress peaks.',
  ],
  Family: [
    'Send one honest, low-pressure message to a safe family contact.',
    'Ask for one specific support action instead of a vague favor.',
    'Set a boundary that protects sobriety, curfew, work, or supervision.',
  ],
  Supervision: [
    'Confirm reporting dates, curfew rules, travel limits, and payment expectations.',
    'Put every supervision deadline on your calendar.',
    'Send a proactive update when a barrier appears instead of waiting.',
  ],
};

const barrierLibrary = {
  'no-id': 'Start with documents: ID, birth certificate, Social Security card, release paperwork, and proof of address.',
  'no-transport': 'Plan transportation first: bus route, ride contact, gas help, bike route, or virtual appointment.',
  'background-check': 'Prepare a direct background statement with proof of growth, work history, certificates, and references.',
  curfew: 'Protect compliance: schedule every appointment inside approved hours and confirm travel rules.',
  stress: 'Lower risk before action: eat, hydrate, breathe, call support, and move to a safe place.',
  money: 'Stabilize the gap: ask about emergency aid, day labor rules, benefit screening, food support, and fee plans.',
};

const riskLibrary = {
  'old-crew': ['Do not debate by text.', 'Move to a public safe place.', 'Call a mentor and name the pressure out loud.'],
  anger: ['Step away for ten minutes.', 'Use a cold-water reset or breathing drill.', 'Send one accountable message instead of reacting.'],
  substance: ['Leave the location.', 'Call recovery support or SAMHSA.', 'Remove cash access until the urge drops.'],
  money: ['Delay the decision for one hour.', 'Call a workforce or emergency aid resource.', 'Ask a trusted person to review the option.'],
  lonely: ['Go where people are safe.', 'Schedule a short call.', 'Do one task that moves housing, work, or health forward.'],
};

const state = {
  profile: loadObject(storageKeys.profile, { name: '', city: '', goal: 'Housing' }),
  people: loadArray(storageKeys.people),
  customResources: loadArray(storageKeys.customResources),
  savedResources: loadArray(storageKeys.savedResources),
  checkins: loadArray(storageKeys.checkins),
  plan: loadArray(storageKeys.plan),
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSharedActions();
  registerServiceWorker();

  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'directory') initDirectory();
  if (page === 'programs') initPrograms();

  refreshIcons();
});

function $(selector, scope = document) {
  return scope.querySelector(selector);
}

function $all(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function loadArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Could not parse ${key}`, error);
    return [];
  }
}

function loadObject(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return { ...fallback };
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...fallback, ...value } : { ...fallback };
  } catch (error) {
    console.warn(`Could not parse ${key}`, error);
    return { ...fallback };
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function persist() {
  save(storageKeys.profile, state.profile);
  save(storageKeys.people, state.people);
  save(storageKeys.customResources, state.customResources);
  save(storageKeys.savedResources, state.savedResources);
  save(storageKeys.checkins, state.checkins);
  save(storageKeys.plan, state.plan);
}

function uniqueId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function formatDate(timestamp) {
  if (!timestamp) return 'Not logged';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

function dateKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak() {
  const days = new Set(state.checkins.map((item) => item.day));
  let streak = 0;
  const cursor = new Date();
  while (days.has(dateKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getAllResources() {
  return [...seedResources, ...state.customResources];
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return '';
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('toast--visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('toast--visible'), 2600);
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

function initNavigation() {
  const current = location.pathname.split('/').pop() || 'index.html';
  $all('.site-nav a').forEach((link) => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });
}

function initSharedActions() {
  document.body.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;

    const { action, id } = trigger.dataset;
    if (action === 'toggle-nav') {
      document.body.classList.toggle('nav-open');
      return;
    }
    if (action === 'save-resource') saveResource(id);
    if (action === 'unsave-resource') unsaveResource(id);
    if (action === 'remove-person') removePerson(id);
    if (action === 'check-person') checkPerson(id);
    if (action === 'remove-custom-resource') removeCustomResource(id);
    if (action === 'clear-filters') clearFilters();
  });
}

function initHome() {
  hydrateProfileForm();

  $('#profile-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.profile = {
      name: $('#profile-name').value.trim(),
      city: $('#profile-city').value.trim(),
      goal: $('#profile-goal').value,
    };
    persist();
    renderHome();
    showToast('Profile saved.');
  });

  $('#quick-connection-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    addPerson({
      name: $('#quick-name').value.trim(),
      role: $('#quick-role').value,
      contact: $('#quick-contact').value.trim(),
      city: state.profile.city,
      notes: 'Added from the home dashboard.',
    });
    form.reset();
    renderHome();
    showToast('Person added to your reconnect circle.');
  });

  $('#home-checkin-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const mood = new FormData(form).get('mood') || 'steady';
    const nextMove = $('#home-next-move').value.trim() || 'Protect tomorrow with one steady action.';
    addCheckin({ mood, trigger: 'daily', move: nextMove });
    form.reset();
    form.querySelector('input[value="steady"]').checked = true;
    renderHome();
    showToast('Check-in logged.');
  });

  $('#home-search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = $('#home-search').value.trim();
    if (query) sessionStorage.setItem('reconnect:pendingSearch', query);
    location.href = 'directory.html';
  });

  $('#home-search')?.addEventListener('input', renderHomeResources);

  renderHome();
}

function initDirectory() {
  const pendingSearch = sessionStorage.getItem('reconnect:pendingSearch');
  if (pendingSearch && $('#resource-search')) {
    $('#resource-search').value = pendingSearch;
    sessionStorage.removeItem('reconnect:pendingSearch');
  }

  if (state.profile.city && $('#resource-location') && !$('#resource-location').value) {
    $('#resource-location').value = state.profile.city;
  }

  $('#directory-filters')?.addEventListener('input', renderDirectory);
  $('#people-search')?.addEventListener('input', renderDirectory);

  $('#person-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    addPerson({
      name: $('#person-name').value.trim(),
      role: $('#person-role').value,
      contact: $('#person-contact').value.trim(),
      city: $('#person-city').value.trim(),
      notes: $('#person-notes').value.trim(),
    });
    form.reset();
    renderDirectory();
    showToast('Trusted person saved.');
  });

  $('#custom-resource-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const contact = $('#custom-resource-contact').value.trim();
    const resource = {
      id: uniqueId('custom-resource'),
      name: $('#custom-resource-name').value.trim(),
      category: $('#custom-resource-category').value,
      city: $('#custom-resource-city').value.trim() || 'Local',
      mode: normalizeUrl(contact) ? 'Online or direct' : 'Direct contact',
      contact,
      url: normalizeUrl(contact),
      trusted: false,
      details: 'Local provider added by this browser. Verify eligibility, hours, and requirements before referral.',
      tags: ['local', 'user-added'],
    };
    if (!resource.name || !resource.contact) return;
    state.customResources.unshift(resource);
    persist();
    form.reset();
    renderDirectory();
    showToast('Local resource added.');
  });

  renderDirectory();
}

function initPrograms() {
  $('#plan-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    generatePlan(event.currentTarget);
    renderPrograms();
    showToast('Freedom plan generated.');
  });

  $('#message-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = composeMessage(event.currentTarget);
    $('#message-output').value = message;
    showToast('Message drafted.');
  });

  $('#loop-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const trigger = $('#loop-trigger').value;
    const move = $('#loop-move').value.trim() || riskLibrary[trigger][0];
    addCheckin({ mood: 'risk interrupt', trigger, move });
    $('#loop-move').value = '';
    renderPrograms();
    showToast('Risk interrupt saved.');
  });

  $('#loop-trigger')?.addEventListener('change', renderRiskBoard);

  renderPrograms();
}

function hydrateProfileForm() {
  if ($('#profile-name')) $('#profile-name').value = state.profile.name || '';
  if ($('#profile-city')) $('#profile-city').value = state.profile.city || '';
  if ($('#profile-goal')) $('#profile-goal').value = state.profile.goal || 'Housing';
}

function renderHome() {
  renderStats();
  renderTodaySummary();
  renderHomeResources();
  renderHomeCircle();
  refreshIcons();
}

function renderStats() {
  const statPeople = $('#stat-people');
  const statResources = $('#stat-resources');
  const statStreak = $('#stat-streak');
  const statPlan = $('#stat-plan');
  if (statPeople) statPeople.textContent = state.people.length;
  if (statResources) statResources.textContent = state.savedResources.length;
  if (statStreak) statStreak.textContent = calculateStreak();
  if (statPlan) statPlan.textContent = state.plan.length;
}

function renderTodaySummary() {
  const target = $('#today-summary');
  if (!target) return;
  const name = state.profile.name || 'Your plan';
  const goal = state.profile.goal || 'Housing';
  target.textContent = `${name}: focus on ${goal.toLowerCase()} and one verified connection today.`;
}

function renderHomeResources() {
  const container = $('#home-resource-results');
  if (!container) return;
  const query = ($('#home-search')?.value || state.profile.goal || '').toLowerCase();
  const matches = getAllResources()
    .filter((resource) => resourceMatches(resource, { query, category: 'All', location: '' }))
    .slice(0, 4);
  renderResourceCards(container, matches.length ? matches : getAllResources().slice(0, 4));
}

function renderHomeCircle() {
  const container = $('#home-circle-list');
  if (!container) return;
  if (!state.people.length) {
    container.innerHTML = emptyState('Add a mentor, family contact, case manager, or work lead to begin.');
    return;
  }
  container.innerHTML = state.people.slice(0, 4).map((person) => `
    <article class="person-row">
      <span class="avatar">${escapeHtml(initials(person.name))}</span>
      <div>
        <strong>${escapeHtml(person.name)}</strong>
        <small>${escapeHtml(person.role)} | ${escapeHtml(person.contact)}</small>
      </div>
      <button class="icon-button" type="button" data-action="check-person" data-id="${escapeAttr(person.id)}" aria-label="Log check-in with ${escapeAttr(person.name)}">
        <i data-lucide="phone-call"></i>
      </button>
    </article>
  `).join('');
}

function renderDirectory() {
  const filters = {
    query: ($('#resource-search')?.value || '').toLowerCase(),
    category: $('#resource-category')?.value || 'All',
    location: ($('#resource-location')?.value || '').toLowerCase(),
  };
  const resources = getAllResources()
    .filter((resource) => resourceMatches(resource, filters))
    .sort((a, b) => Number(b.trusted) - Number(a.trusted));

  const count = $('#resource-count');
  if (count) count.textContent = resources.length;
  renderResourceCards($('#resource-grid'), resources);
  renderPeople();
  renderSavedResources();
  refreshIcons();
}

function resourceMatches(resource, filters) {
  const haystack = [
    resource.name,
    resource.category,
    resource.city,
    resource.mode,
    resource.contact,
    resource.details,
    ...(resource.tags || []),
  ].join(' ').toLowerCase();
  const queryMatch = !filters.query || haystack.includes(filters.query);
  const categoryMatch = filters.category === 'All' || resource.category === filters.category;
  const locationMatch = !filters.location || resource.city.toLowerCase().includes(filters.location) || resource.mode.toLowerCase().includes(filters.location) || resource.city === 'United States';
  return queryMatch && categoryMatch && locationMatch;
}

function renderResourceCards(container, resources) {
  if (!container) return;
  if (!resources.length) {
    container.innerHTML = emptyState('No matches yet. Clear filters or add a local resource.');
    return;
  }

  container.innerHTML = resources.map((resource) => {
    const saved = state.savedResources.includes(resource.id);
    const isCustom = resource.id.startsWith('custom-resource');
    const url = normalizeUrl(resource.url);
    return `
      <article class="resource-card">
        <div class="resource-card__top">
          <span class="tag">${escapeHtml(resource.category)}</span>
          ${resource.trusted ? '<span class="trust-badge"><i data-lucide="badge-check"></i> Verified starter</span>' : '<span class="trust-badge trust-badge--local"><i data-lucide="map-pin"></i> Local draft</span>'}
        </div>
        <h3>${escapeHtml(resource.name)}</h3>
        <p>${escapeHtml(resource.details)}</p>
        <div class="resource-meta">
          <span><i data-lucide="map-pin"></i>${escapeHtml(resource.city)}</span>
          <span><i data-lucide="route"></i>${escapeHtml(resource.mode)}</span>
          <span><i data-lucide="contact"></i>${escapeHtml(resource.contact)}</span>
        </div>
        <div class="tag-list">
          ${(resource.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="button button--small ${saved ? 'button--ghost' : ''}" type="button" data-action="${saved ? 'unsave-resource' : 'save-resource'}" data-id="${escapeAttr(resource.id)}">
            <i data-lucide="${saved ? 'check' : 'bookmark'}"></i>
            <span>${saved ? 'Saved' : 'Save'}</span>
          </button>
          ${url ? `<a class="button button--small button--dark" href="${escapeAttr(url)}" target="_blank" rel="noopener"><i data-lucide="external-link"></i><span>Open</span></a>` : ''}
          ${isCustom ? `<button class="icon-button" type="button" data-action="remove-custom-resource" data-id="${escapeAttr(resource.id)}" aria-label="Remove ${escapeAttr(resource.name)}"><i data-lucide="trash-2"></i></button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function renderPeople() {
  const container = $('#people-list');
  if (!container) return;
  const query = ($('#people-search')?.value || '').toLowerCase();
  const people = state.people.filter((person) => {
    const haystack = [person.name, person.role, person.contact, person.city, person.notes].join(' ').toLowerCase();
    return !query || haystack.includes(query);
  });

  if (!people.length) {
    container.innerHTML = emptyState('Your trusted circle is empty. Add the first person from the left panel.');
    return;
  }

  container.innerHTML = people.map((person) => `
    <article class="person-card">
      <span class="avatar">${escapeHtml(initials(person.name))}</span>
      <div class="person-card__body">
        <div>
          <h3>${escapeHtml(person.name)}</h3>
          <p>${escapeHtml(person.role)} | ${escapeHtml(person.city || 'Location not set')}</p>
        </div>
        <p class="person-card__contact">${escapeHtml(person.contact)}</p>
        <p>${escapeHtml(person.notes || 'No notes yet.')}</p>
        <small>Last check-in: ${escapeHtml(formatDate(person.lastContact))}</small>
      </div>
      <div class="person-card__actions">
        <button class="icon-button" type="button" data-action="check-person" data-id="${escapeAttr(person.id)}" aria-label="Log contact with ${escapeAttr(person.name)}">
          <i data-lucide="phone-call"></i>
        </button>
        <button class="icon-button" type="button" data-action="remove-person" data-id="${escapeAttr(person.id)}" aria-label="Remove ${escapeAttr(person.name)}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `).join('');
}

function renderSavedResources() {
  const container = $('#saved-resources-list');
  if (!container) return;
  const saved = getAllResources().filter((resource) => state.savedResources.includes(resource.id));
  if (!saved.length) {
    container.innerHTML = emptyState('Saved resources appear here for faster follow-up.');
    return;
  }
  container.innerHTML = saved.map((resource) => `
    <article class="saved-item">
      <i data-lucide="bookmark-check"></i>
      <div>
        <strong>${escapeHtml(resource.name)}</strong>
        <small>${escapeHtml(resource.category)} | ${escapeHtml(resource.contact)}</small>
      </div>
      <button class="icon-button" type="button" data-action="unsave-resource" data-id="${escapeAttr(resource.id)}" aria-label="Remove saved resource">
        <i data-lucide="x"></i>
      </button>
    </article>
  `).join('');
}

function renderPrograms() {
  renderPlan();
  renderRiskBoard();
  renderCheckins();
  refreshIcons();
}

function renderPlan() {
  const container = $('#plan-output');
  if (!container) return;
  if (!state.plan.length) {
    container.innerHTML = emptyState('Generate a plan to see your next steps.');
    return;
  }
  container.innerHTML = state.plan.map((step) => `
    <article class="plan-step">
      <span>${escapeHtml(step.order)}</span>
      <div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.detail)}</p>
        <small>${escapeHtml(step.horizon)} | ${escapeHtml(step.resourceHint)}</small>
      </div>
    </article>
  `).join('');
}

function renderRiskBoard() {
  const board = $('#risk-board');
  if (!board) return;
  const trigger = $('#loop-trigger')?.value || 'old-crew';
  const actions = riskLibrary[trigger] || riskLibrary['old-crew'];
  board.innerHTML = `
    <p class="risk-title">If this shows up, run the interrupt:</p>
    <ol>
      ${actions.map((action) => `<li>${escapeHtml(action)}</li>`).join('')}
    </ol>
  `;
}

function renderCheckins() {
  const feed = $('#checkin-feed');
  if (!feed) return;
  const recent = state.checkins.slice(0, 6);
  if (!recent.length) {
    feed.innerHTML = emptyState('No check-ins yet. Log one from the dashboard or risk interrupt.');
    return;
  }
  feed.innerHTML = recent.map((item) => `
    <article class="checkin-item">
      <span>${escapeHtml(formatDate(item.createdAt))}</span>
      <strong>${escapeHtml(item.mood)}</strong>
      <p>${escapeHtml(item.move)}</p>
    </article>
  `).join('');
}

function addPerson(person) {
  if (!person.name || !person.contact) return;
  state.people.unshift({
    id: uniqueId('person'),
    name: person.name,
    role: person.role || 'Trusted contact',
    contact: person.contact,
    city: person.city || '',
    notes: person.notes || '',
    createdAt: Date.now(),
    lastContact: null,
  });
  persist();
}

function addCheckin(entry) {
  state.checkins.unshift({
    id: uniqueId('checkin'),
    mood: entry.mood,
    trigger: entry.trigger,
    move: entry.move,
    createdAt: Date.now(),
    day: dateKey(),
  });
  state.checkins = state.checkins.slice(0, 60);
  persist();
}

function saveResource(id) {
  if (!id || state.savedResources.includes(id)) return;
  state.savedResources.unshift(id);
  persist();
  rerenderCurrentPage();
  showToast('Resource saved.');
}

function unsaveResource(id) {
  state.savedResources = state.savedResources.filter((item) => item !== id);
  persist();
  rerenderCurrentPage();
  showToast('Resource removed from saved list.');
}

function removePerson(id) {
  state.people = state.people.filter((person) => person.id !== id);
  persist();
  rerenderCurrentPage();
  showToast('Person removed.');
}

function checkPerson(id) {
  const person = state.people.find((item) => item.id === id);
  if (!person) return;
  person.lastContact = Date.now();
  addCheckin({ mood: 'connection', trigger: 'trusted circle', move: `Checked in with ${person.name}.` });
  persist();
  rerenderCurrentPage();
  showToast('Check-in logged.');
}

function removeCustomResource(id) {
  state.customResources = state.customResources.filter((resource) => resource.id !== id);
  state.savedResources = state.savedResources.filter((resourceId) => resourceId !== id);
  persist();
  rerenderCurrentPage();
  showToast('Local resource removed.');
}

function clearFilters() {
  if ($('#resource-search')) $('#resource-search').value = '';
  if ($('#resource-category')) $('#resource-category').value = 'All';
  if ($('#resource-location')) $('#resource-location').value = '';
  renderDirectory();
}

function rerenderCurrentPage() {
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'directory') renderDirectory();
  if (page === 'programs') renderPrograms();
}

function generatePlan(form) {
  const data = new FormData(form);
  const goals = data.getAll('goals');
  const chosenGoals = goals.length ? goals : [state.profile.goal || 'Housing'];
  const barrier = data.get('barrier') || 'no-id';
  const horizon = data.get('time') || '7 days';
  const support = data.get('support') || 'solo';
  const supportText = {
    solo: 'Use saved resources and one low-risk public contact.',
    mentor: 'Ask your mentor to verify the first appointment.',
    family: 'Ask family for one specific action with a clear boundary.',
    'case-manager': 'Send the plan to your case manager and ask what is missing.',
  }[support];

  const steps = [
    {
      title: 'Remove the main barrier',
      detail: barrierLibrary[barrier],
      resourceHint: 'Start with saved resources or 211.',
    },
  ];

  chosenGoals.forEach((goal) => {
    const actions = goalLibrary[goal] || [];
    actions.slice(0, 2).forEach((detail) => {
      steps.push({
        title: `${goal} move`,
        detail,
        resourceHint: bestResourceForGoal(goal),
      });
    });
  });

  steps.push({
    title: 'Accountability ping',
    detail: supportText,
    resourceHint: state.people[0] ? state.people[0].name : 'Add a trusted person in the directory.',
  });

  state.plan = steps.slice(0, 7).map((step, index) => ({
    id: uniqueId('plan'),
    order: index + 1,
    title: step.title,
    detail: step.detail,
    resourceHint: step.resourceHint,
    horizon,
    createdAt: Date.now(),
  }));
  persist();
}

function bestResourceForGoal(goal) {
  const resource = getAllResources().find((item) => item.category === goal) || getAllResources().find((item) => item.category === 'Any Need');
  return resource ? resource.name : 'Add a resource in the directory.';
}

function composeMessage(form) {
  const data = new FormData(form);
  const recipient = data.get('recipient') || 'mentor';
  const tone = data.get('tone') || 'direct';
  const deadline = String(data.get('deadline') || '').trim();
  const ask = String(data.get('ask') || '').trim() || 'help with my next reentry step';
  const name = state.profile.name || 'me';
  const city = state.profile.city ? ` in ${state.profile.city}` : '';

  const openers = {
    direct: 'I am working on staying free and need a specific next step.',
    warm: 'I hope you are doing well. I am trying to keep my momentum steady.',
    accountable: 'I want to be proactive and clear before this becomes a bigger barrier.',
  };
  const recipientLine = {
    mentor: 'Hi, I could use a mentor check-in.',
    family: 'Hi, I am reaching out with a clear and respectful ask.',
    provider: 'Hello, I am looking for reentry support and would like to confirm eligibility.',
    employer: 'Hello, I am interested in work and can explain my background with accountability.',
    supervision: 'Hello, I want to stay compliant and communicate early.',
  }[recipient];
  const deadlineLine = deadline ? `I am trying to handle this by ${deadline}.` : 'I am trying to handle this as soon as possible.';

  return `${recipientLine}

${openers[tone]} My current goal is ${state.profile.goal || 'stability'}${city}. I need ${ask}. ${deadlineLine}

Please let me know the best next step, what documents I should bring, and whether there is someone else I should contact.

Thank you,
${name}`;
}

function emptyState(message) {
  return `<div class="empty"><i data-lucide="info"></i><p>${escapeHtml(message)}</p></div>`;
}

function initials(name) {
  return String(name || 'R')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'R';
}
