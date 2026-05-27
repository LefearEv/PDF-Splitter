/* ============================================================
   APP.JS — Visual PDF Splitter
   PDF.js + pdf-lib + IndexedDB History
   ============================================================ */

'use strict';

// ============================================================
// PDF.js CONFIG
// ============================================================
// PDF.js CDN non-module build exposes global `pdfjsLib`
const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============================================================
// STATE
// ============================================================
const state = {
  pdfBytes: null,          // Uint8Array — raw PDF bytes
  pdfDoc: null,            // PDF.js PDFDocumentProxy
  fileName: '',
  pageCount: 0,
  selectedPages: new Set(), // 1-indexed
  lastClickedPage: null,
  db: null,
};

// ============================================================
// INDEXEDDB
// ============================================================
const DB_NAME = 'VisualPDFSplitter';
const DB_VER  = 1;
const STORE   = 'history';

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbRequest(mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function saveHistory(name, pageCount, bytes) {
  const record = { name, pageCount, bytes, timestamp: Date.now() };
  // Check for duplicate by name
  const all = await getAllHistory();
  const existing = all.find(h => h.name === name);
  if (existing) {
    await dbRequest('readwrite', s => s.delete(existing.id));
  }
  return dbRequest('readwrite', s => s.add(record));
}

function getAllHistory() {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.timestamp - a.timestamp));
    req.onerror   = () => reject(req.error);
  });
}

function getHistoryById(id) {
  return dbRequest('readonly', s => s.get(id));
}

function deleteHistoryById(id) {
  return dbRequest('readwrite', s => s.delete(id));
}

function clearHistory() {
  return dbRequest('readwrite', s => s.clear());
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// RENDER PDF
// ============================================================
async function loadPDF(bytes, fileName) {
  state.pdfBytes = bytes;
  state.fileName = fileName;
  state.selectedPages.clear();
  state.lastClickedPage = null;

  // Show viewer
  document.getElementById('upload-zone').hidden = true;
  const viewer = document.getElementById('pdf-viewer');
  viewer.hidden = false;

  document.getElementById('viewer-filename').textContent = fileName;
  document.getElementById('loading-state').style.display = 'flex';
  document.getElementById('pages-grid').innerHTML = '';

  try {
    const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    state.pdfDoc = pdfDoc;
    state.pageCount = pdfDoc.numPages;

    document.getElementById('viewer-meta').textContent =
      `${state.pageCount} halaman`;
    document.getElementById('btn-new-file').style.display = 'flex';

    await renderAllPages(pdfDoc);
    document.getElementById('loading-state').style.display = 'none';

    // Save to history
    await saveHistory(fileName, state.pageCount, bytes);
    await renderHistorySidebar();

    showToast(`${fileName} berhasil dimuat (${state.pageCount} halaman)`, 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal membuka PDF. Pastikan file tidak terproteksi.', 'error');
    resetToUpload();
  }
}

async function renderAllPages(pdfDoc) {
  const grid = document.getElementById('pages-grid');
  const total = pdfDoc.numPages;

  // Create skeleton cards first
  for (let i = 1; i <= total; i++) {
    const card = createThumbCard(i, true);
    grid.appendChild(card);
  }

  // Render pages one by one
  for (let i = 1; i <= total; i++) {
    updateProgress(i, total);
    const page = await pdfDoc.getPage(i);
    const canvas = await renderPageToCanvas(page, 200);
    const card = grid.querySelector(`[data-page="${i}"]`);
    const wrap = card.querySelector('.thumb-canvas-wrap');
    wrap.innerHTML = '';
    wrap.appendChild(canvas);
    const overlay = document.createElement('div');
    overlay.className = 'thumb-overlay';
    const check = document.createElement('div');
    check.className = 'thumb-check';
    check.textContent = '✓';
    overlay.appendChild(check);
    wrap.appendChild(overlay);
    // Yield to browser every 5 pages
    if (i % 5 === 0) await sleep(0);
  }

  updateProgress(total, total);
}

async function renderPageToCanvas(pdfPage, targetWidth) {
  const viewport = pdfPage.getViewport({ scale: 1 });
  const scale = targetWidth / viewport.width;
  const scaledViewport = pdfPage.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width  = scaledViewport.width;
  canvas.height = scaledViewport.height;

  const ctx = canvas.getContext('2d');
  await pdfPage.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
  return canvas;
}

function createThumbCard(pageNum, skeleton = false) {
  const card = document.createElement('div');
  card.className = 'page-thumb';
  card.dataset.page = pageNum;
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', `Halaman ${pageNum}`);
  card.setAttribute('tabindex', '0');

  const wrap = document.createElement('div');
  wrap.className = 'thumb-canvas-wrap';

  if (skeleton) {
    const sk = document.createElement('div');
    sk.className = 'thumb-skeleton';
    wrap.appendChild(sk);
  }

  const footer = document.createElement('div');
  footer.className = 'thumb-footer';
  const num = document.createElement('span');
  num.className = 'thumb-num';
  num.textContent = `${pageNum}`;
  footer.appendChild(num);

  card.appendChild(wrap);
  card.appendChild(footer);

  card.addEventListener('click', (e) => handlePageClick(pageNum, e.shiftKey));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePageClick(pageNum, e.shiftKey);
    }
  });

  return card;
}

