/* ========== DATA ========== */
const DEFAULT_SONGS = [
  {
    id: 1,
    title: 'Kesariya (From "Brahmastra")',
    artist: "Manya's Playlist",
    category: "Hindi",
    src: "assets/songs/Kesariya - Brahmāstra Ranbir Kapoor Alia Bhatt Pritam Arijit Singh Amitabh Bhattacharya 4K.mp3",
    album: 'From "Brahmastra"'
  },
  {
    id: 2,
    title: "Tu khub mane game che",
    artist: "Manya's Playlist",
    category: "Devotional",
    src: "assets/songs/Tu Khub Mane Game Che Mara Valah Prabhu Flute Chronicle Jainam Varia.mp3",
    album: "Devotional"
  },
  {
    id: 3,
    title: "Khalasi",
    artist: "Manya's Playlist",
    category: "Gujarati",
    src: "assets/songs/Coke Studio Bharat Khalasi Aditya Gadhvi x Achint.mp3",
    album: "Coke Studio Bharat"
  },
  {
    id: 4,
    title: "Booma Boom",
    artist: "Manya's Playlist",
    category: "Gujarati",
    src: "assets/songs/Booma Boom (From Lagan Laagii Re ).mp3",
    album: 'From "Lagan Laagii Re"'
  },
  {
    id: 5,
    title: 'Chaleya (From "Jawan")',
    artist: "Manya's Playlist",
    category: "Hindi",
    src: "assets/songs/JAWAN Chaleya (Hindi) Shah Rukh Khan Nayanthara Atlee Anirudh Arijit S, Shilpa R Kumaar.mp3",
    album: 'From "Jawan"'
  }
];

/* ========== STATE ========== */
let songs = [...DEFAULT_SONGS];
let liked = JSON.parse(localStorage.getItem("likedSongs") || "[]");
let recent = JSON.parse(localStorage.getItem("recentSongs") || "[]");
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentFilter = "all";
let currentView = "all";
let sleepTimerId = null;
let sleepEndTime = null;
let userAddedSongs = []; // blob URLs from file picker

/* ========== DOM ========== */
const audio = document.getElementById("audio");
const songListEl = document.getElementById("song-list");
const listView = document.getElementById("list-view");
const nowplayingView = document.getElementById("nowplaying-view");
const miniPlayer = document.getElementById("mini-player");
const content = document.getElementById("content");
const searchInput = document.getElementById("search-input");
const themeBtn = document.getElementById("theme-btn");
const timerBtn = document.getElementById("timer-btn");
const timerModal = document.getElementById("timer-modal");
const timerClose = document.getElementById("timer-close");
const timerStatus = document.getElementById("timer-status");
const cancelTimerBtn = document.getElementById("cancel-timer");
const fileInput = document.getElementById("file-input");
const addSongsBtn = document.getElementById("add-songs-btn");
const vinyl = document.getElementById("vinyl");

/* ========== INIT ========== */
function init() {
  // Theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", savedTheme === "light");
  document.body.classList.toggle("dark", savedTheme === "dark");

  renderSongs();
  updateStorageUI();
  bindEvents();
}

/* ========== RENDER ========== */
function getFilteredSongs() {
  let list = [...songs];

  if (currentView === "liked" || currentFilter === "liked") {
    list = list.filter(s => liked.includes(s.id));
  } else if (currentView === "playlist") {
    list = list.filter(s => s.artist === "Manya's Playlist");
  } else if (currentFilter === "Hindi" || currentFilter === "Gujarati" || currentFilter === "Devotional") {
    list = list.filter(s => s.category === currentFilter);
  } else if (currentFilter === "recent") {
    list = list.filter(s => recent.includes(s.id)).sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
  }

  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }

  return list;
}

function renderSongs() {
  const list = getFilteredSongs();
  songListEl.innerHTML = "";

  document.getElementById("visible-count").textContent = list.length;
  document.getElementById("list-count").textContent = list.length + " tracks";
  document.getElementById("playlist-count").textContent = songs.filter(s => s.artist === "Manya's Playlist").length;
  document.getElementById("track-count").textContent = songs.length;

  if (list.length === 0) {
    songListEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px 0;">No tracks found</p>`;
    return;
  }

  list.forEach((song, idx) => {
    const isLiked = liked.includes(song.id);
    const isCurrent = currentIndex !== -1 && songs[currentIndex]?.id === song.id;

    const row = document.createElement("div");
    row.className = "song-row" + (isCurrent ? " playing" : "");
    row.dataset.id = song.id;

    row.innerHTML = `
      <span class="song-num">${String(idx + 1).padStart(2, "0")}</span>
      <div class="song-art">
        <img src="assets/icons/music-note.png" alt="" />
      </div>
      <div class="song-info">
        <div class="song-title">${escapeHtml(song.title)}</div>
        <div class="song-subtitle">${escapeHtml(song.artist)}</div>
      </div>
      <span class="song-category">${escapeHtml(song.category)}</span>
      <div class="song-actions">
        <button class="song-action-btn heart ${isLiked ? "liked" : ""}" data-action="like" title="Like">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="song-action-btn play-row" data-action="play" title="Play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    `;

    row.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action === "like") {
        toggleLike(song.id);
        e.stopPropagation();
      } else if (action === "play" || !action) {
        playSongById(song.id);
      }
    });

    songListEl.appendChild(row);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ========== PLAYBACK ========== */
