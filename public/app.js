const pictureKey = "conjigul:pictures";
const friendsKey = "conjigul:friends";

let pictureForm, friendForm, galleryGrid, friendList, heroStats;
let state = { pictures: [], friends: [] };
let searchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
  pictureForm  = document.getElementById("add-picture-form");
  friendForm   = document.getElementById("add-friend-form");
  galleryGrid  = document.getElementById("gallery-grid");
  friendList   = document.getElementById("friend-list");
  heroStats    = document.getElementById("hero-stats");

  state.pictures = loadStored(pictureKey);
  state.friends  = loadStored(friendsKey);

  if (pictureForm) pictureForm.addEventListener("submit", handlePictureSubmit);
  if (friendForm)  friendForm.addEventListener("submit", handleFriendSubmit);

  document.body.addEventListener("click", handleGlobalClick);

  // Gallery search — wired to the static <input> in markup
  const searchInput = document.getElementById("gallery-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderGallery();
    });
  }

  // File drop-zone drag feedback
  const fileDrop = document.getElementById("file-drop");
  const fileInput = document.getElementById("picture-file");
  if (fileDrop && fileInput) {
    fileDrop.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileDrop.classList.add("drag-over");
    });
    fileDrop.addEventListener("dragleave", () => fileDrop.classList.remove("drag-over"));
    fileDrop.addEventListener("drop", (e) => {
      e.preventDefault();
      fileDrop.classList.remove("drag-over");
      if (e.dataTransfer && e.dataTransfer.files.length) {
        const dt = new DataTransfer();
        dt.items.add(e.dataTransfer.files[0]);
        fileInput.files = dt.files;
        updateDropLabel(fileDrop, e.dataTransfer.files[0].name);
      }
    });
    fileInput.addEventListener("change", () => {
      const f = fileInput.files[0];
      if (f) updateDropLabel(fileDrop, f.name);
    });
  }

  // Reset clears drop label
  if (pictureForm) {
    pictureForm.addEventListener("reset", () => {
      if (fileDrop) {
        fileDrop.classList.remove("has-file");
        const inner = document.getElementById("file-drop-inner");
        if (inner) {
          const span = inner.querySelector("span");
          if (span) span.textContent = "Drop image here or ";
          const strong = document.createElement("strong");
          strong.textContent = "browse";
          if (span) span.appendChild(strong);
        }
      }
    });
  }

  renderGallery();
  renderFriends();
  renderStats();
});

/* ── Helpers ───────────────────────────────────────────────────────── */