function updateProgress(current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.getElementById('progress-bar').style.width = `${pct}%`;
  document.getElementById('progress-label').textContent = `${current} / ${total}`;
  document.getElementById('loading-text').textContent =
    current === total ? 'Selesai!' : `Memuat halaman ${current} dari ${total}…`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// SELECTION LOGIC
// ============================================================
function handlePageClick(pageNum, shiftKey) {
  if (shiftKey && state.lastClickedPage !== null) {
    // Range select
    const from = Math.min(state.lastClickedPage, pageNum);
    const to   = Math.max(state.lastClickedPage, pageNum);
    for (let p = from; p <= to; p++) state.selectedPages.add(p);
  } else {
    // Toggle single
    if (state.selectedPages.has(pageNum)) {
      state.selectedPages.delete(pageNum);
    } else {
      state.selectedPages.add(pageNum);
    }
    state.lastClickedPage = pageNum;
  }

  updatePageVisuals();
  updateActionBar();
}

function updatePageVisuals() {
  const cards = document.querySelectorAll('.page-thumb');
  cards.forEach(card => {
    const p = parseInt(card.dataset.page);
    if (state.selectedPages.has(p)) {
      card.classList.add('selected');
      card.setAttribute('aria-selected', 'true');
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-selected', 'false');
    }
  });
}

function selectAll() {
  for (let p = 1; p <= state.pageCount; p++) state.selectedPages.add(p);
  updatePageVisuals();
  updateActionBar();
}

function deselectAll() {
  state.selectedPages.clear();
  state.lastClickedPage = null;
  updatePageVisuals();
  updateActionBar();
}

function invertSelection() {
  for (let p = 1; p <= state.pageCount; p++) {
    if (state.selectedPages.has(p)) state.selectedPages.delete(p);
    else state.selectedPages.add(p);
  }
  updatePageVisuals();
  updateActionBar();
}

// ============================================================
// ACTION BAR
// ============================================================
function updateActionBar() {
  const bar = document.getElementById('action-bar');
  const count = state.selectedPages.size;

  document.getElementById('action-count').textContent = count;

  // Page chips (sorted)
  const pagesEl = document.getElementById('action-pages');
  pagesEl.innerHTML = '';
  const sorted = [...state.selectedPages].sort((a, b) => a - b);
  const shown  = sorted.slice(0, 18);
  shown.forEach(p => {
    const chip = document.createElement('span');
    chip.className = 'page-chip';
    chip.textContent = p;
    pagesEl.appendChild(chip);
  });
  if (sorted.length > 18) {
    const more = document.createElement('span');
    more.className = 'page-chip';
    more.textContent = `+${sorted.length - 18}`;
    pagesEl.appendChild(more);
  }

  if (count > 0) {
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

// ============================================================
// DOWNLOAD / SPLIT
// ============================================================
async function downloadSplitPDF() {
  if (state.selectedPages.size === 0) return;

  const btn = document.getElementById('btn-download');
  btn.classList.add('loading');
  btn.querySelector('span').textContent = 'Memproses…';

  try {
    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(state.pdfBytes);
    const newDoc = await PDFDocument.create();

    const sorted  = [...state.selectedPages].sort((a, b) => a - b);
    const indices = sorted.map(p => p - 1); // 0-indexed

    const copied  = await newDoc.copyPages(srcDoc, indices);
    copied.forEach(page => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `split_${state.fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    showToast(`PDF berhasil diunduh (${sorted.length} halaman)`, 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal membuat PDF. Coba lagi.', 'error');
  } finally {
    btn.classList.remove('loading');
    btn.querySelector('span').textContent = 'Download Split PDF';
  }
}

// ============================================================
// HISTORY SIDEBAR
// ============================================================
async function renderHistorySidebar() {
  const list  = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const badge = document.getElementById('history-count');

  const items = await getAllHistory();
  badge.textContent = items.length;

  // Remove existing items (keep empty state)
  list.querySelectorAll('.history-item').forEach(el => el.remove());

  if (items.length === 0) {
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.dataset.id = item.id;
    if (item.name === state.fileName) el.classList.add('active');

    const ago = timeAgo(item.timestamp);

    el.innerHTML = `
      <div class="history-icon">📄</div>
      <div class="history-info">
        <span class="history-name" title="${item.name}">${item.name}</span>
        <span class="history-meta">${item.pageCount} hal · ${ago}</span>
      </div>
      <button class="history-del" data-id="${item.id}" title="Hapus dari riwayat" aria-label="Hapus ${item.name}">×</button>
    `;

    // Click to reopen
    el.addEventListener('click', async (e) => {
      if (e.target.closest('.history-del')) return;
      await openFromHistory(item.id);
    });

    // Delete button
    el.querySelector('.history-del').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteHistoryById(item.id);
      el.remove();
      const remaining = await getAllHistory();
      badge.textContent = remaining.length;
      if (remaining.length === 0 && empty) empty.style.display = 'flex';
      showToast('Riwayat dihapus', 'info', 2000);
    });

    list.appendChild(el);
  });
}

async function openFromHistory(id) {
  const item = await getHistoryById(id);
  if (!item) return;
  showToast(`Membuka ${item.name}…`, 'info', 2000);
  await loadPDF(new Uint8Array(item.bytes), item.name);
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(min / 60);
  const day  = Math.floor(hr / 24);
  if (day > 0)  return `${day} hari lalu`;
  if (hr > 0)   return `${hr} jam lalu`;
  if (min > 0)  return `${min} menit lalu`;
  return 'Baru saja';
}

// ============================================================
// RESET / NEW FILE
// ============================================================
function resetToUpload() {
  state.pdfBytes = null;
  state.pdfDoc   = null;
  state.fileName = '';
  state.pageCount = 0;
  state.selectedPages.clear();
  state.lastClickedPage = null;

  document.getElementById('pdf-viewer').hidden = true;
  document.getElementById('upload-zone').hidden = false;
  document.getElementById('pages-grid').innerHTML = '';
  document.getElementById('action-bar').classList.remove('visible');
  document.getElementById('file-input').value = '';
}

// ============================================================
// DRAG & DROP
// ============================================================
function initDragDrop() {
  const zone = document.getElementById('upload-zone');

  ['dragenter', 'dragover'].forEach(evt => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    document.addEventListener(evt, (e) => e.preventDefault());
  });

  ['dragleave', 'drop'].forEach(evt => {
    zone.addEventListener(evt, () => zone.classList.remove('drag-over'));
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  // Also allow drop anywhere on the page when viewer is showing
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!document.getElementById('upload-zone').hidden) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

// ============================================================
// FILE HANDLING
// ============================================================
async function handleFile(file) {
  if (!file || file.type !== 'application/pdf') {
    showToast('Hanya file PDF yang didukung.', 'error');
    return;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  await loadPDF(bytes, file.name);
}

// ============================================================
// SIDEBAR TOGGLE
// ============================================================
function toggleSidebar() {
  const layout  = document.getElementById('app-layout');
  const sidebar = document.getElementById('sidebar');
  const isOpen  = layout.classList.toggle('sidebar-open');
  sidebar.classList.toggle('open', isOpen);
  sidebar.classList.toggle('closed', !isOpen);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function bindEvents() {
  // Upload button
  document.getElementById('btn-upload').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  // File input change
  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // New file button
  document.getElementById('btn-new-file').addEventListener('click', resetToUpload);

  // Sidebar toggle
  document.getElementById('btn-toggle-sidebar').addEventListener('click', toggleSidebar);

  // Selection controls
  document.getElementById('btn-select-all').addEventListener('click', selectAll);
  document.getElementById('btn-deselect-all').addEventListener('click', deselectAll);
  document.getElementById('btn-invert').addEventListener('click', invertSelection);

  // Download
  document.getElementById('btn-download').addEventListener('click', downloadSplitPDF);

  // Clear history
  document.getElementById('btn-clear-history').addEventListener('click', async () => {
    await clearHistory();
    await renderHistorySidebar();
    showToast('Semua riwayat dihapus', 'info');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); selectAll(); }
    if (e.key === 'Escape') deselectAll();
  });
}

// ============================================================
// INIT
// ============================================================
async function init() {
  state.db = await initDB();

  // Start with sidebar open on desktop
  if (window.innerWidth >= 768) {
    document.getElementById('app-layout').classList.add('sidebar-open');
    document.getElementById('sidebar').classList.remove('closed');
  } else {
    document.getElementById('sidebar').classList.add('closed');
  }

  await renderHistorySidebar();
  bindEvents();
  initDragDrop();
}

init().catch(console.error);