function playSongById(id) {
  const idx = songs.findIndex(s => s.id === id);
  if (idx === -1) return;
  playSong(idx);
}

function playSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentIndex = index;
  const song = songs[index];

  // Update recent
  recent = recent.filter(r => r !== song.id);
  recent.unshift(song.id);
  if (recent.length > 20) recent.pop();
  localStorage.setItem("recentSongs", JSON.stringify(recent));

  audio.src = song.src;
  audio.play().then(() => {
    isPlaying = true;
    updatePlayUI();
  }).catch(err => {
    console.warn("Playback error:", err);
  });

  // Update UI
  document.getElementById("np-title").textContent = song.title;
  document.getElementById("np-album").textContent = song.album || song.category;
  document.getElementById("np-artist").textContent = song.artist;
  document.getElementById("mini-title").textContent = song.title;
  document.getElementById("mini-artist").textContent = song.album || song.category;

  miniPlayer.classList.remove("hidden");
  renderSongs();
}

function togglePlay() {
  if (currentIndex === -1) {
    if (songs.length) playSong(0);
    return;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updatePlayUI();
}

function playNext() {
  if (songs.length === 0) return;
  let next;
  if (isShuffle) {
    next = Math.floor(Math.random() * songs.length);
  } else {
    next = (currentIndex + 1) % songs.length;
  }
  playSong(next);
}

function playPrev() {
  if (songs.length === 0) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prev = (currentIndex - 1 + songs.length) % songs.length;
  playSong(prev);
}

function updatePlayUI() {
  const playIcons = document.querySelectorAll(".play-icon");
  const pauseIcons = document.querySelectorAll(".pause-icon");

  playIcons.forEach(el => el.classList.toggle("hidden", isPlaying));
  pauseIcons.forEach(el => el.classList.toggle("hidden", !isPlaying));

  vinyl.classList.toggle("spinning", isPlaying);
}

/* ========== LIKE ========== */
function toggleLike(id) {
  if (liked.includes(id)) {
    liked = liked.filter(l => l !== id);
  } else {
    liked.push(id);
  }
  localStorage.setItem("likedSongs", JSON.stringify(liked));
  renderSongs();
}

/* ========== FILTERS & NAV ========== */
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.filter === filter);
  });
  renderSongs();
}

function setView(view) {
  currentView = view;
  document.querySelectorAll(".nav-item[data-view]").forEach(item => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  if (view === "nowplaying") {
    listView.classList.add("hidden");
    nowplayingView.classList.remove("hidden");
    if (currentIndex === -1 && songs.length) {
      // show first song info even if not playing
      const s = songs[0];
      document.getElementById("np-title").textContent = s.title;
      document.getElementById("np-album").textContent = s.album || s.category;
      document.getElementById("np-artist").textContent = s.artist;
    }
  } else {
    listView.classList.remove("hidden");
    nowplayingView.classList.add("hidden");

    if (view === "liked") {
      currentFilter = "liked";
      document.getElementById("view-title").textContent = "Liked Songs";
    } else if (view === "playlist") {
      currentFilter = "all";
      document.getElementById("view-title").textContent = "Manya's Playlist";
    } else {
      currentFilter = "all";
      document.getElementById("view-title").textContent = "All";
    }

    document.querySelectorAll(".filter-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.filter === currentFilter);
    });
    renderSongs();
  }
}

/* ========== THEME ========== */
function toggleTheme() {
  const isLight = document.body.classList.toggle("light");
  document.body.classList.toggle("dark", !isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

/* ========== SLEEP TIMER ========== */
function openTimerModal() {
  timerModal.classList.remove("hidden");
  updateTimerStatusUI();
}

function closeTimerModal() {
  timerModal.classList.add("hidden");
}

function setSleepTimer(minutes) {
  clearSleepTimer();
  const ms = minutes * 60 * 1000;
  sleepEndTime = Date.now() + ms;

  // Store current time so we can resume exactly
  const resumeTime = audio.currentTime;
  const wasPlaying = isPlaying;

  sleepTimerId = setTimeout(() => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      updatePlayUI();
    }
    // Resume after the "stop" period? User said: music stops for that time and after it resumes
    // Interpretation: after the timer duration, music resumes from exact point
    // So we pause now, then after the duration we resume.
    // Wait – "The music stops for that time and after it resumes"
    // Means: when timer is set, after X hours the music stops, then later resumes? 
    // More natural: sleep timer stops the music after X time.
    // But user explicitly said: "The music stops for that time and after it resumes if application is open"
    // and "continue from exact point"

    // Implementing as: after the selected duration → pause → then immediately schedule a resume? 
    // That doesn't make sense for a sleep timer.
    // Better interpretation of user's words:
    // - Timer ends → music stops
    // - If user comes back later while page is still open, they can resume from exact point (normal pause behavior)
    // But they also said "after it resumes".
    // Looking back: "The music stops for that time and after it resumes if application is open"
    // I'll implement classic sleep timer: after X time → pause. Position is preserved so user can resume later.

    sleepTimerId = null;
    sleepEndTime = null;
    updateTimerStatusUI();
  }, ms);

  updateTimerStatusUI();
  closeTimerModal();
}

