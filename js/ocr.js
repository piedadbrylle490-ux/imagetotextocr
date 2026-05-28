// js/ocr.js
// Core OCR engine — uses Tesseract.js (WebAssembly, runs in browser)
// Adapted from heicfree/converter.js pattern
// Files NEVER leave the device. No fetch(), no FormData, no server upload.

window.runOCR = async function () {
  const files = window.queuedFiles;
  if (!files.length) return;

  const extractBtn = document.getElementById('extractBtn');
  const clearBtn   = document.getElementById('clearBtn');
  const actionRow  = document.getElementById('actionRow');
  extractBtn.disabled = true;
  clearBtn.disabled   = true;

  const lang    = document.getElementById('langSelect').value || 'eng';
  const results = [];

  window.showProgress('Initializing OCR engine…', 5);

  // Create one Tesseract worker for all files (reuse = faster)
  // Tesseract.js v5 API
  let worker;
  try {
    worker = await Tesseract.createWorker(lang, 1, {
      // Logging callback — used to drive our progress bar
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // m.progress is 0–1 per image; we'll update in the outer loop
        }
      },
    });
  } catch (err) {
    window.hideProgress();
    extractBtn.disabled = false;
    clearBtn.disabled   = false;
    alert('Failed to load OCR engine. Please check your internet connection and try again.');
    console.error('Tesseract worker init failed:', err);
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const basePct = Math.round((i / files.length) * 85) + 10; // 10–95%
    window.showProgress(`Processing ${i + 1} of ${files.length}: ${file.name}`, basePct);

    try {
      // Convert File → object URL so Tesseract can read it
      const imageUrl = URL.createObjectURL(file);

      const { data } = await worker.recognize(imageUrl);

      URL.revokeObjectURL(imageUrl); // clean up memory

      const text = (data.text || '').trim();

      results.push({
        name: file.name,
        text: text || '(No text found in this image)',
        confidence: data.confidence ? Math.round(data.confidence) : null,
      });

    } catch (err) {
      console.error('OCR failed for', file.name, err);
      results.push({
        name:  file.name,
        text:  '',
        error: getErrorMessage(err),
      });
    }
  }

  // Clean up worker
  await worker.terminate();

  window.showProgress('Done!', 100);
  await new Promise(r => setTimeout(r, 400));

  window.hideProgress();
  window.showResults(results);

  extractBtn.disabled = false;
  clearBtn.disabled   = false;
  actionRow.style.display = 'none'; // results now showing
};

// ── Error messages ──
function getErrorMessage(err) {
  if (!err) return 'Unknown error';
  const msg = (err.message || err.toString()).toLowerCase();

  if (msg.includes('not a valid image') || msg.includes('cannot identify image')) {
    return 'Not a valid image file';
  }
  if (msg.includes('out of memory') || msg.includes('allocation')) {
    return 'File too large for browser memory';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error loading language data';
  }
  return 'OCR failed — try again';
}
