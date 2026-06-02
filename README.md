# imagetotextocr

> **Extract text from screenshots and photos. Free. No upload. No signup. No server.**

🌐 Live: [imagetotextocr-phi.pages.dev](https://imagetotextocr-phi.pages.dev)

---

## Problem

Most online OCR tools upload your images to their servers, extract text there, and may retain your files indefinitely. If your screenshot contains a receipt, a tax document, an ID, or a private message — that's a privacy and security risk. You shouldn't have to sacrifice your privacy just to extract text from an image.

## Purpose

imagetotextocr is a privacy-first, browser-based OCR tool that solves this problem entirely on the client side. Your images are processed using your browser's native WebAssembly runtime — they never leave your device, never touch a server, and never get stored. The tool is completely free, requires no signup, and works offline after the first load.

---

## How It Works

Everything runs inside your browser using only Tesseract.js (WebAssembly):

1. Select or drag a screenshot/photo (PNG, JPG, WebP, BMP, GIF, TIFF)
2. Choose a language (100+ supported: English, Filipino, Chinese, Spanish, Arabic, Japanese, and more)
3. Preview the extracted text
4. Copy to clipboard or download as `.txt` — nothing leaves your device

**No backend. No uploads. No tracking. No cost.**

### Key Capabilities

- ✅ **100+ languages** — Extract text in English, Filipino, Chinese, Spanish, Arabic, Japanese, and more
- ✅ **All image formats** — PNG, JPG, WebP, BMP, GIF, TIFF
- ✅ **Copy or download** — One-click copy to clipboard, or save as .txt
- ✅ **Batch support** — Process multiple images in one session
- ✅ **Mobile friendly** — Works in Chrome and Safari on iOS/Android
- ✅ **Works offline** — After first load, language models are cached locally

---

## How the Privacy Works

Everything runs inside `js/ocr.js` using only Tesseract.js (WASM inside your browser):

```js
// 1. File is selected from your device (never uploaded)
const imageUrl = URL.createObjectURL(file); // local object URL only

// 2. Tesseract.js runs the OCR engine in WASM inside the browser tab
const { data } = await worker.recognize(imageUrl);

// 3. Result stays in the browser — visible only to you
console.log(data.text); // ← text extracted, never left your device

// 4. Memory is freed
URL.revokeObjectURL(imageUrl);
```

**Open DevTools → Network tab while using the tool.** You will see the Tesseract language model load once (cached after that), and **zero image upload requests**. Ever. This is verifiable proof — audit it yourself.

---

## Tech stack

| Layer | Technology | Cost |
|-------|-----------|------|
| OCR engine | [Tesseract.js](https://github.com/naptha/tesseract.js) v5 (WASM) | Free / MIT |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) free tier | $0 |
| Frontend | Vanilla HTML + CSS + JS | $0 |
| Fonts | Google Fonts (DM Sans, DM Mono) | $0 |
| **Total** | | **$0/month** |

No backend. No database. No API keys. No paid dependencies.

---

## Project structure

```
imagetotextocr/
├── index.html              ← Main app
├── css/
│   └── style.css           ← Styles (forked from heicfree, orange accent)
├── js/
│   ├── ui.js               ← Drag-drop, file queue, results UI
│   └── ocr.js              ← Tesseract.js OCR engine wrapper
├── blog/
│   ├── how-to-copy-text-from-screenshot.html
│   ├── image-to-text-converter.html
│   ├── screenshot-to-text-no-signup.html
│   ├── extract-text-from-receipt.html
│   └── ocr-privacy-no-upload.html
├── sitemap.xml
├── _headers
├── _redirects
├── robots.txt
└── README.md
```

---

## Running locally

No build step. No npm install. Pure static files.

```bash
git clone https://github.com/YOUR_GITHUB/imagetotextocr
cd imagetotextocr

# Option 1: Python (usually pre-installed)
python3 -m http.server 3000

# Option 2: Node
npx serve .

# Open http://localhost:3000
```

---

## Deploy to Cloudflare Pages

Connect the GitHub repo to Cloudflare Pages and use these settings:

- Build command: none
- Build output directory: `/`
- Framework preset: none

Cloudflare Pages will deploy the static files directly from the repository.

---

## Privacy & Legal

- **No data collected** — all OCR happens in your browser, nothing is stored on our servers
- **No cookies** — nothing is written to your device
- **No uploads** — images never leave your device, never transmitted over the network
- **No login** — no account required, no personal information collected
- **No tracking** — no analytics, no user tracking, no behavioral data collection
- **No ads** — completely ad-free
- **100% verifiable** — the code is open source; anyone can audit it to verify these claims

All text extraction is performed client-side. The server serves only static files. This is a one-way street: your device → your browser → your clipboard. The end.

---

## Support

Never required. Always free.

If this tool saved you time or protected your privacy, you can support the work:

[☕ Buy me a coffee](https://ko-fi.com/brahyan)

The tool is free either way. No pressure.

---

## License

MIT — use it, fork it, build on it.

---

## Contributing

Issues and PRs welcome. If you find a bug or have a feature idea, open an issue on GitHub.

Key areas for contribution:
- Language support improvements
- Accuracy improvements for specific document types
- Accessibility (a11y) improvements
- Mobile UX