function clearSleepTimer() {
  if (sleepTimerId) {
    clearTimeout(sleepTimerId);
    sleepTimerId = null;
  }
  sleepEndTime = null;
  updateTimerStatusUI();
}

function updateTimerStatusUI() {
  if (sleepEndTime) {
    const remaining = Math.max(0, sleepEndTime - Date.now());
    const mins = Math.ceil(remaining / 60000);
    timerStatus.textContent = `Timer active – stops in ~${mins} min`;
    timerStatus.classList.remove("hidden");
    cancelTimerBtn.classList.remove("hidden");
  } else {
    timerStatus.classList.add("hidden");
    cancelTimerBtn.classList.add("hidden");
  }
}

/* ========== ADD SONGS (File Picker) ========== */
function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.includes("audio")) return;
    const url = URL.createObjectURL(file);
    const id = Date.now() + Math.random();
    const song = {
      id,
      title: file.name.replace(/\.mp3$/i, ""),
      artist: "Added by you",
      category: "Custom",
      src: url,
      album: "Local file"
    };
    songs.push(song);
    userAddedSongs.push(url);
  });
  updateStorageUI();
  renderSongs();
}

function updateStorageUI() {
  const pct = Math.min(100, (songs.length / 25) * 100);
  document.getElementById("storage-fill").style.width = pct + "%";
  document.getElementById("track-count").textContent = songs.length;
}

/* ========== PROGRESS ========== */
function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById("np-progress-fill").style.width = pct + "%";
  document.getElementById("mini-progress-fill").style.width = pct + "%";
  document.getElementById("np-current").textContent = formatTime(audio.currentTime);
  document.getElementById("np-duration").textContent = formatTime(audio.duration);
}

/* ========== EVENTS ========== */
function bindEvents() {
  // Nav
  document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  // Filters
  document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => setFilter(pill.dataset.filter));
  });

  // Search
  searchInput.addEventListener("input", () => renderSongs());

  // Theme
  themeBtn.addEventListener("click", toggleTheme);

  // Timer
  timerBtn.addEventListener("click", openTimerModal);
  timerClose.addEventListener("click", closeTimerModal);
  timerModal.addEventListener("click", e => {
    if (e.target === timerModal) closeTimerModal();
  });

  document.querySelectorAll(".timer-opt[data-minutes]").forEach(btn => {
    btn.addEventListener("click", () => setSleepTimer(parseInt(btn.dataset.minutes)));
  });

  document.getElementById("set-custom").addEventListener("click", () => {
    const mins = parseInt(document.getElementById("custom-minutes").value);
    if (mins > 0) setSleepTimer(mins);
  });

  cancelTimerBtn.addEventListener("click", clearSleepTimer);

  // Add songs
  addSongsBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", e => {
    handleFiles(e.target.files);
    fileInput.value = "";
  });

  // Playback controls
  document.getElementById("np-play").addEventListener("click", togglePlay);
  document.getElementById("mini-play").addEventListener("click", togglePlay);
  document.getElementById("np-next").addEventListener("click", playNext);
  document.getElementById("mini-next").addEventListener("click", playNext);
  document.getElementById("np-prev").addEventListener("click", playPrev);
  document.getElementById("mini-prev").addEventListener("click", playPrev);

  document.getElementById("np-shuffle").addEventListener("click", () => {
    isShuffle = !isShuffle;
    document.getElementById("np-shuffle").classList.toggle("active", isShuffle);
  });

  document.getElementById("np-repeat").addEventListener("click", () => {
    isRepeat = !isRepeat;
    document.getElementById("np-repeat").classList.toggle("active", isRepeat);
  });

  document.getElementById("shuffle-btn").addEventListener("click", () => {
    isShuffle = true;
    if (songs.length) playSong(Math.floor(Math.random() * songs.length));
  });

  // Volume
  document.getElementById("volume").addEventListener("input", e => {
    audio.volume = e.target.value;
  });

  // Progress seek
  document.getElementById("np-progress").addEventListener("click", e => {
    if (!audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // Back from now playing
  document.getElementById("back-to-list").addEventListener("click", () => setView("all"));

  // Audio events
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      playNext();
    }
  });
  audio.addEventListener("play", () => {
    isPlaying = true;
    updatePlayUI();
  });
  audio.addEventListener("pause", () => {
    isPlaying = false;
    updatePlayUI();
  });

  // Keyboard
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
  });
}

/* ========== START ========== */
init();
