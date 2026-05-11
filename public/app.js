const pictureKey = 'conjigul:pictures';
const friendsKey = 'conjigul:friends';

const pictureForm = document.getElementById('add-picture-form');
const friendForm = document.getElementById('add-friend-form');
const galleryGrid = document.getElementById('gallery-grid');
const friendList = document.getElementById('friend-list');

const state = {
  pictures: loadStored(pictureKey),
  friends: loadStored(friendsKey),
};

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
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function renderGallery() {
  galleryGrid.innerHTML = '';
  if (!state.pictures.length) {
    galleryGrid.innerHTML = '<p class="empty">No pictures yet. Add your first memory above.</p>';
    return;
  }

  state.pictures.forEach((item) => {
    const tile = document.createElement('article');
    tile.className = 'tile';
    tile.innerHTML = `
      <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}">
      <div class="tile__body">
        <p class="tile__title">${escapeHtml(item.title)}</p>
        <p class="tile__meta">Added ${formatDate(item.createdAt)}</p>
      </div>
      <button class="button button--ghost" data-id="${escapeHtml(item.id)}" data-type="picture">Remove</button>
    `;
    galleryGrid.appendChild(tile);
  });
}

function renderFriends() {
  friendList.innerHTML = '';
  if (!state.friends.length) {
    friendList.innerHTML = '<p class="empty">No friends added yet. Add someone you care about.</p>';
    return;
  }

  state.friends.forEach((friend) => {
    const chip = document.createElement('article');
    chip.className = 'chip';
    chip.innerHTML = `
      <p class="chip__title">${escapeHtml(friend.name)}</p>
      <p class="chip__meta">${escapeHtml(friend.contact)} • Added ${formatDate(friend.createdAt)}</p>
      <p class="chip__notes">${escapeHtml(friend.notes || 'No notes yet.')}</p>
      <button class="button button--ghost" data-id="${escapeHtml(friend.id)}" data-type="friend">Remove</button>
    `;
    friendList.appendChild(chip);
  });
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
    reader.onload = () => resolve(reader.result.toString());
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

pictureForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = pictureForm.querySelector('#picture-title').value.trim();
  const file = pictureForm.querySelector('#picture-file').files[0];
  if (!title || !file) return;

  try {
    const url = await fileToDataUrl(file);
    state.pictures.unshift({
      id: uniqueId(),
      title,
      url,
      createdAt: Date.now(),
    });
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
  const name = friendForm.querySelector('#friend-name').value.trim();
  const contact = friendForm.querySelector('#friend-contact').value.trim();
  const notes = friendForm.querySelector('#friend-notes').value.trim();
  if (!name || !contact) return;

  state.friends.unshift({
    id: uniqueId(),
    name,
    contact,
    notes,
    createdAt: Date.now(),
  });
  saveState();
  renderFriends();
  friendForm.reset();
});

document.body.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  const type = target.dataset.type;
  if (!id || !type) return;

  if (type === 'picture') {
    state.pictures = state.pictures.filter((item) => item.id !== id);
    saveState();
    renderGallery();
  } else if (type === 'friend') {
    state.friends = state.friends.filter((item) => item.id !== id);
    saveState();
    renderFriends();
  }
});

renderGallery();
renderFriends();