function uniqueId() {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadStored(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
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
    console.error("Unable to save state to localStorage", err);
    showToast("Storage is full — try removing some items.", "error");
  }
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.toString());
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function getInitials(name) {
  return String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

function updateDropLabel(fileDrop, fileName) {
  fileDrop.classList.add("has-file");
  const span = fileDrop.querySelector(".file-drop__inner span");
  if (span) span.textContent = escapeHtml(fileName);
}

/* ── Render helpers ────────────────────────────────────────────────── */

function renderStats() {
  if (!heroStats) return;
  heroStats.innerHTML = `
    <div class="stat">
      <span class="stat__value">${state.pictures.length}</span>
      <span class="stat__label">Picture${state.pictures.length !== 1 ? "s" : ""}</span>
    </div>
    <div class="stat">
      <span class="stat__value">${state.friends.length}</span>
      <span class="stat__label">Friend${state.friends.length !== 1 ? "s" : ""}</span>
    </div>
  `;
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = "";

  const filtered = state.pictures.filter((item) =>
    String(item?.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!filtered.length) {
    const icon = searchTerm
      ? `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
      : `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
    const title = searchTerm
      ? `No results for &ldquo;${escapeHtml(searchTerm)}&rdquo;`
      : "No pictures yet";
    const body = searchTerm
      ? "Try a different search term."
      : "Upload your first memory using the form above.";

    galleryGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">${icon}</div>
        <p class="empty-state__title">${title}</p>
        <p class="empty-state__body">${body}</p>
      </div>`;
    return;
  }

  filtered.forEach((item, i) => {
    const tile = document.createElement("article");
    tile.className = "tile";
    tile.style.animationDelay = `${i * 40}ms`;
    tile.innerHTML = `
      <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" loading="lazy">
      <div class="tile__body">
        <p class="tile__title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</p>
        <p class="tile__meta">Added ${formatDate(item.createdAt)}</p>
      </div>
      <div class="tile__footer">
        <button class="button button--danger" data-id="${escapeHtml(item.id)}" data-type="picture" aria-label="Remove ${escapeHtml(item.title)}">Remove</button>
      </div>
    `;
    galleryGrid.appendChild(tile);
  });
}

function renderFriends() {
  if (!friendList) return;
  friendList.innerHTML = "";

  if (!state.friends.length) {
    friendList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <p class="empty-state__title">No friends added yet</p>
        <p class="empty-state__body">Add someone you care about using the form on the left.</p>
      </div>`;
    return;
  }

  state.friends.forEach((friend, i) => {
    const chip = document.createElement("article");
    chip.className = "chip";
    chip.style.animationDelay = `${i * 40}ms`;
    const initials = escapeHtml(getInitials(friend.name));
    chip.innerHTML = `
      <div class="chip__head">
        <div class="chip__avatar" aria-hidden="true">${initials}</div>
        <div class="chip__info">
          <p class="chip__title">${escapeHtml(friend.name)}</p>
          <p class="chip__meta">${escapeHtml(friend.contact)}</p>
        </div>
      </div>
      ${friend.notes ? `<p class="chip__notes">${escapeHtml(friend.notes)}</p>` : ""}
      <div class="chip__footer" style="justify-content: space-between; align-items: center;">
        <span class="chip__date">Added ${formatDate(friend.createdAt)}</span>
        <button class="button button--danger" data-id="${escapeHtml(friend.id)}" data-type="friend" aria-label="Remove ${escapeHtml(friend.name)}">Remove</button>
      </div>
    `;
    friendList.appendChild(chip);
  });
}

/* ── Toast ─────────────────────────────────────────────────────────── */

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<div class="toast__dot"></div><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  };

  setTimeout(remove, 3200);
  toast.addEventListener("click", remove);
}

/* ── Event handlers ────────────────────────────────────────────────── */

async function handlePictureSubmit(event) {
  event.preventDefault();
  const title = pictureForm.querySelector("#picture-title").value.trim();
  const file  = pictureForm.querySelector("#picture-file").files[0];
  if (!title || !file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Only image files are allowed.", "error");
    return;
  }

  const btn = pictureForm.querySelector('[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Saving…";
  }

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
    renderStats();
    pictureForm.reset();
    showToast("Picture saved to your gallery.");
  } catch (err) {
    showToast("Failed to process image.", "error");
    console.error(err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Picture`;
    }
  }
}

function handleFriendSubmit(event) {
  event.preventDefault();
  const name    = friendForm.querySelector("#friend-name").value.trim();
  const contact = friendForm.querySelector("#friend-contact").value.trim();
  const notes   = friendForm.querySelector("#friend-notes").value.trim();
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
  renderStats();
  friendForm.reset();
  showToast(`${name} added to your friends.`);
}

function handleGlobalClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const btn  = target.closest("[data-id][data-type]");
  if (!btn) return;
  const id   = btn.dataset.id;
  const type = btn.dataset.type;
  if (!id || !type) return;

  if (type === "picture") {
    state.pictures = state.pictures.filter((item) => item.id !== id);
    saveState();
    renderGallery();
    renderStats();
    showToast("Picture removed.");
  } else if (type === "friend") {
    const removed = state.friends.find((f) => f.id === id);
    state.friends  = state.friends.filter((item) => item.id !== id);
    saveState();
    renderFriends();
    renderStats();
    if (removed) showToast(`${removed.name} removed from your friends.`);
  }
}
