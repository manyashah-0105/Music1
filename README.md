# Music Library – Web Player

A responsive, dark/light themed music player inspired by modern streaming UIs.  
Built with pure HTML, CSS & JavaScript. Ready for GitHub Pages.

## Features

- **All Tracks / Manya's Playlist / Liked Songs / Now Playing** views
- Category filters: Hindi, Gujarati, Devotional, Liked, Recently Played
- Like songs (persisted in localStorage)
- Search
- Full Now Playing view with spinning vinyl
- Bottom mini-player (fixed while a song is playing)
- Sleep Timer (1h / 2h / 3h / 5h / custom) – pauses music after selected time
- Theme toggle (Dark ↔ Light / Navy)
- Add local MP3 files via file picker
- Shuffle & Repeat
- Fully responsive (desktop + mobile)

## How to run locally

1. Open the folder in a local server (required because of audio files):
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
2. Open `http://localhost:3000` (or the port shown).

## Deploy to GitHub Pages

1. Create a new repository.
2. Upload the entire `music-player` folder contents to the root of the repo.
3. Go to **Settings → Pages → Source → Deploy from a branch → main**.
4. Your player will be live at `https://<username>.github.io/<repo>/`.

> **Note:** The 5 demo MP3 files are already included.  
> Large audio files may take a moment to load on first play. For production you can host them on a CDN or use Git LFS.

## Folder structure

```
music-player/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   ├── icons/music-note.png
│   └── songs/   ← the 5 MP3 files
└── README.md
```

Enjoy the music!
