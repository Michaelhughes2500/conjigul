const pictureKey = "conjigul:pictures";
const friendsKey = "conjigul:friends";

let pictureForm, friendForm, galleryGrid, friendList;
let state = { pictures: [], friends: [] };
let searchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
  pictureForm = document.getElementById("add-picture-form");
  friendForm = document.getElementById("add-friend-form");
  galleryGrid = document.getElementById("gallery-grid");
  friendList = document.getElementById("friend-list");

  state.pictures = loadStored(pictureKey);
  state.friends = loadStored(friendsKey);

  if (pictureForm) pictureForm.addEventListener("submit", handlePictureSubmit);
  if (friendForm) friendForm.addEventListener("submit", handleFriendSubmit);

  document.body.addEventListener("click", handleGlobalClick);

  if (galleryGrid) {
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search pictures by title...";
    searchInput.className = "search-input";
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderGallery();
    });
    galleryGrid.parentNode.insertBefore(searchInput, galleryGrid);
  }

  renderGallery();
  renderFriends();
});

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
  }
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function renderGallery() {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = "";

  const filtered = state.pictures.filter((item) =>
    String(item?.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!filtered.length) {
    const message = searchTerm
      ? `No pictures match "${escapeHtml(searchTerm)}".`
      : "No pictures yet. Add your first memory above.";
    galleryGrid.innerHTML = `<p class="empty">${message}</p>`;
    return;
  }

  filtered.forEach((item) => {
    const tile = document.createElement("article");
    tile.className = "tile";
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
  if (!friendList) return;
  friendList.innerHTML = "";
  if (!state.friends.length) {
    friendList.innerHTML =
      '<p class="empty">No friends added yet. Add someone you care about.</p>';
    return;
  }

  state.friends.forEach((friend) => {
    const chip = document.createElement("article");
    chip.className = "chip";
    chip.innerHTML = `
      <p class="chip__title">${escapeHtml(friend.name)}</p>
      <p class="chip__meta">${escapeHtml(friend.contact)} • Added ${formatDate(friend.createdAt)}</p>
      <p class="chip__notes">${escapeHtml(friend.notes || "No notes yet.")}</p>
      <button class="button button--ghost" data-id="${escapeHtml(friend.id)}" data-type="friend">Remove</button>
    `;
    friendList.appendChild(chip);
  });
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

async function handlePictureSubmit(event) {
  event.preventDefault();
  const title = pictureForm.querySelector("#picture-title").value.trim();
  const file = pictureForm.querySelector("#picture-file").files[0];
  if (!title || !file) return;

  if (!file.type.startsWith("image/")) {
    alert("Only image files are allowed.");
    return;
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
    pictureForm.reset();
  } catch (err) {
    alert("Failed to process image.");
    console.error(err);
  }
}

function handleFriendSubmit(event) {
  event.preventDefault();
  const name = friendForm.querySelector("#friend-name").value.trim();
  const contact = friendForm.querySelector("#friend-contact").value.trim();
  const notes = friendForm.querySelector("#friend-notes").value.trim();
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
}

function handleGlobalClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const id = target.dataset.id;
  const type = target.dataset.type;
  if (!id || !type) return;

  if (type === "picture") {
    state.pictures = state.pictures.filter((item) => item.id !== id);
    saveState();
    renderGallery();
  } else if (type === "friend") {
    state.friends = state.friends.filter((item) => item.id !== id);
    saveState();
    renderFriends();
  }
}
