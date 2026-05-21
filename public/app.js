const pictureKey = 'conjigul:pictures';
const friendsKey = 'conjigul:friends';
const themeKey   = 'conjigul:theme';

const pictureForm  = document.getElementById('add-picture-form');
const friendForm   = document.getElementById('add-friend-form');
const galleryGrid  = document.getElementById('gallery-grid');
const friendList   = document.getElementById('friend-list');
const pictureSearch = document.getElementById('picture-search');
const friendSearch  = document.getElementById('friend-search');
const themeToggle   = document.getElementById('theme-toggle');

const state = {
  pictures: loadStored(pictureKey),
  friends:  loadStored(friendsKey),
};

let pictureFilter = '';
let friendFilter  = '';
let dragSrcIndex  = null;
let dragSrcType   = null;

// ── Theme ────────────────────────────────────────────────────────────────────

if (localStorage.getItem(themeKey) === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = 'Dark';
}

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem(themeKey, isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? 'Dark' : 'Light';
});

// ── Search ───────────────────────────────────────────────────────────────────

pictureSearch.addEventListener('input', () => {
  pictureFilter = pictureSearch.value.toLowerCase().trim();
  renderGallery();
});

friendSearch.addEventListener('input', () => {
  friendFilter = friendSearch.value.toLowerCase().trim();
  renderFriends();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function uniqueId() {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadStored(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Unable to parse ${key}`, err);
    return [];
  }
}

function saveState() {
  try {
    localStorage.setItem(pictureKey, JSON.stringify(state.pictures));
    localStorage.setItem(friendsKey, JSON.stringify(state.friends));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      alert('Storage full — try removing some pictures to free space.');
    } else {
      throw err;
    }
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.toString());
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// ── Drag-to-reorder ───────────────────────────────────────────────────────────

function attachDrag(el, index, type) {
  el.draggable = true;

  el.addEventListener('dragstart', (e) => {
    dragSrcIndex = index;
    dragSrcType  = type;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(n => n.classList.remove('drag-over'));
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', (e) => {
    if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over');
  });

  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (dragSrcIndex === null || dragSrcType !== type || dragSrcIndex === index) return;
    const arr = type === 'picture' ? state.pictures : state.friends;
    const [moved] = arr.splice(dragSrcIndex, 1);
    arr.splice(index, 0, moved);
    dragSrcIndex = null;
    saveState();
    if (type === 'picture') renderGallery();
    else renderFriends();
  });
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderGallery() {
  galleryGrid.innerHTML = '';
  const items = pictureFilter
    ? state.pictures.filter(p => p.title.toLowerCase().includes(pictureFilter))
    : state.pictures;

  if (!items.length) {
    galleryGrid.innerHTML = `<p class="empty">${pictureFilter ? 'No pictures match your search.' : 'No pictures yet. Add your first memory above.'}</p>`;
    return;
  }

  items.forEach((item) => {
    const realIndex = state.pictures.indexOf(item);
    const tile = document.createElement('article');
    tile.className = 'tile';
    tile.innerHTML = `
      <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}">
      <div class="tile__body">
        <p class="tile__title">${escapeHtml(item.title)}</p>
        <p class="tile__meta">Added ${formatDate(item.createdAt)}</p>
      </div>
      <div class="tile__actions">
        <button class="button button--ghost button--sm" data-id="${escapeHtml(item.id)}" data-type="picture" data-action="edit">Edit</button>
        <button class="button button--ghost button--sm" data-id="${escapeHtml(item.id)}" data-type="picture" data-action="remove">Remove</button>
      </div>
    `;
    if (!pictureFilter) attachDrag(tile, realIndex, 'picture');
    galleryGrid.appendChild(tile);
  });
}

function renderFriends() {
  friendList.innerHTML = '';
  const items = friendFilter
    ? state.friends.filter(f =>
        f.name.toLowerCase().includes(friendFilter) ||
        f.contact.toLowerCase().includes(friendFilter)
      )
    : state.friends;

  if (!items.length) {
    friendList.innerHTML = `<p class="empty">${friendFilter ? 'No friends match your search.' : 'No friends added yet. Add someone you care about.'}</p>`;
    return;
  }

  items.forEach((friend) => {
    const realIndex = state.friends.indexOf(friend);
    const chip = document.createElement('article');
    chip.className = 'chip';
    chip.innerHTML = `
      <p class="chip__title">${escapeHtml(friend.name)}</p>
      <p class="chip__meta">${escapeHtml(friend.contact)} • Added ${formatDate(friend.createdAt)}</p>
      <p class="chip__notes">${escapeHtml(friend.notes || 'No notes yet.')}</p>
      <div class="chip__actions">
        <button class="button button--ghost button--sm" data-id="${escapeHtml(friend.id)}" data-type="friend" data-action="edit">Edit</button>
        <button class="button button--ghost button--sm" data-id="${escapeHtml(friend.id)}" data-type="friend" data-action="remove">Remove</button>
      </div>
    `;
    if (!friendFilter) attachDrag(chip, realIndex, 'friend');
    friendList.appendChild(chip);
  });
}

// ── Inline edit ───────────────────────────────────────────────────────────────

function editPicture(id) {
  const item = state.pictures.find(p => p.id === id);
  if (!item) return;
  const tile = galleryGrid.querySelector(`[data-id="${CSS.escape(id)}"]`)?.closest('.tile');
  if (!tile) return;

  tile.draggable = false;
  tile.innerHTML = `
    <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" class="tile__img--editing">
    <div class="tile__body">
      <label class="form__field">
        <span>Title</span>
        <input type="text" class="edit-title" value="${escapeHtml(item.title)}" maxlength="200">
      </label>
      <div class="edit-actions">
        <button class="button button--sm" data-action="save-picture">Save</button>
        <button class="button button--ghost button--sm" data-action="cancel-picture">Cancel</button>
      </div>
    </div>
  `;

  const input = tile.querySelector('.edit-title');
  input.focus();
  input.select();

  tile.querySelector('[data-action="save-picture"]').addEventListener('click', () => {
    const newTitle = input.value.trim();
    if (!newTitle) { input.focus(); return; }
    item.title = newTitle;
    saveState();
    renderGallery();
  });

  tile.querySelector('[data-action="cancel-picture"]').addEventListener('click', () => renderGallery());

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  tile.querySelector('[data-action="save-picture"]').click();
    if (e.key === 'Escape') renderGallery();
  });
}

function editFriend(id) {
  const friend = state.friends.find(f => f.id === id);
  if (!friend) return;
  const chip = friendList.querySelector(`[data-id="${CSS.escape(id)}"]`)?.closest('.chip');
  if (!chip) return;

  chip.draggable = false;
  chip.innerHTML = `
    <div class="edit-form">
      <label class="form__field">
        <span>Name</span>
        <input type="text" class="edit-name" value="${escapeHtml(friend.name)}" maxlength="200">
      </label>
      <label class="form__field">
        <span>Contact</span>
        <input type="text" class="edit-contact" value="${escapeHtml(friend.contact)}" maxlength="200">
      </label>
      <label class="form__field">
        <span>Notes</span>
        <textarea class="edit-notes" rows="3">${escapeHtml(friend.notes || '')}</textarea>
      </label>
      <div class="edit-actions">
        <button class="button button--secondary button--sm" data-action="save-friend">Save</button>
        <button class="button button--ghost button--sm" data-action="cancel-friend">Cancel</button>
      </div>
    </div>
  `;

  const nameInput = chip.querySelector('.edit-name');
  nameInput.focus();

  chip.querySelector('[data-action="save-friend"]').addEventListener('click', () => {
    const newName    = nameInput.value.trim();
    const newContact = chip.querySelector('.edit-contact').value.trim();
    if (!newName || !newContact) {
      (newName ? chip.querySelector('.edit-contact') : nameInput).focus();
      return;
    }
    friend.name    = newName;
    friend.contact = newContact;
    friend.notes   = chip.querySelector('.edit-notes').value.trim();
    saveState();
    renderFriends();
  });

  chip.querySelector('[data-action="cancel-friend"]').addEventListener('click', () => renderFriends());
}

// ── Event delegation ──────────────────────────────────────────────────────────

document.body.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest('[data-action][data-type]');
  if (!button) return;

  const id     = button.dataset.id;
  const type   = button.dataset.type;
  const action = button.dataset.action;

  if (action === 'remove') {
    if (type === 'picture') {
      state.pictures = state.pictures.filter(item => item.id !== id);
      saveState();
      renderGallery();
    } else if (type === 'friend') {
      state.friends = state.friends.filter(item => item.id !== id);
      saveState();
      renderFriends();
    }
  } else if (action === 'edit') {
    if (type === 'picture') editPicture(id);
    else if (type === 'friend') editFriend(id);
  }
});

// ── Form submissions ──────────────────────────────────────────────────────────

pictureForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = pictureForm.querySelector('#picture-title').value.trim();
  const file  = pictureForm.querySelector('#picture-file').files[0];
  if (!title || !file) return;

  try {
    const url = await fileToDataUrl(file);
    state.pictures.unshift({ id: uniqueId(), title, url, createdAt: Date.now() });
    saveState();
    renderGallery();
    pictureForm.reset();
  } catch (err) {
    alert('Could not load the image. Please try a different file.');
    console.error(err);
  }
});

friendForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name    = friendForm.querySelector('#friend-name').value.trim();
  const contact = friendForm.querySelector('#friend-contact').value.trim();
  const notes   = friendForm.querySelector('#friend-notes').value.trim();
  if (!name || !contact) return;

  state.friends.unshift({ id: uniqueId(), name, contact, notes, createdAt: Date.now() });
  saveState();
  renderFriends();
  friendForm.reset();
});

// ── Init ──────────────────────────────────────────────────────────────────────

renderGallery();
renderFriends();
