// js/ui.js
// Handles all UI interactions: drag-drop, file queue, progress display
// Adapted from heicfree/ui.js — modified for OCR (accepts all image formats)
// No framework. Pure DOM manipulation.

const dropZone      = document.getElementById('dropZone');
const fileInput     = document.getElementById('fileInput');
const fileQueue     = document.getElementById('fileQueue');
const langRow       = document.getElementById('langRow');
const actionRow     = document.getElementById('actionRow');
const extractBtn    = document.getElementById('extractBtn');
const clearBtn      = document.getElementById('clearBtn');
const progressWrap  = document.getElementById('progressWrap');
const progressFill  = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const resultsWrap   = document.getElementById('resultsWrap');
const resultsTitle  = document.getElementById('resultsTitle');
const textOutput    = document.getElementById('textOutput');
const copyTextBtn   = document.getElementById('copyTextBtn');
const downloadTxtBtn = document.getElementById('downloadTxtBtn');
const copyAllBtn    = document.getElementById('copyAllBtn');
const resultsList   = document.getElementById('resultsList');
const extractMoreBtn = document.getElementById('extractMoreBtn');

// Shared state
window.queuedFiles   = [];
window.extractedData = []; // [{name, text, error}]

// ── Drag and drop ──
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

['dragleave', 'dragend'].forEach(evt => {
  dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'));
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(isImage);
  addFiles(files);
});

dropZone.addEventListener('click', (e) => {
  // Don't trigger if user clicks the label (it already opens fileInput)
  if (e.target.tagName !== 'LABEL') fileInput.click();
});

// Keyboard accessibility
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click();
});

fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files).filter(isImage);
  addFiles(files);
  fileInput.value = '';
});

// ── File helpers ──
function isImage(file) {
  return file.type.startsWith('image/') ||
    /\.(png|jpg|jpeg|webp|bmp|gif|tiff?|avif)$/i.test(file.name);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function addFiles(files) {
  if (!files.length) return;
  files.forEach(f => {
    const exists = window.queuedFiles.some(q => q.name === f.name && q.size === f.size);
    if (!exists) window.queuedFiles.push(f);
  });
  renderQueue();
}

function renderQueue() {
  fileQueue.innerHTML = '';
  window.queuedFiles.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `
      <span class="queue-item-name" title="${f.name}">${f.name}</span>
      <span class="queue-item-size">${formatBytes(f.size)}</span>
      <button class="queue-item-remove" data-idx="${i}" aria-label="Remove ${f.name}">×</button>
    `;
    fileQueue.appendChild(item);
  });

  const hasFiles = window.queuedFiles.length > 0;
  actionRow.style.display = hasFiles ? 'flex' : 'none';
  langRow.style.display   = hasFiles ? 'flex' : 'none';

  fileQueue.querySelectorAll('.queue-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      window.queuedFiles.splice(idx, 1);
      renderQueue();
    });
  });
}

// ── Progress helpers (used by ocr.js) ──
window.showProgress = function(label, pct) {
  progressWrap.style.display = 'block';
  progressFill.style.width = pct + '%';
  progressLabel.textContent = label;
};

window.hideProgress = function() {
  progressWrap.style.display = 'none';
};

// ── Results rendering ──
window.showResults = function(results) {
  window.extractedData = results;
  resultsWrap.style.display = 'block';
  resultsList.innerHTML = '';

  const successCount = results.filter(r => !r.error).length;
  resultsTitle.textContent = successCount === 1
    ? 'Text extracted'
    : `Done — ${successCount} of ${results.length} image${results.length > 1 ? 's' : ''} processed`;

  // Show all text in textarea (combined if multiple)
  const combined = results
    .filter(r => !r.error)
    .map(r => results.length > 1 ? `--- ${r.name} ---\n${r.text}` : r.text)
    .join('\n\n');
  textOutput.value = combined;

  // Per-file tabs (only if more than one image)
  if (results.length > 1) {
    results.forEach((r, i) => {
      const item = document.createElement('div');
      item.className = 'result-item' + (r.error ? ' result-error' : '') + (i === 0 ? ' active' : '');
      if (!r.error) {
        const charCount = r.text.replace(/\s/g, '').length;
        item.innerHTML = `
          <span class="result-item-name" title="${r.name}">${r.name}</span>
          <span class="result-char-count">${charCount} chars</span>
        `;
        item.addEventListener('click', () => {
          document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          textOutput.value = r.text;
        });
      } else {
        item.innerHTML = `
          <span class="result-item-name" title="${r.name}">✗ ${r.name}</span>
          <span class="result-char-count">${r.error}</span>
        `;
      }
      resultsList.appendChild(item);
    });
  }
};

// ── Copy button ──
function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function flashCopied(btn, originalHTML) {
  btn.innerHTML = 'Copied! ✓';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.classList.remove('copied');
  }, 1800);
}

copyTextBtn.addEventListener('click', () => {
  const original = copyTextBtn.innerHTML;
  copyToClipboard(textOutput.value)
    .then(() => flashCopied(copyTextBtn, original))
    .catch(() => {});
});

copyAllBtn.addEventListener('click', () => {
  const allText = window.extractedData
    .filter(r => !r.error)
    .map(r => window.extractedData.length > 1 ? `--- ${r.name} ---\n${r.text}` : r.text)
    .join('\n\n');
  copyToClipboard(allText)
    .then(() => flashCopied(copyAllBtn, 'Copy all text'))
    .catch(() => {});
});

// ── Download .txt ──
downloadTxtBtn.addEventListener('click', () => {
  const text = textOutput.value;
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'extracted-text.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ── Clear / Extract more ──
clearBtn.addEventListener('click', reset);
extractMoreBtn.addEventListener('click', reset);

function reset() {
  window.queuedFiles   = [];
  window.extractedData = [];
  fileQueue.innerHTML  = '';
  resultsList.innerHTML = '';
  textOutput.value     = '';
  resultsWrap.style.display  = 'none';
  progressWrap.style.display = 'none';
  actionRow.style.display    = 'none';
  langRow.style.display      = 'none';
}

// ── Extract button triggers ocr.js ──
extractBtn.addEventListener('click', () => {
  if (typeof window.runOCR === 'function') {
    window.runOCR();
  }
});
