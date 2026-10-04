/**
 * PLE-CC2 OSPE Practice System — Main Application Logic
 * File: app.js
 * ====================================================
 * จัดการสิทธิ์การแสดงผล, โหลดข้อมูลเคสจาก Google Apps Script API
 * หรือสลับไปใช้ Offline Database หากยังไม่เชื่อมต่อ API, 
 * และควบคุม Interactive Checklist
 */

// อัปเดต URL ของ Google Apps Script Web App ที่นี่หลังทำ Deployment เสร็จ
const API_URL = 'https://script.google.com/macros/s/AKfycbyabU-EfF9Ob4zwi07DvovB3gxVyednn1HZ4OUyWIi4wQBczPCaaRDgyHlkaMvnM_AK/exec';
let currentApiUrl = API_URL;

// ──────────────────────────────────────────────────────────────
// Vercel Web Analytics & Speed Insights Tracker
// ──────────────────────────────────────────────────────────────
(function initVercelTracking() {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };

  if (typeof document !== 'undefined' && !document.querySelector('script[src*="/_vercel/insights/script.js"]')) {
    const va = document.createElement('script');
    va.defer = true;
    va.src = '/_vercel/insights/script.js';
    document.head.appendChild(va);
  }

  if (typeof document !== 'undefined' && !document.querySelector('script[src*="/_vercel/speed-insights/script.js"]')) {
    const si = document.createElement('script');
    si.defer = true;
    si.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(si);
  }
})();

const AppState = {
  theme: 'light',
  cases: [],
  filteredCases: [],
  currentCase: null,
  activeFilters: {
    category: 'All',
    mainGroup: 'All',
    disease: 'All',
    source: 'All',
    search: ''
  },
  checklistProgress: {}, // { caseId: [checked_id1, checked_id2] }
  dataReady: false,      // true = API sync done (full content available)
  dataReadyCount: 0      // number of cases with full content confirmed
};

// ──────────────────────────────────────────────────────────────
// 0. AUTHENTICATION & LOCK SYSTEM (Password: rxcu)
// ──────────────────────────────────────────────────────────────
const SYSTEM_AUTH_PASS = 'rxcu';

function initAuthGuard() {
  const isAuth = localStorage.getItem('ospe_auth_pass') === SYSTEM_AUTH_PASS;
  
  if (!isAuth) {
    document.body.classList.add('auth-locked');
    renderAuthModal();
  } else {
    document.body.classList.remove('auth-locked');
    addLogoutButton();
  }
}

function renderAuthModal() {
  if (document.getElementById('auth-gate-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'auth-gate-overlay';
  overlay.className = 'auth-gate-overlay';
  overlay.innerHTML = `
    <div class="auth-card">
      <div class="auth-icon-circle">🔐</div>
      <h2 class="auth-title">RxCU OSPE Hub</h2>
      <p class="auth-subtitle">ระบบฝึกซ้อมเตรียมสอบ OSPE (สำหรับ RxCU)<br>โปรดใส่รหัสผ่านเพื่อเข้าใช้งานระบบ</p>
      
      <form id="auth-form" onsubmit="handleAuthSubmit(event)">
        <div class="auth-input-group">
          <input type="password" id="auth-pass-input" class="auth-input" placeholder="กรอกรหัสผ่าน . . ." autocomplete="current-password" autofocus required>
          <button type="button" class="auth-eye-btn" onclick="togglePassVisibility()" title="แสดง/ซ่อนรหัสผ่าน">
            <svg id="eye-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
        </div>
        <div id="auth-error" class="auth-error-msg">⚠️ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง</div>
        <button type="submit" class="btn btn-primary auth-submit-btn">🔑 ปลดล็อกเข้าใช้งาน (Unlock)</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
}

function togglePassVisibility() {
  const input = document.getElementById('auth-pass-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('auth-pass-input');
  const errorMsg = document.getElementById('auth-error');
  
  if (input && input.value.trim() === SYSTEM_AUTH_PASS) {
    localStorage.setItem('ospe_auth_pass', SYSTEM_AUTH_PASS);
    document.body.classList.remove('auth-locked');
    const overlay = document.getElementById('auth-gate-overlay');
    if (overlay) overlay.remove();
    addLogoutButton();
  } else {
    if (errorMsg) errorMsg.style.display = 'block';
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function logoutAuth() {
  if (confirm('คุณต้องการออกจากระบบ / ล็อกหน้าจอหรือไม่?')) {
    localStorage.removeItem('ospe_auth_pass');
    window.location.reload();
  }
}

function addLogoutButton() {
  if (document.getElementById('btn-logout')) return;
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight) {
    const btn = document.createElement('button');
    btn.id = 'btn-logout';
    btn.className = 'icon-btn';
    btn.onclick = logoutAuth;
    btn.title = 'ออกจากระบบ / Logout';
    btn.innerHTML = '🔒';
    topbarRight.appendChild(btn);
    return;
  }
  const navMenu = document.getElementById('nav-menu');
  if (navMenu) {
    const li = document.createElement('li');
    li.innerHTML = `
      <button id="btn-logout" class="nav-logout-btn" onclick="logoutAuth()" title="ออกจากระบบ / Logout">
        <span>🔒</span> Logout
      </button>
    `;
    navMenu.appendChild(li);
  }
}

// ──────────────────────────────────────────────────────────────
// 0.2 SAFE LOCAL STORAGE HELPER (QuotaExceeded & Safari Private Guard)
// ──────────────────────────────────────────────────────────────
function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[SafeStorage] Failed to save key "${key}" to localStorage:`, e);
    // If quota exceeded, attempt to clear transient/non-essential keys and retry once
    try {
      const nonEssentialKeys = ['ospe_cached_case_list', 'ple_ospe_debug_log'];
      nonEssentialKeys.forEach(k => { if (k !== key) localStorage.removeItem(k); });
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.warn(`[SafeStorage] Quota still exceeded after clearing transient cache. Preserving in-memory only.`);
      return false;
    }
  }
}

function safeFormatScore(num) {
  const rounded = Math.round((Number(num) || 0) * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
}

// ──────────────────────────────────────────────────────────────
// 0.5 VDO LINK & YOUTUBE RICH MEDIA HANDLER (Screen + Print)
// ──────────────────────────────────────────────────────────────
function extractYouTubeVideoId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return m ? m[1] : null;
}

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);
  return m ? m[1] : null;
}

function renderRichNoteContent(rawHtml) {
  if (!rawHtml) return '';
  
  // Regex to detect VDO Link pattern: VDO Link: / vdo link: / Video Link: / VDO: / Video: / วิดีโอ Link: / คลิป:
  const vdoPattern = /(?:<p[^>]*>)?\s*(?:(?:<strong[^>]*>|<b[^>]*>|<span[^>]*>)?\s*(?:vdo|video|วิดีโอ|คลิป)\s*(?:link)?(?::|(?:\s*:\s*)|(?:<\/strong>|<\/b>|<\/span>)\s*:\s*|:\s*(?:<\/strong>|<\/b>|<\/span>))\s*)(?:<a[^>]*href=["']([^"']+)["'][^>]*>.*?<\/a>|(https?:\/\/[^\s<"'>]+))(?:\s*<\/p>)?/gi;

  return rawHtml.replace(vdoPattern, (match, url1, url2) => {
    const rawUrl = url1 || url2;
    const ytVid = extractYouTubeVideoId(rawUrl);
    const driveId = extractGoogleDriveFileId(rawUrl);

    // 1. YouTube Case
    if (ytVid) {
      const cleanUrl = `https://youtu.be/${ytVid}`;
      const embedUrl = `https://www.youtube-nocookie.com/embed/${ytVid}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(cleanUrl)}`;

      return `<div class="youtube-embed-card vdo-embed-card no-print" style="white-space:normal;margin:1rem 0;background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;max-width:620px;"><div class="youtube-card-header" style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0.75rem;background:rgba(0,0,0,0.02);border-bottom:1px solid var(--border);gap:0.5rem;"><div class="youtube-card-title" style="display:flex;align-items:center;gap:0.4rem;font-weight:600;font-size:0.84rem;color:var(--text-secondary);"><span style="font-size:0.9rem;">▶</span><span>วิดีโอสาธิตเทคนิค (YouTube)</span></div><a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="youtube-ext-btn" style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-decoration:none;padding:0.2rem 0.55rem;border-radius:4px;background:var(--bg-primary);border:1px solid var(--border);display:inline-flex;align-items:center;white-space:nowrap;" title="เปิดดูใน YouTube (แท็บใหม่)">เปิดใน YouTube ↗</a></div><div class="youtube-player-wrapper" style="position:relative;width:100%;padding-bottom:56.25%;height:0;background:#090d16;overflow:hidden;"><iframe src="${embedUrl}" title="วิดีโอสาธิตเทคนิค / เฉลยสถานี" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" loading="lazy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe></div></div><div class="youtube-print-card vdo-print-card print-only" style="white-space:normal;display:none;margin:1rem 0;"><div class="youtube-print-box"><div class="youtube-print-header"><strong>📹 วิดีโอสาธิตและเฉลยเทคนิค (YouTube Reference)</strong></div><div class="youtube-print-body"><div class="youtube-print-qr-wrap"><img src="${qrUrl}" class="youtube-print-qr" alt="QR Code"></div><div class="vdo-print-link-wrap"><div class="vdo-print-link-title">🔗 สแกน QR Code หรือเข้าดูผ่านลิงก์:</div><div class="youtube-print-url">${cleanUrl}</div><div class="youtube-print-scan-hint">📲 สามารถสแกน QR Code ด้วยกล้องมือถือเพื่อเปิดรับชมได้ทันที</div></div></div></div></div>`;
    }

    // 2. Google Drive Case
    if (driveId) {
      const cleanDriveUrl = `https://drive.google.com/file/d/${driveId}/view`;
      const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(cleanDriveUrl)}`;

      return `<div class="youtube-embed-card vdo-embed-card drive-embed-card no-print" style="white-space:normal;margin:1rem 0;background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;max-width:620px;"><div class="youtube-card-header drive-card-header" style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0.75rem;background:rgba(0,0,0,0.02);border-bottom:1px solid var(--border);gap:0.5rem;"><div class="youtube-card-title" style="display:flex;align-items:center;gap:0.4rem;font-weight:600;font-size:0.84rem;color:var(--text-secondary);"><span style="font-size:0.9rem;">📁</span><span>วิดีโอสาธิตเทคนิค (Google Drive)</span></div><a href="${cleanDriveUrl}" target="_blank" rel="noopener noreferrer" class="youtube-ext-btn drive-ext-btn" style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);text-decoration:none;padding:0.2rem 0.55rem;border-radius:4px;background:var(--bg-primary);border:1px solid var(--border);display:inline-flex;align-items:center;white-space:nowrap;" title="เปิดดูใน Google Drive (แท็บใหม่)">เปิดใน Google Drive ↗</a></div><div class="youtube-player-wrapper" style="position:relative;width:100%;padding-bottom:56.25%;height:0;background:#090d16;overflow:hidden;"><iframe src="${previewUrl}" title="วิดีโอสาธิตเทคนิค / เฉลยสถานี (Google Drive)" frameborder="0" allow="autoplay; fullscreen" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" loading="lazy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe></div></div><div class="youtube-print-card vdo-print-card print-only" style="white-space:normal;display:none;margin:1rem 0;"><div class="youtube-print-box"><div class="youtube-print-header"><strong>📁 วิดีโอสาธิตและเฉลยเทคนิค (Google Drive Reference)</strong></div><div class="youtube-print-body"><div class="youtube-print-qr-wrap"><img src="${qrUrl}" class="youtube-print-qr" alt="QR Code"></div><div class="vdo-print-link-wrap"><div class="vdo-print-link-title">🔗 สแกน QR Code หรือเข้าดูผ่านลิงก์:</div><div class="youtube-print-url">${cleanDriveUrl}</div><div class="youtube-print-scan-hint">📲 สามารถสแกน QR Code ด้วยกล้องมือถือเพื่อเปิดรับชมบน Google Drive ได้ทันที</div></div></div></div></div>`;
    }

    // 3. Fallback General Link
    const safeUrl = (typeof escapeHtml === 'function') ? escapeHtml(rawUrl) : rawUrl;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(safeUrl)}`;

    return `<div class="vdo-fallback-card no-print" style="white-space:normal;margin:0.75rem 0;font-size:0.85rem;color:var(--text-secondary);"><p class="vdo-link-plain" style="margin:0;"><strong>📹 วิดีโออ้างอิง:</strong> <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">${safeUrl}</a></p></div><div class="youtube-print-card vdo-print-card print-only" style="white-space:normal;display:none;margin:1rem 0;"><div class="youtube-print-box"><div class="youtube-print-header"><strong>📹 วิดีโอหรือสื่อประกอบ (Reference Media)</strong></div><div class="youtube-print-body"><div class="youtube-print-qr-wrap"><img src="${qrUrl}" class="youtube-print-qr" alt="QR Code"></div><div class="vdo-print-link-wrap"><div class="vdo-print-link-title">🔗 เข้าดูผ่านลิงก์หรือสแกน:</div><div class="youtube-print-url">${safeUrl}</div></div></div></div></div>`;
  });
}

window.extractYouTubeVideoId = extractYouTubeVideoId;
window.renderRichNoteContent = renderRichNoteContent;

// ──────────────────────────────────────────────────────────────
// 🎵 BACKGROUND MUSIC PLAYER (Multi-track BGM Playlist)
// ──────────────────────────────────────────────────────────────
const BgmManager = {
  audio: null,
  isPlaying: false,
  volume: 0.35,
  currentTrackIndex: 0,
  tracks: [
    { id: 'mahachula', name: 'มหาจุฬาลงกรณ์ | CU Chorus (Main Theme)', src: './bgm-mahachula.mp3' },
    { id: 'shonichi', name: 'Shonichi วันแรก | CU Chorus', src: './bgm-shonichi.mp3' },
    { id: 'susu', name: 'OSPE SUSU (RxCU)', src: './bgm-ospe-susu.mp3' },
    { id: 'muan', name: 'ดนตรีให้กำลังใจม่วนๆ', src: './bgm-muan-muan.mp3' }
  ],

  get currentTrack() {
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  },

  init() {
    if (this.audio) return;
    try {
      const savedTrack = localStorage.getItem('ple_bgm_track_index');
      if (savedTrack !== null) {
        const idx = parseInt(savedTrack, 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.tracks.length) {
          this.currentTrackIndex = idx;
        }
      }

      this.audio = new Audio(this.currentTrack.src);
      this.audio.loop = true;
      this.audio.preload = 'auto';

      const savedVol = localStorage.getItem('ple_bgm_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.35;
      }
      // Never auto-play on page open/click. Only play when user explicitly clicks the play button.
      this.isPlaying = false;
      this.renderWidget();
      this.updateUI();
    } catch (e) {
      console.warn('BGM Init error:', e);
    }
  },

  async play() {
    if (!this.audio) return;
    try {
      await this.audio.play();
      this.isPlaying = true;
      localStorage.setItem('ple_bgm_enabled', 'true');
      this.updateUI();
    } catch (e) {
      console.warn('BGM Play prevented:', e);
      this.isPlaying = false;
      this.updateUI();
      throw e;
    }
  },

  pause() {
    if (!this.audio) return;
    try {
      this.audio.pause();
      this.isPlaying = false;
      localStorage.setItem('ple_bgm_enabled', 'false');
      this.updateUI();
    } catch (e) {}
  },

  toggle() {
    const pill = document.getElementById('ple-bgm-floating-bar');
    if (this.isPlaying) {
      this.pause();
      if (pill) {
        pill.classList.remove('is-visible');
        pill.style.display = 'none';
      }
    } else {
      if (pill) {
        pill.style.display = 'flex';
        pill.classList.add('is-visible');
      }
      this.play().catch(() => {});
    }
  },

  toggleWidgetVisibility() {
    const pill = document.getElementById('ple-bgm-floating-bar');
    if (pill) {
      const isShown = pill.classList.contains('is-visible') && pill.style.display !== 'none';
      if (isShown) {
        this.close();
      } else {
        pill.style.display = 'flex';
        pill.classList.add('is-visible');
      }
    }
  },

  switchTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;
    const wasPlaying = this.isPlaying;
    this.currentTrackIndex = index;
    localStorage.setItem('ple_bgm_track_index', index.toString());

    if (this.audio) {
      this.audio.pause();
      this.audio.src = this.currentTrack.src;
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;
    }

    if (wasPlaying) {
      this.play().catch(() => {});
    } else {
      this.updateUI();
    }
  },

  nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
    this.switchTrack(nextIdx);
  },

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    if (this.audio) this.audio.volume = this.volume;
    localStorage.setItem('ple_bgm_volume', this.volume.toString());
    this.updateUI();
  },

  renderWidget() {
    if (document.getElementById('ple-bgm-floating-bar')) return;

    // 1. Floating Pill Widget
    const pill = document.createElement('div');
    pill.id = 'ple-bgm-floating-bar';
    pill.className = 'ple-bgm-pill';
    pill.innerHTML = `
      <div class="ple-bgm-inner">
        <button type="button" class="ple-bgm-toggle-btn" id="ple-bgm-toggle-btn" onclick="BgmManager.toggle()" title="เปิด/ปิดเพลง">
          <span class="ple-bgm-icon" id="ple-bgm-icon">🎵</span>
          <span class="ple-bgm-waves" id="ple-bgm-waves">
            <span></span><span></span><span></span>
          </span>
        </button>
        <div class="ple-bgm-info">
          <div class="ple-bgm-title-row">
            <span class="ple-bgm-title" id="ple-bgm-title" onclick="BgmManager.toggle()">${this.currentTrack.name}</span>
          </div>
          <div class="ple-bgm-sub-row">
            <span class="ple-bgm-status" id="ple-bgm-status" onclick="BgmManager.toggle()">คลิกเพื่อเปิดเพลง</span>
          </div>
        </div>
        <button type="button" class="ple-bgm-next-btn" id="ple-bgm-next-btn" onclick="BgmManager.nextTrack()" title="เปลี่ยนเพลง (Switch Track)">
          ⏭️
        </button>
        <div class="ple-bgm-vol-wrap">
          <input type="range" class="ple-bgm-slider" id="ple-bgm-slider" min="0" max="1" step="0.05" value="${this.volume}" oninput="BgmManager.setVolume(this.value)" title="ปรับระดับเสียงดนตรี">
        </div>
        <button type="button" class="ple-bgm-close-btn" id="ple-bgm-close-btn" onclick="BgmManager.close(event)" title="ปิดแถบเพลง">✕</button>
      </div>
    `;
    
    // Attach direct click handler with stopPropagation to ensure closing works reliably
    const closeBtn = pill.querySelector('.ple-bgm-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        BgmManager.close(e);
      });
    }

    document.body.appendChild(pill);

    // 2. Inject Topbar Music button if topbar-right exists
    const topbarRight = document.querySelector('.topbar .topbar-right');
    if (topbarRight && !document.getElementById('topbar-bgm-btn')) {
      const topBtn = document.createElement('button');
      topBtn.type = 'button';
      topBtn.id = 'topbar-bgm-btn';
      topBtn.className = 'icon-btn topbar-bgm-icon-btn';
      topBtn.title = `🎵 ${this.currentTrack.name} (เปิด/ปิดเพลง)`;
      topBtn.onclick = () => BgmManager.toggle();
      topBtn.innerHTML = `<span>🎵</span>`;
      topbarRight.insertBefore(topBtn, topbarRight.firstChild);
    }
  },

  updateUI() {
    const pill = document.getElementById('ple-bgm-floating-bar');
    const icon = document.getElementById('ple-bgm-icon');
    const title = document.getElementById('ple-bgm-title');
    const status = document.getElementById('ple-bgm-status');
    const slider = document.getElementById('ple-bgm-slider');
    const topBtn = document.getElementById('topbar-bgm-btn');
    const nextBtn = document.getElementById('ple-bgm-next-btn');

    if (title) title.textContent = this.currentTrack.name;
    if (slider) slider.value = this.volume;
    if (nextBtn) nextBtn.title = `เปลี่ยนเพลง (แทร็กที่ ${this.currentTrackIndex + 1}/${this.tracks.length})`;

    if (this.isPlaying) {
      if (pill) pill.classList.add('is-playing');
      if (icon) icon.textContent = '🎶';
      if (status) status.textContent = `กำลังเล่น [${this.currentTrackIndex + 1}/${this.tracks.length}] · ${Math.round(this.volume * 100)}%`;
      if (topBtn) {
        topBtn.classList.add('is-active-music');
        topBtn.title = `🎶 กำลังเล่น: ${this.currentTrack.name} (คลิกเพื่อหยุด)`;
        topBtn.innerHTML = '<span style="animation: pulse 1s infinite; display: inline-block;">🎶</span>';
      }
    } else {
      if (pill) pill.classList.remove('is-playing');
      if (icon) icon.textContent = '🎵';
      if (status) status.textContent = `ปิดเพลงอยู่ [${this.currentTrackIndex + 1}/${this.tracks.length}] (คลิกเล่น)`;
      if (topBtn) {
        topBtn.classList.remove('is-active-music');
        topBtn.title = `🎵 ${this.currentTrack.name} (คลิกเพื่อเปิดเพลง)`;
        topBtn.innerHTML = '<span>🎵</span>';
      }
    }
  },

  close(e) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
      e.preventDefault();
    }
    const pill = document.getElementById('ple-bgm-floating-bar');
    if (pill) {
      pill.classList.remove('is-visible');
      pill.style.display = 'none';
    }
  },

  minimize(e) {
    this.close(e);
  }
};
window.BgmManager = BgmManager;

// ──────────────────────────────────────────────────────────────
// 1. Initializer & Event Listeners
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuthGuard();
  initTheme();
  initApiConfig();
  initMobileNavigation();
  loadChecklistProgress();
  
  // เริ่มต้นเครื่องเล่นเพลงประกอบพื้นหลัง
  BgmManager.init();
  
  // โหลดข้อมูลเคสเบื้องต้น (แบบสรุป) ทันที 0ms
  loadCasesData();

  // โหลดฐานข้อมูลรายละเอียดออฟไลน์: ถ้าอยู่หน้า Viewer หรือ Exam ให้โหลดทันที ถ้าอยู่หน้าอื่นให้ Lazy-load ตอนเครื่องว่าง
  const isDetailHeavyPage = window.location.pathname.includes('case-viewer') || window.location.pathname.includes('exam-simulation');
  if (isDetailHeavyPage) {
    loadOfflineDetailsWithProgress();
  } else {
    // พรีโหลดเงียบๆ ตอนเบราว์เซอร์ว่าง (Idle) เพื่อไม่ให้กระทบความเร็วการเปิดหน้า
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadOfflineDetailsWithProgress(), { timeout: 3500 });
    } else {
      setTimeout(() => loadOfflineDetailsWithProgress(), 2500);
    }
  }

  // จัดการหน้าปัจจุบัน
  detectCurrentPage();
  
  // จัดการปุ่มเปลี่ยนมุมมอง (Grid/List)
  initViewToggles();
});

// ตรวจสอบ Theme (Enforce Light Theme in Sandbox)
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
  localStorage.removeItem('theme');
}

function toggleTheme() {
  // No-op in single warm theme
}

function updateThemeButtonIcon(btn) {
  if (btn) btn.style.display = 'none';
}

// ตรวจสอบและตั้งค่ามุมมอง Grid/List
function initViewToggles() {
  const btnGrid = document.getElementById('btn-view-grid');
  const btnList = document.getElementById('btn-view-list');
  const container = document.getElementById('case-list-container');
  
  if (!btnGrid || !btnList || !container) return;
  
  // โหลดค่าจาก LocalStorage
  const savedView = localStorage.getItem('ple_case_view') || 'grid';
  if (savedView === 'list') {
    setListView(true);
  }
  
  btnGrid.addEventListener('click', () => setListView(false));
  btnList.addEventListener('click', () => setListView(true));
  
  function setListView(isList) {
    if (isList) {
      container.classList.add('list-view');
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      
      btnList.style.background = 'var(--bg-secondary)';
      btnList.style.color = 'var(--text-primary)';
      btnGrid.style.background = 'transparent';
      btnGrid.style.color = 'var(--text-muted)';
      
      localStorage.setItem('ple_case_view', 'list');
    } else {
      container.classList.remove('list-view');
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      
      btnGrid.style.background = 'var(--bg-secondary)';
      btnGrid.style.color = 'var(--text-primary)';
      btnList.style.background = 'transparent';
      btnList.style.color = 'var(--text-muted)';
      
      localStorage.setItem('ple_case_view', 'grid');
    }
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('theme', AppState.theme);
  
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) updateThemeButtonIcon(themeBtn);
}

function updateThemeButtonIcon(btn) {
  if (!btn) return;
  const isLight = AppState.theme === 'light';
  btn.innerHTML = isLight ? '🌙' : '☀️';
  btn.setAttribute('title', isLight ? 'สลับเป็นโหมดกลางคืน (Dark Mode)' : 'สลับเป็นโหมดกลางวัน (Light Mode)');
}

// จัดการ API Input modal/config (Deprecated: API is configured backend-only now)
function initApiConfig() {
  // No-op
}

// Helper ตรวจสอบความพร้อมของเคส (Active vs Unactive)
function isCaseActive(c) {
  if (!c) return false;
  if (c.isActive === false || c.isActive === 'FALSE' || String(c.isActive).toUpperCase() === 'FALSE') return false;
  if (c.caseStatus && (String(c.caseStatus).toLowerCase() === 'unactive' || String(c.caseStatus).toLowerCase() === 'inactive')) return false;
  return true;
}
window.isCaseActive = isCaseActive;

// ──────────────────────────────────────────────────────────────
// 2. Data Fetching & State
// ──────────────────────────────────────────────────────────────
async function loadCasesData() {
  // 1. ดึงข้อมูลออฟไลน์ที่โหลดมาพร้อมหน้าเว็บทันที 0ms เพื่อความเร็วสูงสุด
  let initialCases = [];
  const hasFreshOfflineData = typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases && OFFLINE_DATA.cases.length > 0;
  
  if (hasFreshOfflineData) {
    initialCases = OFFLINE_DATA.cases.filter(isCaseActive);
    // ซิงก์เก็บลง LocalStorage ให้ตรงกับไฟล์คอมไพล์ล่าสุดเสมอ
    try {
      localStorage.setItem('ospe_cached_case_list', JSON.stringify(initialCases));
    } catch (e) { /* ignore quota */ }
  } else {
    const cachedListStr = localStorage.getItem('ospe_cached_case_list');
    if (cachedListStr) {
      try {
        initialCases = JSON.parse(cachedListStr).filter(isCaseActive);
      } catch (e) {
        initialCases = [];
      }
    }
  }
  
  if (initialCases.length > 0) {
    AppState.cases = initialCases;
    onCasesLoaded();
    showApiStatusBanner(true, '⚡ ฐานข้อมูลในเครื่อง (พร้อมใช้งานทันที 0ms)');
  } else {
    showGlobalLoader(true);
  }
  
  // 2. Background Sync กับ Google Apps Script API (ทำงานเบื้องหลัง ไม่บล็อกผู้ใช้)
  if (currentApiUrl) {
    try {
      const cacheBuster = new Date().getTime();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds for GAS cold start
      
      const response = await fetch(`${currentApiUrl}?action=getCaseList&_cb=${cacheBuster}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.cases && result.data.cases.length > 0) {
        let fetchedCases = result.data.cases;
        if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
          fetchedCases = fetchedCases.map(apiCase => {
            const offlineMatch = OFFLINE_DATA.cases.find(o => o.caseId === apiCase.caseId);
            return offlineMatch ? Object.assign({}, offlineMatch, apiCase) : apiCase;
          });
        }
        fetchedCases = fetchedCases.filter(isCaseActive);
        
        // บันทึกความเปลี่ยนแปลงลง Cache LocalStorage
        safeSetLocalStorage('ospe_cached_case_list', JSON.stringify(fetchedCases));
        
        AppState.cases = fetchedCases;
        AppState.dataReady = true;
        AppState.dataReadyCount = fetchedCases.length;
        showApiStatusBanner(true, `✅ ซิงก์ข้อมูลล่าสุดกับ Google Sheet สำเร็จ (${fetchedCases.length} เคส)`);
        // Dispatch event so exam-simulation and other pages can react
        window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: fetchedCases.length } }));
        onCasesLoaded();
        return;
      }
    } catch (e) {
      console.warn('Google Apps Script API response delayed/timed out. Continuing with offline data:', e);
      if (AppState.cases && AppState.cases.length > 0) {
        AppState.dataReady = true;
        AppState.dataReadyCount = AppState.cases.length;
        // ปรับเป็นแสดงแถบสีเขียวเสมอ (true) เพื่อให้นิสิตไม่กังวล และใช้คำว่า "พร้อมใช้งาน"
        showApiStatusBanner(true, '✅ พร้อมใช้งาน (ใช้งานข้อมูลล่าสุดในเครื่อง)');
        window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: AppState.cases.length, isOffline: true } }));
      } else {
        showApiStatusBanner(false, '⚠️ ไม่พบข้อมูลข้อสอบในเครื่อง กรุณาเชื่อมต่ออินเทอร์เน็ต');
      }
    }
  } else {
    if (!AppState.cases || AppState.cases.length === 0) {
      showApiStatusBanner(false, 'No API Configured — Using Offline Data');
    }
  }
  
  // Fallback if offline data wasn't loaded at step 1
  if (!AppState.cases || AppState.cases.length === 0) {
    if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
      AppState.cases = OFFLINE_DATA.cases.filter(isCaseActive);
    } else {
      AppState.cases = [];
    }
    AppState.dataReady = true;
    AppState.dataReadyCount = AppState.cases.length;
    window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: AppState.cases.length, isOffline: true } }));
    onCasesLoaded();
  } else if (!AppState.dataReady) {
    AppState.dataReady = true;
    AppState.dataReadyCount = AppState.cases.length;
    window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: AppState.cases.length, isOffline: true } }));
  }
}


/**
 * Decrypt AES-256-GCM encrypted case data with PBKDF2 key derivation
 */
async function decryptCaseData(encryptedObj, password) {
  if (!encryptedObj || !encryptedObj.ciphertext || !password) return null;
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password.trim()),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const salt = Uint8Array.from(atob(encryptedObj.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedObj.ciphertext), c => c.charCodeAt(0));
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted));
}
window.decryptCaseData = decryptCaseData;

function getSubsetGroupType(parentItem, subsetItems) {
  const pText = (typeof parentItem === 'string' ? parentItem : (parentItem ? (parentItem.text || parentItem.innerText || '') : '')).toLowerCase();
  const subTexts = (subsetItems || []).map(s => {
    if (typeof s === 'string') return s.toLowerCase();
    if (!s) return '';
    return (s.text || s.innerText || '').toLowerCase();
  });
  const allText = [pText, ...subTexts].join(' ');

  // 1. Priority 1: Check Explicit Tags
  const rubricKeywords = ['[rubric]', '(rubric)', '[เกณฑ์]', '(เกณฑ์)', '(เกณฑ์คะแนน)', '(เลือกข้อเดียว)', '(เลือกเพียง 1 ข้อ)', '(เลือกเพียงหนึ่งข้อ)', '(เลือก 1 ข้อ)', '(ระดับคะแนน)', 'เลือกข้อใดข้อหนึ่ง'];
  const additiveKeywords = ['[additive]', '(additive)', '(รวมคะแนน)', '(เลือกหลายข้อ)', '(เลือกได้หลายข้อ)', '(ถามอย่างน้อย)', '(ตอบอย่างน้อย)', '(อย่างน้อย', 'อย่างน้อย'];

  if (rubricKeywords.some(k => allText.includes(k))) return 'rubric';
  if (additiveKeywords.some(k => allText.includes(k))) return 'additive';

  // 2. Priority 2: Deterministic Heuristic based on score distribution
  let parentScore = 1.0;
  if (parentItem) {
    if (typeof parentItem.score !== 'undefined') parentScore = parseFloat(parentItem.score) || 1.0;
    else if (parentItem.getAttribute && parentItem.getAttribute('data-score')) parentScore = parseFloat(parentItem.getAttribute('data-score')) || 1.0;
  }

  const posScores = (subsetItems || []).map(s => {
    let sc = 0;
    if (typeof s === 'object' && s !== null) {
      if (typeof s.score !== 'undefined') sc = parseFloat(s.score) || 0;
      else if (s.getAttribute && s.getAttribute('data-score')) sc = parseFloat(s.getAttribute('data-score')) || 0;
    }
    return sc;
  }).filter(sc => sc > 0);

  if (posScores.length <= 1) return 'rubric';

  // If multiple items have identical positive scores (e.g. [1, 1, 1] or [0.5, 0.5]) -> Additive
  const hasDuplicateScores = posScores.some((sc, idx) => posScores.indexOf(sc) !== idx);
  if (hasDuplicateScores) return 'additive';

  // If no single subset reaches parent score -> Additive
  const hasFullScoreItem = posScores.some(sc => sc >= parentScore);
  if (!hasFullScoreItem) return 'additive';

  // If one item reaches parentScore and others are distinct descending tiers -> Rubric
  return 'rubric';
}
window.getSubsetGroupType = getSubsetGroupType;

function resolveChecklistSubsets(checklist) {
  if (!checklist || !Array.isArray(checklist) || checklist.length === 0) return checklist;
  
  const n = checklist.length;
  
  // 1. If explicit isSubset flags already exist from document bullet nesting (Level 0 vs Level 1+), preserve them!
  const hasExplicitSubsets = checklist.some(item => item && item.isSubset === true);
  if (hasExplicitSubsets) {
    for (let idx = 0; idx < n; idx++) {
      const sc = parseFloat(checklist[idx].score) || 0;
      if (sc === 0) checklist[idx].isSubset = true;
    }
    return checklist;
  }
  
  // 2. Heuristic Resolver for untagged / raw text
  const isSub = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const t = (checklist[i].text || '').trim();
    const sc = parseFloat(checklist[i].score) || 0;
    if (sc === 0 || t.startsWith('-') || t.startsWith('•') || t.startsWith('○') || t.startsWith('o ') || t.startsWith('▪') || t.startsWith('▫')) {
      isSub[i] = true;
    }
  }
  
  let i = 0;
  while (i < n) {
    if (isSub[i]) {
      i++;
      continue;
    }
    
    const pScore = parseFloat(checklist[i].score) || 0;
    let j = i + 1;
    const subGroup = [];
    
    while (j < n) {
      const nextItem = checklist[j];
      const nextT = (nextItem.text || '').trim();
      const nextSc = parseFloat(nextItem.score) || 0;
      
      if (nextSc === 0 || isSub[j] || nextT.startsWith('-') || nextT.startsWith('•') || nextT.startsWith('○')) {
        subGroup.push(j);
        j++;
        if (nextSc === 0) {
          break; // Strict 0-score boundary: STOP rubric group immediately!
        }
        continue;
      }
      
      // Lookahead check for 0-score or subset marker within next few items in this cluster
      let clusterHasZero = false;
      for (let k = j; k < Math.min(n, j + 5); k++) {
        const kSc = parseFloat(checklist[k].score) || 0;
        if (kSc === 0) {
          clusterHasZero = true;
          break;
        }
      }
      
      if (clusterHasZero && (nextSc <= pScore || subGroup.length > 0)) {
        subGroup.push(j);
        j++;
      } else {
        break;
      }
    }
    
    if (subGroup.length >= 1 && subGroup.some(k => (parseFloat(checklist[k].score) || 0) === 0)) {
      isSub[i] = false; // Confirmed parent
      for (const k of subGroup) {
        isSub[k] = true; // Confirmed subsets
      }
      i = j;
    } else {
      i++;
    }
  }
  
  for (let idx = 0; idx < n; idx++) {
    checklist[idx].isSubset = isSub[idx];
  }
  return checklist;
}
window.resolveChecklistSubsets = resolveChecklistSubsets;

/**
 * buildPrintChecklistTable — สร้างตาราง Checklist สวยงามสำหรับระบบพิมพ์ (ใช้ร่วมกันทั้ง Single & Batch Print)
 * รองรับการแบ่งกลุ่ม, แยก Parent (ช่องสี่เหลี่ยม) vs Subset (วงกลมวิทยุ + เยื้องย่อหน้า), และแสดงรูปภาพ/คะแนน
 * @param {object} c Case object
 * @returns {string} HTML table
 */
function buildPrintChecklistTable(c) {
  if (!c || !c.checklist || c.checklist.length === 0) return '';
  
  if (typeof resolveChecklistSubsets === 'function') {
    resolveChecklistSubsets(c.checklist);
  }

  // Map global index for each item
  const itemGlobalIndices = new Map();
  c.checklist.forEach((item, index) => itemGlobalIndices.set(item, index));

  const groups = {};
  c.checklist.forEach(item => {
    const g = item.group || 'ทั่วไป';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  let html = `<table class="print-checklist-table" style="width:100%; border-collapse:collapse; margin-top:0.5rem;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="width:75%; border:1px solid #475569; padding:0.45rem 0.6rem; text-align:left; font-size:9.5pt;">รายละเอียดการปฏิบัติงาน / เกณฑ์ประเมิน</th>
        <th style="width:12.5%; border:1px solid #475569; padding:0.45rem; text-align:center; vertical-align:middle; font-size:9.5pt;">คะแนน</th>
        <th style="width:12.5%; border:1px solid #475569; padding:0.45rem; text-align:center; vertical-align:middle; font-size:9.5pt;">ผลประเมิน</th>
      </tr>
    </thead>
    <tbody>`;

  Object.keys(groups).forEach(gName => {
    html += `<tr class="print-table-group-row">
      <td colspan="3" style="background:#e2e8f0; font-weight:700; font-family:var(--font-title); border:1px solid #475569; padding:0.45rem 0.6rem; font-size:9pt; color:#0f172a;">
        📁 หมวดประเมิน: ${escapeHtml(gName)}
      </td>
    </tr>`;

    groups[gName].forEach(item => {
      const isSubset = !!item.isSubset;
      let imgHtml = item.imageHtml || '';
      if (!imgHtml && typeof getChecklistItemImage === 'function') {
        imgHtml = getChecklistItemImage(item, itemGlobalIndices.get(item) || 0, c);
      }

      if (isSubset) {
        html += `<tr class="print-row-subset">
          <td style="border:1px solid #475569; padding:0.35rem 0.6rem 0.35rem 2rem; color:#334155; font-size:9pt; vertical-align:middle;">
            <span style="display:inline-block; width:13px; height:13px; border:1.5px solid #64748b; border-radius:50%; vertical-align:middle; margin-right:0.45rem; background:#fff;"></span>
            <span style="vertical-align:middle;">${item.textHtml || escapeHtml(item.text)}</span>
            ${imgHtml ? `<div style="margin-top:0.25rem;">${imgHtml}</div>` : ''}
          </td>
          <td class="print-center-cell" style="border:1px solid #475569; padding:0.35rem; text-align:center; vertical-align:middle; font-weight:600; color:#475569; font-size:9pt;">${item.score}</td>
          <td class="print-center-cell" style="border:1px solid #475569; padding:0.35rem; text-align:center; vertical-align:middle;">
            <span class="print-eval-box" style="display:inline-block; width:15px; height:15px; border:1.5px solid #475569; border-radius:3px; vertical-align:middle; background:#fff;"></span>
          </td>
        </tr>`;
      } else {
        html += `<tr class="print-row-parent" style="background-color:#f8fafc;">
          <td style="border:1px solid #475569; padding:0.45rem 0.6rem; font-weight:700; color:#0f172a; font-size:9.5pt; vertical-align:middle;">
            <span style="display:inline-block; width:13px; height:13px; border:1.5px solid #0f172a; border-radius:3px; vertical-align:middle; margin-right:0.45rem; background:#fff;"></span>
            <span style="vertical-align:middle;">${item.textHtml || escapeHtml(item.text)}</span>
            ${imgHtml ? `<div style="margin-top:0.25rem;">${imgHtml}</div>` : ''}
          </td>
          <td class="print-center-cell" style="border:1px solid #475569; padding:0.45rem; text-align:center; vertical-align:middle; font-weight:800; color:#0f172a; font-size:10pt;">${item.score}</td>
          <td class="print-center-cell" style="border:1px solid #475569; padding:0.45rem; text-align:center; vertical-align:middle;">
            <span class="print-eval-box" style="display:inline-block; width:15px; height:15px; border:1.5px solid #0f172a; border-radius:3px; vertical-align:middle; background:#fff;"></span>
          </td>
        </tr>`;
      }
    });
  });

  html += `</tbody></table>`;
  return html;
}
window.buildPrintChecklistTable = buildPrintChecklistTable;

function stripSectionHeaders(str) {
  if (!str) return '';
  return str
    .replace(/<p[^>]*>\s*#+\s*(?:สถานการณ์|โจทย์|ข้อมูลผู้ป่วย|สิ่งที่มีให้|อุปกรณ์|Checklist|เกณฑ์ประเมิน|ข้อมูลผู้ตรวจ|เฉลย|หมายเหตุ|ข้อมูลเคส)[^<]*<\/p>/gi, '')
    .replace(/^#+\s*(?:สถานการณ์|โจทย์|ข้อมูลผู้ป่วย|สิ่งที่มีให้|อุปกรณ์|Checklist|เกณฑ์ประเมิน|ข้อมูลผู้ตรวจ|เฉลย|หมายเหตุ|ข้อมูลเคส)[^\n]*\n?/gim, '');
}
window.stripSectionHeaders = stripSectionHeaders;

function getFormattedCaseScenarioHtml(c) {
  if (!c) return '<p>ไม่มีข้อมูลสถานการณ์</p>';
  let raw = c.contentHtml || '';
  if (!raw && c.scenario) {
    raw = /<[a-z][\s\S]*>/i.test(c.scenario) ? c.scenario : `<p>${c.scenario.replace(/\r?\n/g, '<br>')}</p>`;
  }
  if (!raw && typeof document !== 'undefined' && document.getElementById('case-scenario-content')) {
    raw = document.getElementById('case-scenario-content').innerHTML;
  }
  if (!raw) return '<p>ไม่มีข้อมูลสถานการณ์</p>';

  raw = stripSectionHeaders(raw);
  return raw;
}
window.getFormattedCaseScenarioHtml = getFormattedCaseScenarioHtml;

function getFormattedCasePatientHtml(c) {
  if (!c) return '';
  let raw = c.patientInfoHtml || '';
  if (!raw && typeof document !== 'undefined' && document.getElementById('case-patient-content')) {
    raw = document.getElementById('case-patient-content').innerHTML;
  }
  if (!raw) return '';
  raw = stripSectionHeaders(raw);
  return (raw.trim() && raw.replace(/<[^>]*>/g, '').trim().length > 0) ? raw : '';
}
window.getFormattedCasePatientHtml = getFormattedCasePatientHtml;

function getFormattedCaseEquipmentHtml(c) {
  if (!c) return '';
  let raw = c.equipmentHtml || '';
  if (!raw && typeof document !== 'undefined' && document.getElementById('case-equipment-content')) {
    raw = document.getElementById('case-equipment-content').innerHTML;
  }
  if (!raw) return '';
  raw = stripSectionHeaders(raw).trim();
  if (raw.startsWith('<li')) {
    const isNumbered = /^\s*<li[^>]*>\s*(\d+[\.\)]|\(\d+\))/i.test(raw);
    const tag = isNumbered ? 'ol' : 'ul';
    const listClass = isNumbered ? 'ordered-list' : 'bullet-list';
    return `<${tag} class="${listClass}" style="margin: 0.3rem 0; padding-left: 1.5rem;">${raw}</${tag}>`;
  }
  return raw;
}
window.getFormattedCaseEquipmentHtml = getFormattedCaseEquipmentHtml;

/**
 * fetchCaseDetail — ดึงข้อมูล scenario/checklist เต็มของเคสจาก API แบบ on-demand
 * ใช้เมื่อ case ที่อยู่ใน AppState.cases ไม่มี contentHtml / scenario / checklist
 * (เช่น เคสใหม่ที่ยังไม่ได้อัปเดตใน offline file)
 * @param {string} caseId
 * @returns {Promise<object|null>} full case object or null
 */
async function fetchCaseDetail(caseId, forceLive = false) {
  if (!caseId) return null;
  const cleanId = caseId.trim();
  const ospeId = cleanId.startsWith('OSPE-') ? cleanId : ('OSPE-' + cleanId);
  const rawId = cleanId.replace(/^OSPE-/i, '');

  // 1. Check local OFFLINE_CASE_DETAILS if loaded and not forceLive (0ms instant resolution)
  if (!forceLive && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
    const det = OFFLINE_CASE_DETAILS[cleanId] || 
                OFFLINE_CASE_DETAILS[ospeId] || 
                OFFLINE_CASE_DETAILS[rawId] || 
                OFFLINE_CASE_DETAILS[cleanId.toUpperCase()] || 
                OFFLINE_CASE_DETAILS[ospeId.toUpperCase()];
    if (det) {
      if (det.isEncrypted) {
        const curVer = (typeof DB_VERSION_STR !== 'undefined' ? DB_VERSION_STR : '') || (typeof OFFLINE_DATA !== 'undefined' ? OFFLINE_DATA.version : '');
        const cached = sessionStorage.getItem('ple_unlocked_' + ospeId) || 
                       sessionStorage.getItem('ple_unlocked_' + cleanId) ||
                       sessionStorage.getItem('viewer_unlocked_' + ospeId) ||
                       sessionStorage.getItem('viewer_unlocked_' + cleanId);
        if (cached) {
          try {
            const decCase = JSON.parse(cached);
            if (curVer && decCase._db_version && decCase._db_version !== curVer) {
              sessionStorage.removeItem('ple_unlocked_' + ospeId);
              sessionStorage.removeItem('ple_unlocked_' + cleanId);
              sessionStorage.removeItem('viewer_unlocked_' + ospeId);
              sessionStorage.removeItem('viewer_unlocked_' + cleanId);
            } else if (!decCase._db_version && curVer) {
              sessionStorage.removeItem('ple_unlocked_' + ospeId);
              sessionStorage.removeItem('ple_unlocked_' + cleanId);
              sessionStorage.removeItem('viewer_unlocked_' + ospeId);
              sessionStorage.removeItem('viewer_unlocked_' + cleanId);
            } else {
              const idx = AppState.cases.findIndex(c => c.caseId && (c.caseId.trim() === cleanId || c.caseId.trim() === ospeId));
              if (idx !== -1) {
                AppState.cases[idx] = Object.assign({}, AppState.cases[idx], decCase);
                return AppState.cases[idx];
              }
              return decCase;
            }
          } catch (e) {}
        }
        return det;
      }
      const idx = AppState.cases.findIndex(c => c.caseId && (c.caseId.trim() === cleanId || c.caseId.trim() === ospeId || c.caseId.trim() === rawId));
      if (idx !== -1) {
        const merged = Object.assign({}, AppState.cases[idx]);
        Object.keys(det).forEach(k => {
          if (det[k] !== null && det[k] !== undefined && det[k] !== '') {
            merged[k] = det[k];
          }
        });
        if (!merged.title && AppState.cases[idx].title) merged.title = AppState.cases[idx].title;
        AppState.cases[idx] = merged;
        return AppState.cases[idx];
      }
      return Object.assign({ caseId: ospeId }, det);
    }
  }

  // 2. Fetch live from API (Google Apps Script Web App)
  if (!currentApiUrl) return null;
  try {
    const cb = new Date().getTime();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for GAS cold start
    const res = await fetch(`${currentApiUrl}?action=getCase&id=${encodeURIComponent(cleanId)}&_cb=${cb}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json.success && json.data) {
      // Validate that returned data is not an error string
      const cHtml = (json.data.contentHtml || '') + '';
      if (cHtml.includes('โหลดเนื้อหาไม่ได้') || cHtml.includes('Exception:')) {
        console.warn('Live API returned error content for', cleanId, cHtml);
        return null;
      }

      // Auto resolve subsets if not explicitly defined
      if (json.data.checklist && Array.isArray(json.data.checklist)) {
        resolveChecklistSubsets(json.data.checklist);
      }

      // Update in memory & IndexedDB
      if (typeof saveCaseToIndexedDB === 'function') {
        saveCaseToIndexedDB(json.data);
      }
      if (typeof OFFLINE_CASE_DETAILS !== 'undefined') {
        OFFLINE_CASE_DETAILS[cleanId] = json.data;
      }
      const idx = AppState.cases.findIndex(c => c.caseId && c.caseId.trim() === cleanId);
      if (idx !== -1) {
        AppState.cases[idx] = Object.assign({}, AppState.cases[idx], json.data);
        return AppState.cases[idx];
      }
      return json.data;
    }
  } catch (e) {
    console.warn('fetchCaseDetail failed for', cleanId, e);
  }
  return null;
}

/**
 * updateCurrentCaseFromDoc — ปุ่มดึงข้อมูลและรูปภาพล่าสุดสดๆ จาก Google Docs (Live Sync)
 */
async function updateCurrentCaseFromDoc() {
  if (!AppState.currentCase || !AppState.currentCase.caseId) {
    if (typeof showToast === 'function') showToast('❌ ไม่พบรหัสเคสที่จะอัปเดต', 'error');
    return;
  }
  
  const caseId = AppState.currentCase.caseId;
  const btnTop = document.getElementById('btn-update-doc-top');
  const btnAction = document.getElementById('btn-update-doc');
  
  const origTopText = btnTop ? btnTop.innerHTML : '';
  const origActionText = btnAction ? btnAction.innerHTML : '';
  
  if (btnTop) {
    btnTop.disabled = true;
    btnTop.innerHTML = '⏳ กำลัง Update Data From Google Docs...';
  }
  if (btnAction) {
    btnAction.disabled = true;
    btnAction.innerHTML = '⏳ กำลัง Update Data From Google Docs...';
  }
  
  if (typeof showToast === 'function') {
    showToast('⏳ กำลังดึงข้อมูลและรูปภาพล่าสุดจาก Google Docs...', 'info');
  }
  
  try {
    const updatedCase = await fetchCaseDetail(caseId, true); // forceLive = true
    if (updatedCase && (updatedCase.contentHtml || updatedCase.scenario || updatedCase.checklist)) {
      AppState.currentCase = updatedCase;
      if (typeof renderCaseDetail === 'function') {
        renderCaseDetail(updatedCase);
      }
      if (typeof showToast === 'function') {
        showToast('✅ Update Data From Google Docs สำเร็จเรียบร้อย!', 'success');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast('⚠️ ไม่สามารถดึงข้อมูลล่าสุดจาก Google Docs ได้ หรือโครงสร้างไม่ถูกต้อง (ระบบยังคงแสดงข้อมูลออฟไลน์เดิม)', 'warning');
      }
    }
  } catch (e) {
    console.error('Update live case failed:', e);
    if (typeof showToast === 'function') {
      showToast('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ Google Docs', 'error');
    }
  } finally {
    if (btnTop) {
      btnTop.disabled = false;
      btnTop.innerHTML = origTopText;
    }
    if (btnAction) {
      btnAction.disabled = false;
      btnAction.innerHTML = origActionText;
    }
  }
}

function onCasesLoaded() {
  // Normalize data & merge offline details if available
  if (AppState.cases && AppState.cases.length > 0) {
    AppState.cases.forEach((c, idx) => {
      if (typeof c.category === 'string') {
        c.category = c.category.trim();
        // Map Thai names just in case they were typed in Thai
        if (c.category === 'คลินิก') c.category = 'Clinic';
        if (c.category === 'ผลิต') c.category = 'Product';
        if (c.category === 'สังคม' || c.category === 'สังคมฯ') c.category = 'SAP';
      }
      if (typeof c.mainGroup === 'string') c.mainGroup = c.mainGroup.trim();

      // Merge offline details if available
      const cleanId = (c.caseId || '').trim();
      if (typeof OFFLINE_CASE_DETAILS !== 'undefined' && OFFLINE_CASE_DETAILS[cleanId]) {
        AppState.cases[idx] = Object.assign({}, c, OFFLINE_CASE_DETAILS[cleanId]);
      }
    });
  }

  showGlobalLoader(false);
  updateStatsDashboard();
  
  // กรองข้อมูลเบื้องต้น
  applyFilters();
  
  // อัปเดตตามหน้าเพจ
  if (document.getElementById('case-list-container')) {
    renderCaseList();
    renderFilterSelectOptions();
  }
}

function showGlobalLoader(show, message) {
  const loader = document.getElementById('global-loader');
  if (loader) {
    if (message) {
      const p = loader.querySelector('p');
      if (p) p.textContent = message;
    }
    loader.style.display = show ? 'flex' : 'none';
  }
}

function showApiStatusBanner(isConnected, message) {
  const banner = document.getElementById('api-status-banner');
  if (banner) {
    banner.style.display = 'flex';
    banner.className = isConnected ? 'api-banner connected' : 'api-banner offline';
    
    let textSpan = banner.querySelector('.banner-text');
    if (!textSpan) {
      banner.innerHTML = '<span class="banner-text"></span>';
      textSpan = banner.querySelector('.banner-text');
    }
    textSpan.textContent = message;
    
    // แทรกปุ่มซิงก์ใหม่แบบ dynamic หากกำหนด API URL และไม่มีปุ่มเดิมอยู่
    let syncBtn = banner.querySelector('#btn-force-sync');
    if (currentApiUrl && !syncBtn) {
      syncBtn = document.createElement('button');
      syncBtn.id = 'btn-force-sync';
      syncBtn.innerHTML = '🔄 ซิงก์ข้อมูลใหม่';
      syncBtn.style.cssText = `
        margin-left: 10px;
        padding: 3px 8px;
        font-size: 0.72rem;
        background: rgba(255, 255, 255, 0.15);
        color: inherit;
        border: 1px solid currentColor;
        border-radius: 4px;
        cursor: pointer;
        font-family: var(--font-title);
        font-weight: 600;
        transition: all 0.2s ease;
      `;
      syncBtn.onmouseover = () => {
        syncBtn.style.background = 'rgba(255, 255, 255, 0.3)';
      };
      syncBtn.onmouseout = () => {
        syncBtn.style.background = 'rgba(255, 255, 255, 0.15)';
      };
      syncBtn.onclick = (e) => {
        e.stopPropagation();
        forceSyncDatabase();
      };
      banner.appendChild(syncBtn);
    }
  }
}

async function forceSyncDatabase() {
  const btn = document.getElementById('btn-force-sync');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⌛ กำลังซิงก์...';
  }
  
  showApiStatusBanner(true, '🔄 กำลังเชื่อมต่อ Google Sheets เพื่อดึงข้อมูลล่าสุด...');
  
  try {
    if (currentApiUrl) {
      const cacheBuster = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for GAS
      
      const response = await fetch(`${currentApiUrl}?action=getCaseList&_cb=${cacheBuster}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.cases && result.data.cases.length > 0) {
        let fetchedCases = result.data.cases;
        if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
          fetchedCases = fetchedCases.map(apiCase => {
            const offlineMatch = OFFLINE_DATA.cases.find(o => o.caseId === apiCase.caseId);
            return offlineMatch ? Object.assign({}, offlineMatch, apiCase) : apiCase;
          });
        }
        fetchedCases = fetchedCases.filter(isCaseActive);
        
        safeSetLocalStorage('ospe_cached_case_list', JSON.stringify(fetchedCases));
        AppState.cases = fetchedCases;
        AppState.dataReady = true;
        AppState.dataReadyCount = fetchedCases.length;
        showApiStatusBanner(true, `✅ ซิงก์ข้อมูลล่าสุดกับ Google Sheet สำเร็จ (${fetchedCases.length} เคส)`);
        window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: fetchedCases.length } }));
        onCasesLoaded();
        return;
      }
    }
    
    // Fallback: หาก API ไม่คืนข้อมูล ให้ใช้ฐานข้อมูลในเครื่อง
    if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
      AppState.cases = OFFLINE_DATA.cases.filter(isCaseActive);
      AppState.dataReady = true;
      AppState.dataReadyCount = AppState.cases.length;
      showApiStatusBanner(true, `⚡ พร้อมใช้งาน (ฐานข้อมูลในเครื่อง ${AppState.cases.length} เคส 0ms)`);
      window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: AppState.cases.length, isOffline: true } }));
      onCasesLoaded();
    }
  } catch (err) {
    console.warn('Force sync fallback to offline cache:', err);
    if (AppState.cases && AppState.cases.length > 0) {
      showApiStatusBanner(true, `⚡ พร้อมใช้งาน (ฐานข้อมูลในเครื่อง ${AppState.cases.length} เคส 0ms)`);
    } else if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
      AppState.cases = OFFLINE_DATA.cases;
      showApiStatusBanner(true, `⚡ พร้อมใช้งาน (ฐานข้อมูลในเครื่อง ${AppState.cases.length} เคส 0ms)`);
      onCasesLoaded();
    } else {
      showApiStatusBanner(false, '⚠️ ไม่สามารถซิงก์ได้ชั่วคราว (กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 ซิงก์ข้อมูลใหม่';
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 3. Stats Dashboard update
// ──────────────────────────────────────────────────────────────
function updateStatsDashboard() {
  const dashboard = document.getElementById('stats-dashboard');
  if (dashboard) dashboard.classList.remove('is-loading');

  const clinicNum = document.getElementById('stat-clinic');
  const productNum = document.getElementById('stat-product');
  const sapNum = document.getElementById('stat-sap');
  const totalNum = document.getElementById('stat-total');
  
  if (!totalNum) return;
  
  let clinic = 0, product = 0, sap = 0;
  AppState.cases.forEach(c => {
    if (c.category === 'Clinic') clinic++;
    else if (c.category === 'Product') product++;
    else if (c.category === 'SAP') sap++;
  });
  
  if (clinicNum) clinicNum.textContent = clinic;
  if (productNum) productNum.textContent = product;
  if (sapNum) sapNum.textContent = sap;
  totalNum.textContent = AppState.cases.length;
}

// ──────────────────────────────────────────────────────────────
// 4. Filtering Logic & Session Persistence
// ──────────────────────────────────────────────────────────────
function saveFilterState() {
  try {
    sessionStorage.setItem('ple_case_library_filters', JSON.stringify(AppState.activeFilters));
  } catch (e) {}
}

function restoreFilterState() {
  try {
    const saved = sessionStorage.getItem('ple_case_library_filters');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        AppState.activeFilters.category = parsed.category || 'All';
        AppState.activeFilters.mainGroup = parsed.mainGroup || 'All';
        AppState.activeFilters.disease = parsed.disease || 'All';
        AppState.activeFilters.source = parsed.source || 'All';
        AppState.activeFilters.search = parsed.search || '';
        return true;
      }
    }
  } catch (e) {
    console.warn('Could not restore filter state:', e);
  }
  return false;
}

function resetAllFilters() {
  AppState.activeFilters = {
    category: 'All',
    mainGroup: 'All',
    disease: 'All',
    source: 'All',
    search: ''
  };
  try {
    sessionStorage.removeItem('ple_case_library_filters');
    sessionStorage.removeItem('ple_case_library_scroll');
  } catch (e) {}

  const searchInput = document.getElementById('search-case');
  if (searchInput) searchInput.value = '';

  const selectCat = document.getElementById('filter-category');
  if (selectCat) selectCat.value = 'All';

  renderFilterSelectOptions();
  applyFilters();
  renderCaseList();
}
window.resetAllFilters = resetAllFilters;

function applyFilters() {
  let list = Array.isArray(AppState.cases) ? [...AppState.cases] : [];
  const { category, mainGroup, disease, source, search } = AppState.activeFilters;
  
  if (category && category !== 'All') {
    list = list.filter(c => c && c.category === category);
  }
  
  if (mainGroup && mainGroup !== 'All') {
    list = list.filter(c => c && c.mainGroup === mainGroup);
  }

  if (disease && disease !== 'All') {
    list = list.filter(c => c && (c.disease === disease || c.subTopic === disease));
  }

  if (source && source !== 'All') {
    const normSource = source.replace(/^ข้อสอบจริง\s*ปี\s*/, 'ข้อสอบจริง ปี ').replace(/^ข้อสอบจริงปี\s*/, 'ข้อสอบจริง ปี ');
    list = list.filter(c => {
      if (!c || !c.source) return false;
      const cNorm = c.source.replace(/^ข้อสอบจริง\s*ปี\s*/, 'ข้อสอบจริง ปี ').replace(/^ข้อสอบจริงปี\s*/, 'ข้อสอบจริง ปี ');
      return cNorm === normSource;
    });
  }
  
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => 
      c && (
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.caseId && c.caseId.toLowerCase().includes(q)) ||
        (c.disease && c.disease.toLowerCase().includes(q)) ||
        (c.subTopic && c.subTopic.toLowerCase().includes(q)) ||
        (c.tags && c.tags.toLowerCase().includes(q))
      )
    );
  }
  
  AppState.filteredCases = list;
}

function renderFilterSelectOptions() {
  const selectCat = document.getElementById('filter-category');
  const selectGroup = document.getElementById('filter-course-group');
  const selectDisease = document.getElementById('filter-disease');
  if (!selectGroup) return;

  const currentCategory = AppState.activeFilters.category || 'All';
  const currentMainGroup = AppState.activeFilters.mainGroup || 'All';

  if (selectCat && currentCategory) {
    selectCat.value = currentCategory;
  }

  // 1. Filter Cases for Main Group options based on Category
  let availableCasesForGroup = AppState.cases;
  if (currentCategory && currentCategory !== 'All') {
    availableCasesForGroup = availableCasesForGroup.filter(c => c && c.category === currentCategory);
  }

  // Extract unique Main Groups
  const groups = new Set();
  availableCasesForGroup.forEach(c => {
    if (c && c.mainGroup) groups.add(c.mainGroup);
  });

  // Preserve current group selection if valid, else reset to All
  const preservedGroup = groups.has(currentMainGroup) ? currentMainGroup : 'All';
  AppState.activeFilters.mainGroup = preservedGroup;

  selectGroup.innerHTML = '<option value="All">ทุก OSPE Main Group</option>';
  groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    if (g === preservedGroup) opt.selected = true;
    selectGroup.appendChild(opt);
  });

  // 2. Filter Cases for Disease/Topic options based on Category & Main Group
  if (selectDisease) {
    let availableCasesForDisease = availableCasesForGroup;
    if (preservedGroup && preservedGroup !== 'All') {
      availableCasesForDisease = availableCasesForDisease.filter(c => c && c.mainGroup === preservedGroup);
    }

    const diseases = new Set();
    availableCasesForDisease.forEach(c => {
      if (c && c.disease) diseases.add(c.disease);
      else if (c && c.subTopic) diseases.add(c.subTopic);
    });

    const currentDisease = AppState.activeFilters.disease;
    const preservedDisease = diseases.has(currentDisease) ? currentDisease : 'All';
    AppState.activeFilters.disease = preservedDisease;

    selectDisease.innerHTML = '<option value="All">ทุกโรค / หัวข้อสอบ</option>';
    diseases.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === preservedDisease) opt.selected = true;
      selectDisease.appendChild(opt);
    });
  }

  // 3. Populate Source Options
  const selectSource = document.getElementById('filter-source');
  if (selectSource) {
    const sources = new Set();
    AppState.cases.forEach(c => {
      if (c && c.source) {
        c.source = c.source.replace(/^ข้อสอบจริง\s*ปี\s*/, 'ข้อสอบจริง ปี ').replace(/^ข้อสอบจริงปี\s*/, 'ข้อสอบจริง ปี ');
        sources.add(c.source);
      }
    });

    const currentSource = AppState.activeFilters.source;
    const normalizedCurrent = currentSource ? currentSource.replace(/^ข้อสอบจริง\s*ปี\s*/, 'ข้อสอบจริง ปี ').replace(/^ข้อสอบจริงปี\s*/, 'ข้อสอบจริง ปี ') : 'All';
    const preservedSource = sources.has(normalizedCurrent) ? normalizedCurrent : 'All';
    AppState.activeFilters.source = preservedSource;

    selectSource.innerHTML = '<option value="All">ทุกแหล่งที่มา (All Sources)</option>';
    Array.from(sources).sort((a, b) => a.localeCompare(b, 'th')).forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s === preservedSource) opt.selected = true;
      selectSource.appendChild(opt);
    });
  }
}

// ──────────────────────────────────────────────────────────────
// 5. Library Rendering
// ──────────────────────────────────────────────────────────────
function renderCaseList() {
  const container = document.getElementById('case-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (AppState.filteredCases.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>ไม่พบเคสสอบที่ตรงตามตัวเลือกของคุณ</h3>
        <p>ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
      </div>
    `;
    return;
  }
  
  AppState.filteredCases.forEach(c => {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.addEventListener('click', () => {
      try {
        sessionStorage.setItem('ple_case_library_scroll', window.scrollY.toString());
      } catch (e) {}
      window.location.href = `case-viewer.html?id=${encodeURIComponent(c.caseId)}`;
    });
    
    const isProtected = Boolean(c.isProtected || c.hasPassword);
    const sourceBadge = c.source ? `<span class="case-card-tag" style="background: rgba(99, 102, 241, 0.12); color: var(--primary); font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.25);">🏷️ ${c.source}</span>` : '';
    const lockBadge = isProtected ? `<span class="case-card-tag" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.25);">🔒 ข้อสอบลับ</span>` : '';
    const displayTitle = isProtected ? `🔒 ${c.caseId}` : c.title;

    card.innerHTML = `
      <div class="case-card-header">
        <span class="badge badge-${c.category.toLowerCase()}">${c.category}</span>
        <span class="case-card-id">${c.caseId}</span>
      </div>
      <h3 class="case-card-title">${escapeHtml(displayTitle)}</h3>
      <div style="margin-bottom: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
        ${lockBadge}
        <span class="case-card-tag">${escapeHtml(isProtected ? "🔒 ล็อกด้วยรหัสผ่าน" : (c.mainGroup || "") + (c.subTopic ? " · " + c.subTopic : ""))}</span>
        ${sourceBadge}
      </div>
      <div class="case-card-meta">
        <span>ผู้เขียน: ${escapeHtml(isProtected ? "🔒 สงวนสิทธิ์" : (c.author || 'ไม่ระบุ'))}</span>
      </div>
    `;
    
    container.appendChild(card);
  });

  // Restore scroll position if returning from case viewer
  try {
    const savedScroll = sessionStorage.getItem('ple_case_library_scroll');
    if (savedScroll) {
      const targetScroll = parseInt(savedScroll, 10);
      if (!isNaN(targetScroll) && targetScroll > 0) {
        setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
        }, 60);
      }
    }
  } catch (e) {}
}

// ──────────────────────────────────────────────────────────────
// 6. Interactive Checklist Management
// ──────────────────────────────────────────────────────────────
function loadChecklistProgress() {
  const saved = localStorage.getItem('ospe_checklist_progress');
  if (saved) {
    try {
      AppState.checklistProgress = JSON.parse(saved);
    } catch (e) {
      AppState.checklistProgress = {};
    }
  }
}

function saveChecklistProgress() {
  localStorage.setItem('ospe_checklist_progress', JSON.stringify(AppState.checklistProgress));
}

function handleChecklistItemClick(caseId, itemId, itemScore) {
  if (!AppState.checklistProgress[caseId]) {
    AppState.checklistProgress[caseId] = [];
  }
  
  const currentChecked = AppState.checklistProgress[caseId];
  const index = currentChecked.indexOf(itemId);
  const isChecking = (index === -1);
  
  const clickedEl = document.querySelector(`.checklist-item[data-id="${itemId}"]`);
  const isSubset = clickedEl && clickedEl.classList.contains('is-subset');
  const allItems = Array.from(document.querySelectorAll('.checklist-item'));
  const clickedIdx = allItems.indexOf(clickedEl);

  if (isSubset) {
    // Find parent element (the closest preceding non-subset)
    let parentEl = null;
    let siblingSubsets = [];
    for (let i = clickedIdx - 1; i >= 0; i--) {
      if (!allItems[i].classList.contains('is-subset')) {
        parentEl = allItems[i];
        break;
      }
    }
    if (parentEl) {
      const parentIdx = allItems.indexOf(parentEl);
      for (let i = parentIdx + 1; i < allItems.length; i++) {
        if (allItems[i].classList.contains('is-subset')) {
          siblingSubsets.push(allItems[i]);
        } else {
          break;
        }
      }
    }

    const parentScore = parentEl ? (parseFloat(parentEl.getAttribute('data-score')) || 1.0) : 1.0;
    const groupType = getSubsetGroupType(parentEl, siblingSubsets);

    if (groupType === 'rubric') {
      // Rubric mode: single-select radio button
      if (isChecking) {
        siblingSubsets.forEach(sib => {
          const sId = sib.getAttribute('data-id');
          const sIdx = currentChecked.indexOf(sId);
          if (sIdx > -1) currentChecked.splice(sIdx, 1);
        });
        currentChecked.push(itemId);

        if (parentEl) {
          const pId = parentEl.getAttribute('data-id');
          const pIdx = currentChecked.indexOf(pId);
          if (itemScore >= parentScore) {
            if (pIdx === -1) currentChecked.push(pId);
          } else {
            if (pIdx > -1) currentChecked.splice(pIdx, 1);
          }
        }
      } else {
        currentChecked.splice(index, 1);
        if (parentEl) {
          const pId = parentEl.getAttribute('data-id');
          const pIdx = currentChecked.indexOf(pId);
          if (pIdx > -1) currentChecked.splice(pIdx, 1);
        }
      }
    } else {
      // Additive mode: multi-select checkboxes
      if (isChecking) {
        if (itemScore === 0) {
          // Zero point failure option: uncheck all positive sibling subsets and parent
          siblingSubsets.forEach(sib => {
            const sId = sib.getAttribute('data-id');
            const sIdx = currentChecked.indexOf(sId);
            if (sIdx > -1) currentChecked.splice(sIdx, 1);
          });
          currentChecked.push(itemId);
          if (parentEl) {
            const pId = parentEl.getAttribute('data-id');
            const pIdx = currentChecked.indexOf(pId);
            if (pIdx > -1) currentChecked.splice(pIdx, 1);
          }
        } else {
          // Positive item: uncheck any 0-point sibling
          siblingSubsets.forEach(sib => {
            const sibSc = parseFloat(sib.getAttribute('data-score')) || 0;
            if (sibSc === 0) {
              const sId = sib.getAttribute('data-id');
              const sIdx = currentChecked.indexOf(sId);
              if (sIdx > -1) currentChecked.splice(sIdx, 1);
            }
          });
          currentChecked.push(itemId);

          // Calculate earned sum of subsets
          const earned = siblingSubsets
            .filter(sib => currentChecked.includes(sib.getAttribute('data-id')))
            .reduce((sum, sib) => sum + (parseFloat(sib.getAttribute('data-score')) || 0), 0);

          if (parentEl) {
            const pId = parentEl.getAttribute('data-id');
            const pIdx = currentChecked.indexOf(pId);
            if (earned >= parentScore) {
              if (pIdx === -1) currentChecked.push(pId);
            } else {
              if (pIdx > -1) currentChecked.splice(pIdx, 1);
            }
          }
        }
      } else {
        // Unchecking
        currentChecked.splice(index, 1);
        const earned = siblingSubsets
          .filter(sib => currentChecked.includes(sib.getAttribute('data-id')))
          .reduce((sum, sib) => sum + (parseFloat(sib.getAttribute('data-score')) || 0), 0);

        if (parentEl) {
          const pId = parentEl.getAttribute('data-id');
          const pIdx = currentChecked.indexOf(pId);
          if (earned >= parentScore) {
            if (pIdx === -1) currentChecked.push(pId);
          } else {
            if (pIdx > -1) currentChecked.splice(pIdx, 1);
          }
        }
      }
    }
  } else {
    // Clicking a Parent item:
    if (isChecking) {
      currentChecked.push(itemId);
      let nextEl = clickedEl.nextElementSibling;
      let subsets = [];
      while (nextEl && nextEl.classList.contains('is-subset')) {
        subsets.push(nextEl);
        nextEl = nextEl.nextElementSibling;
      }
      const parentScore = parseFloat(clickedEl.getAttribute('data-score')) || 1.0;
      const groupType = getSubsetGroupType(clickedEl, subsets);

      if (groupType === 'rubric') {
        // Select highest scoring subset option
        let bestSubset = subsets[0];
        let bestScore = -1;
        subsets.forEach(s => {
          const sc = parseFloat(s.getAttribute('data-score')) || 0;
          if (sc > bestScore) {
            bestScore = sc;
            bestSubset = s;
          }
          const sId = s.getAttribute('data-id');
          const sIdx = currentChecked.indexOf(sId);
          if (sIdx > -1) currentChecked.splice(sIdx, 1);
        });
        if (bestSubset) currentChecked.push(bestSubset.getAttribute('data-id'));
      } else {
        // Additive: select positive sub-items up to parent score (or all positive sub-items)
        subsets.forEach(s => {
          const sc = parseFloat(s.getAttribute('data-score')) || 0;
          const sId = s.getAttribute('data-id');
          if (sc > 0) {
            if (!currentChecked.includes(sId)) currentChecked.push(sId);
          } else {
            const sIdx = currentChecked.indexOf(sId);
            if (sIdx > -1) currentChecked.splice(sIdx, 1);
          }
        });
      }
    } else {
      currentChecked.splice(index, 1);
      let nextEl = clickedEl.nextElementSibling;
      while (nextEl && nextEl.classList.contains('is-subset')) {
        const subId = nextEl.getAttribute('data-id');
        const subIdx = currentChecked.indexOf(subId);
        if (subIdx > -1) currentChecked.splice(subIdx, 1);
        nextEl = nextEl.nextElementSibling;
      }
    }
  }
  
  saveChecklistProgress();
  updateChecklistUI(caseId);
}

function updateChecklistUI(caseId) {
  const checkedItems = AppState.checklistProgress[caseId] || [];
  const items = document.querySelectorAll('.checklist-item');
  
  // 1. Group checklist items by parent-subset hierarchy
  const groups = [];
  let currentGroup = null;
  
  items.forEach(el => {
    const itemId = el.getAttribute('data-id');
    const rawScore = parseFloat(el.getAttribute('data-score'));
    const score = isNaN(rawScore) ? 1.0 : rawScore;
    const isSubset = el.classList.contains('is-subset');
    
    if (!isSubset) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        parentId: itemId,
        parentScore: score,
        subsets: []
      };
    } else {
      if (currentGroup) {
        currentGroup.subsets.push({
          id: itemId,
          score: score
        });
      } else {
        groups.push({
          parentId: itemId,
          parentScore: score,
          subsets: []
        });
      }
    }
  });
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  // 2. Perform master sync checking logic
  const finalChecked = new Set(checkedItems);
  
  // 3. Update DOM classes for checkboxes
  items.forEach(el => {
    const itemId = el.getAttribute('data-id');
    if (finalChecked.has(itemId)) {
      el.classList.add('checked');
    } else {
      el.classList.remove('checked');
    }
  });
  
  // 4. Calculate total score and current score with rubric / additive logic
  let currentScore = 0;
  let totalScore = 0;
  
  groups.forEach(g => {
    totalScore += g.parentScore;
    
    if (g.subsets.length === 0) {
      if (finalChecked.has(g.parentId)) {
        currentScore += g.parentScore;
      }
    } else {
      const parentEl = document.querySelector(`.checklist-item[data-id="${g.parentId}"]`);
      const subEls = g.subsets.map(s => document.querySelector(`.checklist-item[data-id="${s.id}"]`)).filter(Boolean);
      const isRubric = getSubsetGroupType(parentEl || { score: g.parentScore }, subEls.length > 0 ? subEls : g.subsets) === 'rubric';

      if (isRubric) {
        const checkedSubsets = g.subsets.filter(s => finalChecked.has(s.id));
        if (checkedSubsets.length > 0) {
          const maxEarned = Math.max(...checkedSubsets.map(s => s.score));
          currentScore += Math.min(maxEarned, g.parentScore);
        } else if (finalChecked.has(g.parentId)) {
          currentScore += g.parentScore;
        }
      } else {
        if (finalChecked.has(g.parentId)) {
          currentScore += g.parentScore;
        } else {
          const checkedSubsets = g.subsets.filter(s => finalChecked.has(s.id));
          const subsetsScore = checkedSubsets.reduce((sum, s) => sum + s.score, 0);
          currentScore += Math.min(subsetsScore, g.parentScore);
        }
      }
    }
  });
  
  // 5. Update score displays in UI
  const scoreDisplay = document.getElementById('score-display');
  const pctDisplay = document.getElementById('percentage-display');
  const fillBar = document.getElementById('progress-bar-fill');
  
  // Format score without floating point precision drift
  const formatScore = safeFormatScore;
  
  if (scoreDisplay) scoreDisplay.textContent = `${formatScore(currentScore)} / ${formatScore(totalScore)}`;
  
  if (totalScore > 0) {
    const pct = Math.round((currentScore / totalScore) * 100);
    if (pctDisplay) pctDisplay.textContent = `${pct}%`;
    if (fillBar) {
      fillBar.style.width = `${pct}%`;
      if (pct >= 80) {
        fillBar.classList.add('pass');
      } else {
        fillBar.classList.remove('pass');
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 7. Route / Page Handling
// ──────────────────────────────────────────────────────────────
function detectCurrentPage() {
  const pathname = window.location.pathname;
  
  // หน้ารายการคลังเคส
  if (document.getElementById('case-list-container')) {
    // กู้คืนตัวกรองที่เคยเลือกไว้จาก SessionStorage
    restoreFilterState();

    // ดักจับตัวเลือกการกรอง
    const searchInput = document.getElementById('search-case');
    const selectCat = document.getElementById('filter-category');
    const selectGroup = document.getElementById('filter-course-group');
    const selectDisease = document.getElementById('filter-disease');
    const selectSource = document.getElementById('filter-source');

    if (searchInput) {
      if (AppState.activeFilters.search) {
        searchInput.value = AppState.activeFilters.search;
      }
      searchInput.addEventListener('input', (e) => {
        AppState.activeFilters.search = e.target.value;
        saveFilterState();
        applyFilters();
        renderCaseList();
      });
    }

    if (selectCat) {
      if (AppState.activeFilters.category) {
        selectCat.value = AppState.activeFilters.category;
      }
      selectCat.addEventListener('change', (e) => {
        AppState.activeFilters.category = e.target.value;
        AppState.activeFilters.mainGroup = 'All';
        AppState.activeFilters.disease = 'All';
        saveFilterState();
        renderFilterSelectOptions();
        applyFilters();
        renderCaseList();
      });
    }

    if (selectGroup) {
      selectGroup.addEventListener('change', (e) => {
        AppState.activeFilters.mainGroup = e.target.value;
        AppState.activeFilters.disease = 'All';
        saveFilterState();
        renderFilterSelectOptions();
        applyFilters();
        renderCaseList();
      });
    }

    if (selectDisease) {
      selectDisease.addEventListener('change', (e) => {
        AppState.activeFilters.disease = e.target.value;
        saveFilterState();
        applyFilters();
        renderCaseList();
      });
    }

    if (selectSource) {
      selectSource.addEventListener('change', (e) => {
        AppState.activeFilters.source = e.target.value;
        saveFilterState();
        applyFilters();
        renderCaseList();
      });
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 8. Utility Helpers
// ──────────────────────────────────────────────────────────────
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ──────────────────────────────────────────────────────────────
// Interactive Lightbox System (Zoomable & Pannable / Draggable)
// ──────────────────────────────────────────────────────────────
let lightboxScale = 1;
let lightboxTranslateX = 0;
let lightboxTranslateY = 0;
let isLightboxDragging = false;
let lightboxStartX = 0;
let lightboxStartY = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'image-lightbox';
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-toolbar">
      <div class="lightbox-hint">💡 หมุนเมาส์เพื่อย่อ-ขยาย | คลิกแล้วลากเพื่อย้ายรูปภาพ</div>
      <div class="lightbox-actions">
        <button type="button" class="lightbox-btn" onclick="zoomLightbox(0.25)" title="ขยายรูป (Zoom In)">🔍+</button>
        <button type="button" class="lightbox-btn" onclick="zoomLightbox(-0.25)" title="ย่อรูป (Zoom Out)">🔍-</button>
        <button type="button" class="lightbox-btn" onclick="resetLightboxTransform()" title="ขนาดปกติ (Reset)">↺</button>
        <button type="button" class="lightbox-btn lightbox-btn-close" onclick="closeLightbox()" title="ปิด (Close)">✕</button>
      </div>
    </div>
    <div class="lightbox-img-wrapper" id="lightbox-wrapper">
      <img class="lightbox-content" id="lightbox-img" src="" alt="Enlarged Image" draggable="false">
    </div>
  `;
  document.body.appendChild(overlay);

  const wrapper = document.getElementById('lightbox-wrapper');
  const img = document.getElementById('lightbox-img');

  // Close when clicking background outside toolbar and image
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target === wrapper) {
      closeLightbox();
    }
  });

  // Mouse wheel zoom
  overlay.addEventListener('wheel', function(e) {
    if (!overlay.classList.contains('active')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    zoomLightbox(delta);
  }, { passive: false });

  // Mouse Dragging
  wrapper.addEventListener('mousedown', function(e) {
    if (e.target !== img) return;
    e.preventDefault();
    isLightboxDragging = true;
    lightboxStartX = e.clientX - lightboxTranslateX;
    lightboxStartY = e.clientY - lightboxTranslateY;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (!isLightboxDragging) return;
    lightboxTranslateX = e.clientX - lightboxStartX;
    lightboxTranslateY = e.clientY - lightboxStartY;
    updateLightboxTransform();
  });

  window.addEventListener('mouseup', function() {
    if (isLightboxDragging) {
      isLightboxDragging = false;
      if (wrapper) wrapper.style.cursor = 'grab';
    }
  });

  // Mobile Touch Drag
  wrapper.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1 && e.target === img) {
      isLightboxDragging = true;
      lightboxStartX = e.touches[0].clientX - lightboxTranslateX;
      lightboxStartY = e.touches[0].clientY - lightboxTranslateY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    if (!isLightboxDragging || e.touches.length !== 1) return;
    lightboxTranslateX = e.touches[0].clientX - lightboxStartX;
    lightboxTranslateY = e.touches[0].clientY - lightboxStartY;
    updateLightboxTransform();
  }, { passive: true });

  window.addEventListener('touchend', function() {
    isLightboxDragging = false;
  });

  // Attach delegated click listener for content images
  document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && !e.target.closest('#image-lightbox')) {
      const contentArea = e.target.closest('#case-scenario-content, #case-patient-content, #case-equipment-content, #exam-scenario-content, #exam-patient-content, #exam-equipment-content, .case-content-area');
      if (contentArea) {
        openLightbox(e.target.src);
      }
    }
  });

  // Report System Event Listeners: Close dropdown or modal when clicking outside
  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('report-case-dropdown');
    const searchInput = document.getElementById('report-case-search');
    if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.classList.remove('show');
    }
    
    const overlay = document.getElementById('report-modal-overlay');
    if (overlay && overlay.classList.contains('show') && e.target === overlay) {
      closeReportModal();
    }
  });
});

function openLightbox(src) {
  const overlay = document.getElementById('image-lightbox');
  if (!overlay) return;
  const img = document.getElementById('lightbox-img');
  img.src = src;
  resetLightboxTransform();
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('image-lightbox');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      document.getElementById('lightbox-img').src = '';
      resetLightboxTransform();
    }
  }, 300);
}

function zoomLightbox(delta) {
  lightboxScale = Math.min(Math.max(0.4, lightboxScale + delta), 5);
  updateLightboxTransform();
}

function resetLightboxTransform() {
  lightboxScale = 1;
  lightboxTranslateX = 0;
  lightboxTranslateY = 0;
  updateLightboxTransform();
}

function updateLightboxTransform() {
  const img = document.getElementById('lightbox-img');
  if (img) {
    img.style.transform = `translate(${lightboxTranslateX}px, ${lightboxTranslateY}px) scale(${lightboxScale})`;
  }
}

// ──────────────────────────────────────────────────────────────
// 9. Service Worker Registration (Game-like Cache & Offline Mode)
// ──────────────────────────────────────────────────────────────
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('[Service Worker] Registration successful with scope:', reg.scope);
      })
      .catch(err => {
        console.warn('[Service Worker] Registration failed:', err);
      });
  });
}

// ──────────────────────────────────────────────────────────────
// 10. Database Preloader (IndexedDB Cache & Progress Bar)
// ──────────────────────────────────────────────────────────────
const DB_NAME = 'RxCU_OSPE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'case_details';
const DB_VERSION_STR = 'v_20261004_164300'; // อัปเดตเวอร์ชันนี้เพื่อบังคับโหลดใหม่เมื่อมีเคสเพิ่มเติมในสคริปต์ออฟไลน์

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function getCasesFromDB(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('all_cases');
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveCasesToDB(db, casesObj) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(casesObj, 'all_cases');
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e.target.error);
  });
}

function injectSplashOverlay() {
  if (document.getElementById('db-loading-splash')) return;
  const overlay = document.createElement('div');
  overlay.id = 'db-loading-splash';
  overlay.className = 'db-splash-overlay';
  overlay.innerHTML = `
    <div class="db-splash-card">
      <div class="db-splash-logo">🥼</div>
      <h2 class="db-splash-title">RxCU OSPE Hub</h2>
      <p class="db-splash-status" id="db-splash-status">กำลังจัดเตรียมคลังข้อสอบและรูปภาพ...</p>
      <div class="db-splash-progress-container">
        <div class="db-splash-progress-bar" id="db-splash-progress"></div>
      </div>
      <div class="db-splash-percentage" id="db-splash-pct">0%</div>
      <p class="db-splash-hint">ดาวน์โหลดฐานข้อมูลในเครื่อง (1.8 MB)<br>โหลดช้าเฉพาะครั้งแรกเท่านั้น ครั้งถัดไปจะเปิดได้ทันทีผ่านระบบ Cache ⚡</p>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Trigger layout to enable transition
  overlay.offsetHeight; 
  overlay.classList.add('active');
}

function updateSplashProgress(pct, received, total) {
  const pctEl = document.getElementById('db-splash-pct');
  const barEl = document.getElementById('db-splash-progress');
  const statusEl = document.getElementById('db-splash-status');
  
  if (barEl) barEl.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  
  if (statusEl) {
    const receivedMB = (received / (1024 * 1024)).toFixed(2);
    const totalMB = total ? (total / (1024 * 1024)).toFixed(2) : '1.77';
    statusEl.textContent = `กำลังโหลดฐานข้อมูล: ${receivedMB} MB / ${totalMB} MB`;
  }
}

function hideSplashOverlay() {
  const overlay = document.getElementById('db-loading-splash');
  if (!overlay) return;
  overlay.classList.remove('active');
  // Wait for transition before removing
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 400);
}

async function loadOfflineDetailsWithProgress() {
  // 0. หากมี OFFLINE_CASE_DETAILS ใน Memory จากไฟล์ script อยู่แล้ว -> ใช้ทันที 0ms ไม่ต้องดาวน์โหลดซ้ำ!
  if (typeof OFFLINE_CASE_DETAILS !== 'undefined' && Object.keys(OFFLINE_CASE_DETAILS).length > 0) {
    console.log(`[Database Preloader] OFFLINE_CASE_DETAILS is ready in memory (${Object.keys(OFFLINE_CASE_DETAILS).length} cases). 0ms instant load!`);
    mergeOfflineDetails();
    removeSplashOverlay();
    try {
      const targetVersion = (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.version) ? OFFLINE_DATA.version : DB_VERSION_STR;
      localStorage.setItem('ospe_db_version', targetVersion);
      openIndexedDB().then(db => saveCasesToDB(db, OFFLINE_CASE_DETAILS)).catch(() => {});
    } catch(e) {}
    return;
  }

  const url = 'case-details-offline.js';
  
  try {
    const db = await openIndexedDB();
    const cachedVersion = localStorage.getItem('ospe_db_version');
    const targetVersion = (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.version) ? OFFLINE_DATA.version : DB_VERSION_STR;
    
    // A. หากเคยโหลดและบันทึกลง IndexedDB เวอร์ชันตรงกัน -> ดึงมาใช้ทันที 0ms
    if (cachedVersion === targetVersion) {
      console.log(`[Database Preloader] Database matches targetVersion (${targetVersion}) in IndexedDB.`);
      const allDetails = await getCasesFromDB(db);
      if (allDetails && Object.keys(allDetails).length > 0) {
        window.OFFLINE_CASE_DETAILS = allDetails;
        console.log('[Database Preloader] All cases retrieved instantly from IndexedDB cache (0ms).');
        mergeOfflineDetails();
        return;
      }
    }
    
    // B. หากเป็นเวอร์ชันใหม่ (เพิ่ง compile มาเพิ่มเคส):
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('ple_unlocked_')) sessionStorage.removeItem(k);
      });
    } catch (e) {}

    // 1) ดึงแคชเดิมที่มีอยู่แล้วขึ้นมาแสดงก่อนทันที 0ms เพื่อไม่ให้ผู้ใช้ต้องรอ!
    const existingDetails = await getCasesFromDB(db);
    if (existingDetails && Object.keys(existingDetails).length > 0) {
      window.OFFLINE_CASE_DETAILS = Object.assign({}, existingDetails, window.OFFLINE_CASE_DETAILS || {});
      mergeOfflineDetails();
      console.log('[Database Preloader] Previous cache loaded instantly (0ms); updating new cases in background...');
    }
    
    // 2) แสดง Splash Overlay เฉพาะเมื่อ "ไม่มีแคชเลยสักเคส" และ "อยู่หน้า case-viewer" เท่านั้น
    const isViewer = window.location.pathname.includes('case-viewer');
    const shouldShowSplash = (!existingDetails || Object.keys(existingDetails).length === 0) && isViewer;
    
    let showOverlayTimeout = null;
    if (shouldShowSplash) {
      showOverlayTimeout = setTimeout(() => {
        injectSplashOverlay();
      }, 150);
    }
    
    // 3) ดาวน์โหลดไฟล์รายละเอียดเวอร์ชันใหม่
    const response = await fetch(url + '?v=' + encodeURIComponent(targetVersion));
    if (!response.ok) throw new Error('Network response was not ok');
    
    const contentLength = +response.headers.get('Content-Length') || 28000000;
    const reader = response.body.getReader();
    
    let receivedLength = 0;
    const chunks = [];
    
    while(true) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      
      if (shouldShowSplash) {
        let pct = Math.round((receivedLength / contentLength) * 100);
        if (pct > 99) pct = 99;
        updateSplashProgress(pct, receivedLength, contentLength);
      }
    }
    
    // รวมเศษส่วนของไบต์
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for(let chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    // แปลงรหัสไบต์เป็นข้อความสคริปต์
    const decoder = new TextDecoder('utf-8');
    const scriptText = decoder.decode(allChunks);
    
    // แทรกสคริปต์เพื่อรันตัวแปร OFFLINE_CASE_DETAILS ลงหน้าต่างหลัก
    const script = document.createElement('script');
    script.textContent = scriptText;
    document.head.appendChild(script);
    
    if (shouldShowSplash) {
      updateSplashProgress(100, receivedLength, receivedLength);
    }
    console.log('[Database Preloader] New database downloaded and evaluated.');
    
    // บันทึกลง IndexedDB เพื่อใช้งานครั้งต่อไป
    if (typeof OFFLINE_CASE_DETAILS !== 'undefined') {
      await saveCasesToDB(db, OFFLINE_CASE_DETAILS);
      localStorage.setItem('ospe_db_version', targetVersion);
      console.log(`[Database Preloader] Database stored in IndexedDB (version: ${targetVersion}).`);
    }
    
    mergeOfflineDetails();
    if (showOverlayTimeout) clearTimeout(showOverlayTimeout);
    hideSplashOverlay();
    
    // ส่งอีเวนต์แจ้งเตือนหน้าอื่นว่าแคชเวอร์ชันใหม่พร้อมสมบูรณ์แล้ว
    window.dispatchEvent(new CustomEvent('offlineDetailsReady', { detail: { version: targetVersion } }));
  } catch (err) {
    console.warn('[Database Preloader] IndexedDB cache load failed. Falling back to static script:', err);
    // กรณีฉุกเฉิน: แทรกสคริปต์ตรงๆ
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        mergeOfflineDetails();
        resolve();
      };
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }
}

function mergeOfflineDetails() {
  if (typeof OFFLINE_CASE_DETAILS !== 'undefined' && AppState.cases && AppState.cases.length > 0) {
    AppState.cases.forEach((c, idx) => {
      const cleanId = (c.caseId || '').trim();
      const details = OFFLINE_CASE_DETAILS[cleanId] || 
                      OFFLINE_CASE_DETAILS[cleanId.toUpperCase()] || 
                      OFFLINE_CASE_DETAILS[cleanId.toLowerCase()];
      if (details) {
        AppState.cases[idx] = Object.assign({}, c, details);
      }
    });
    console.log('[Database Preloader] Merged offline details into AppState.');
  }
}

// ─── Batch Multi-Case Print System ──────────────────────────────────
let selectedBatchCaseIds = new Set();

function openBatchPrintModal() {
  let modal = document.getElementById('batch-print-modal');
  if (!modal) {
    createBatchPrintModalDOM();
    modal = document.getElementById('batch-print-modal');
  }
  if (modal) {
    modal.style.display = 'flex';
    populateBatchFilterDropdowns();
    renderBatchCaseSelectionList();
  }
}

function closeBatchPrintModal() {
  const modal = document.getElementById('batch-print-modal');
  if (modal) modal.style.display = 'none';
}

function createBatchPrintModalDOM() {
  const div = document.createElement('div');
  div.id = 'batch-print-modal';
  div.className = 'print-modal-overlay no-print';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="print-modal-card" style="max-width: 1060px;">
      <div class="print-modal-header">
        <h3 style="margin: 0; font-family: var(--font-title); font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;">
          🖨️ เครื่องมือสั่งพิมพ์หลายเคสพร้อมกัน (Batch Print Tools)
        </h3>
        <button class="btn btn-secondary" onclick="closeBatchPrintModal()" style="padding: 4px 10px; font-size: 0.85rem;">✕ ปิด</button>
      </div>

      <div class="print-modal-body">
        <div class="print-options-grid">
          <!-- 1. Selection & Filter (4 Dimensions) -->
          <div class="print-option-group" style="grid-column: span 2;">
            <div class="print-option-title" style="justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
              <span>📦 1. ตัวกรองละเอียด & เลือกเคสที่ต้องการพิมพ์ (4D Filters)</span>
              <span id="batch-selected-count-badge" style="font-size: 0.82rem; font-weight: 700; background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px;">เลือกแล้ว 0 เคส</span>
            </div>

            <!-- Filter Row 1: Dropdowns -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem; margin-bottom: 0.6rem;">
              <div>
                <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 2px;">📂 หมวดวิชาหลัก:</label>
                <select id="batch-cat-select" class="form-control" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.82rem;" onchange="onBatchCategoryChange()">
                  <option value="All">ทุกหมวด (All Category)</option>
                  <option value="Clinic">Clinic (คลินิก)</option>
                  <option value="Product">Product (ผลิต)</option>
                  <option value="SAP">SAP (สังคมฯ)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 2px;">📚 กลุ่มโรค / วิชา (Course Group):</label>
                <select id="batch-group-select" class="form-control" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.82rem;" onchange="renderBatchCaseSelectionList()">
                  <option value="All">ทุกกลุ่มโรค / วิชา (All Groups)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 2px;">🏷️ แหล่งที่มา / ปีข้อสอบ (Source):</label>
                <select id="batch-source-select" class="form-control" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.82rem;" onchange="renderBatchCaseSelectionList()">
                  <option value="All">ทุกแหล่งที่มา / ปี (All Sources)</option>
                </select>
              </div>
            </div>

            <!-- Filter Row 2: Search + Action Buttons -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; align-items: center;">
              <input type="text" id="batch-search-input" class="form-control" placeholder="🔍 ค้นหาชื่อเคส, ตัวยา, รหัสเคส (เช่น CL5324), ชื่อผู้แต่ง..." style="flex: 2; min-width: 220px; padding: 0.4rem 0.65rem; font-size: 0.84rem;" oninput="renderBatchCaseSelectionList()">
              <button class="btn btn-secondary" onclick="selectAllBatchCases(true)" style="padding: 4px 10px; font-size: 0.8rem; white-space: nowrap;">☑️ เลือกทั้งหมดที่กรอง</button>
              <button class="btn btn-secondary" onclick="selectAllBatchCases(false)" style="padding: 4px 10px; font-size: 0.8rem; white-space: nowrap;">☐ ล้างการเลือก</button>
            </div>

            <!-- Scrollable Case Checkbox Rail -->
            <div id="batch-case-checkbox-list" style="max-height: 220px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.5rem; background: var(--bg-primary); display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.4rem;">
              <!-- Filled dynamically by JS -->
            </div>
          </div>

          <!-- 2. Print Content Options -->
          <div class="print-option-group">
            <div class="print-option-title">📑 2. เลือกรูปแบบเนื้อหา</div>
            <div class="print-radio-list">
              <label class="print-radio-label">
                <input type="radio" name="batch-print-mode" value="full" checked>
                <span><strong>พิมพ์รวมทั้งหมด (Full Cases)</strong><br><small style="color:var(--text-secondary);">โจทย์ + ข้อมูลผู้ป่วย + Checklist + เฉลย (แยกคำถามและเฉลยคนละหน้าอัตโนมัติ)</small></span>
              </label>
              <label class="print-radio-label">
                <input type="radio" name="batch-print-mode" value="question">
                <span><strong>พิมพ์เฉพาะโจทย์ / คำถาม (Question Only)</strong><br><small style="color:var(--text-secondary);">โจทย์ + สิ่งที่มีให้ (สำหรับแปะหน้าห้องสอบ)</small></span>
              </label>
              <label class="print-radio-label">
                <input type="radio" name="batch-print-mode" value="checklist">
                <span><strong>พิมพ์เฉพาะ Checklist & เฉลย (Answer Only)</strong><br><small style="color:var(--text-secondary);">เกณฑ์ประเมิน + เฉลย (สำหรับกรรมการผู้ตรวจ)</small></span>
              </label>
            </div>

            <div style="margin-top: 0.75rem; border-top: 1px dashed var(--border); padding-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <label class="print-radio-label" style="background: var(--bg-secondary);">
                <input type="checkbox" id="batch-split-key" checked>
                <span>📄 <strong>แยกหน้าพิมพ์ระหว่าง Checklist และ เฉลย (Split Key to New Page)</strong><br><small style="color:var(--text-secondary);">ตัดขึ้นหน้าใหม่สำหรับเฉลย เพื่อให้ Checklist และเฉลยอยู่คนละหน้ากัน</small></span>
              </label>
              <label class="print-radio-label" style="background: var(--bg-secondary);">
                <input type="checkbox" id="batch-hide-title">
                <span>🙈 <strong>ซ่อนชื่อเคส / ชื่อโรคในหัวกระดาษ</strong><br><small style="color:var(--text-secondary);">เพื่อซ่อนชื่อโรค/เฉลย เมื่อนำโจทย์ไปติดหน้าห้องสอบ</small></span>
              </label>
            </div>
          </div>

          <!-- 3. Orientation & Scale -->
          <div class="print-option-group">
            <div class="print-option-title">📐 3. ทิศทาง & ขนาดตัวหนังสือ</div>
            <div style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">ทิศทางกระดาษ:</label>
              <div style="display: flex; gap: 0.5rem;">
                <label class="print-radio-label" style="flex:1; padding:0.4rem 0.6rem;">
                  <input type="radio" name="batch-print-orient" value="portrait" checked>
                  <span>📄 แนวตั้ง</span>
                </label>
                <label class="print-radio-label" style="flex:1; padding:0.4rem 0.6rem;">
                  <input type="radio" name="batch-print-orient" value="landscape">
                  <span>🖼️ แนวนอน</span>
                </label>
              </div>
            </div>

            <div>
              <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">ขนาดตัวหนังสือ (Scale Zoom):</label>
              <select id="batch-print-scale" class="form-control" style="width:100%; padding:0.45rem; font-size:0.88rem;">
                <option value="80">80% (กระทัดรัด - ประหยัดกระดาษ)</option>
                <option value="100" selected>100% (ขนาดมาตรฐาน)</option>
                <option value="120">120% (ตัวใหญ่ อ่านง่าย)</option>
                <option value="140">140% (ตัวใหญ่พิเศษ - สำหรับแปะหน้าห้องสอบ)</option>
                <option value="160">160% (ยักษ์ใหญ่)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 1rem 1.5rem; background: var(--bg-secondary); border-top: 1px solid var(--border); display: flex; gap: 1rem; justify-content: flex-end; align-items: center;">
        <button class="btn btn-secondary" onclick="closeBatchPrintModal()">ยกเลิก</button>
        <button class="btn btn-primary" onclick="executeBatchPrint()" style="padding: 0.6rem 1.5rem; font-size: 1rem; background: linear-gradient(135deg, var(--primary), #4338ca);">
          🖨️ เริ่มสั่งพิมพ์ทุกเคสที่เลือก (Batch Print)
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

function populateBatchFilterDropdowns() {
  const allCases = (AppState.cases && AppState.cases.length > 0) ? AppState.cases : 
                   ((typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases && OFFLINE_DATA.cases.length > 0) ? OFFLINE_DATA.cases : []);
  const cat = document.getElementById('batch-cat-select')?.value || 'All';
  const groupSelect = document.getElementById('batch-group-select');
  const sourceSelect = document.getElementById('batch-source-select');

  if (groupSelect) {
    const currentVal = groupSelect.value;
    const groups = new Set();
    allCases.forEach(c => {
      if (cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase()) {
        if (c.mainGroup && c.mainGroup.trim()) groups.add(c.mainGroup.trim());
      }
    });
    const sortedGroups = Array.from(groups).sort((a, b) => a.localeCompare(b, 'th'));
    let groupHtml = '<option value="All">ทุกกลุ่มโรค / วิชา (All Groups)</option>';
    sortedGroups.forEach(g => {
      groupHtml += `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`;
    });
    groupSelect.innerHTML = groupHtml;
    if (groups.has(currentVal)) groupSelect.value = currentVal;
    else groupSelect.value = 'All';
  }

  if (sourceSelect) {
    const currentVal = sourceSelect.value;
    const sources = new Set();
    allCases.forEach(c => {
      if (cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase()) {
        if (c.source && c.source.trim()) sources.add(c.source.trim());
      }
    });
    const sortedSources = Array.from(sources).sort((a, b) => a.localeCompare(b, 'th'));
    let srcHtml = '<option value="All">ทุกแหล่งที่มา / ปี (All Sources)</option>';
    sortedSources.forEach(s => {
      srcHtml += `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`;
    });
    sourceSelect.innerHTML = srcHtml;
    if (sources.has(currentVal)) sourceSelect.value = currentVal;
    else sourceSelect.value = 'All';
  }
}

function onBatchCategoryChange() {
  populateBatchFilterDropdowns();
  renderBatchCaseSelectionList();
}

function renderBatchCaseSelectionList() {
  const container = document.getElementById('batch-case-checkbox-list');
  if (!container) return;

  const search = (document.getElementById('batch-search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('batch-cat-select')?.value || 'All';
  const group = document.getElementById('batch-group-select')?.value || 'All';
  const source = document.getElementById('batch-source-select')?.value || 'All';

  let allCases = (AppState.cases && AppState.cases.length > 0) ? AppState.cases : 
                 ((typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases && OFFLINE_DATA.cases.length > 0) ? OFFLINE_DATA.cases : []);

  if (allCases.length === 0 && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
    allCases = Object.keys(OFFLINE_CASE_DETAILS).map(cid => {
      const details = OFFLINE_CASE_DETAILS[cid] || {};
      return Object.assign({ caseId: cid, title: details.title || cid, category: details.category || 'CLINIC' }, details);
    });
  }

  const filtered = allCases.filter(c => {
    const matchCat = cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase();
    const matchGroup = group === 'All' || (c.mainGroup || '').trim() === group;
    const matchSource = source === 'All' || (c.source || '').trim() === source;
    const matchSearch = !search || 
      (c.caseId || '').toLowerCase().includes(search) || 
      (c.title || '').toLowerCase().includes(search) || 
      (c.disease || '').toLowerCase().includes(search) ||
      (c.subTopic || '').toLowerCase().includes(search) ||
      (c.mainGroup || '').toLowerCase().includes(search) ||
      (c.author || '').toLowerCase().includes(search);
    return matchCat && matchGroup && matchSource && matchSearch;
  });

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">ไม่พบเคสที่ตรงกับเงื่อนไข</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(c => {
    const isChecked = selectedBatchCaseIds.has(c.caseId);
    const label = document.createElement('label');
    label.className = 'print-radio-label';
    label.style.padding = '0.4rem 0.6rem';
    label.style.fontSize = '0.82rem';
    label.style.whiteSpace = 'nowrap';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';
    
    label.innerHTML = `
      <input type="checkbox" value="${escapeHtml(c.caseId)}" ${isChecked ? 'checked' : ''} onchange="toggleBatchCaseSelection('${escapeHtml(c.caseId)}', this.checked)">
      <span title="${escapeHtml(c.title || c.caseId)}"><strong>${escapeHtml(c.caseId)}</strong> - ${escapeHtml(c.title || '')}</span>
    `;
    fragment.appendChild(label);
  });
  container.appendChild(fragment);

  updateBatchSelectedCountBadge();
}

function toggleBatchCaseSelection(caseId, isChecked) {
  if (isChecked) selectedBatchCaseIds.add(caseId);
  else selectedBatchCaseIds.delete(caseId);
  updateBatchSelectedCountBadge();
}

function selectAllBatchCases(select) {
  const search = (document.getElementById('batch-search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('batch-cat-select')?.value || 'All';
  const group = document.getElementById('batch-group-select')?.value || 'All';
  const source = document.getElementById('batch-source-select')?.value || 'All';
  let allCases = (AppState.cases && AppState.cases.length > 0) ? AppState.cases : 
                 ((typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases && OFFLINE_DATA.cases.length > 0) ? OFFLINE_DATA.cases : []);

  if (allCases.length === 0 && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
    allCases = Object.keys(OFFLINE_CASE_DETAILS).map(cid => {
      const details = OFFLINE_CASE_DETAILS[cid] || {};
      return Object.assign({ caseId: cid, title: details.title || cid, category: details.category || 'CLINIC' }, details);
    });
  }

  allCases.forEach(c => {
    const matchCat = cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase();
    const matchGroup = group === 'All' || (c.mainGroup || '').trim() === group;
    const matchSource = source === 'All' || (c.source || '').trim() === source;
    const matchSearch = !search || 
      (c.caseId || '').toLowerCase().includes(search) || 
      (c.title || '').toLowerCase().includes(search) || 
      (c.disease || '').toLowerCase().includes(search) ||
      (c.subTopic || '').toLowerCase().includes(search) ||
      (c.mainGroup || '').toLowerCase().includes(search) ||
      (c.author || '').toLowerCase().includes(search);

    if (matchCat && matchGroup && matchSource && matchSearch) {
      if (select) selectedBatchCaseIds.add(c.caseId);
      else selectedBatchCaseIds.delete(c.caseId);
    }
  });

  renderBatchCaseSelectionList();
}

function updateBatchSelectedCountBadge() {
  const badge = document.getElementById('batch-selected-count-badge');
  if (badge) {
    badge.textContent = `เลือกแล้ว ${selectedBatchCaseIds.size} เคส`;
  }
}

async function executeBatchPrint() {
  if (selectedBatchCaseIds.size === 0) {
    alert('กรุณาเลือกอย่างน้อย 1 เคสเพื่อทำการสั่งพิมพ์');
    return;
  }

  const count = selectedBatchCaseIds.size;
  const mode = document.querySelector('input[name="batch-print-mode"]:checked')?.value || 'full';
  const orient = document.querySelector('input[name="batch-print-orient"]:checked')?.value || 'portrait';
  const scale = document.getElementById('batch-print-scale')?.value || '100';
  const hideTitle = document.getElementById('batch-hide-title')?.checked || false;

  // Apply dynamic page print style for landscape/portrait
  if (typeof applyDynamicPrintStyle === 'function') {
    applyDynamicPrintStyle(orient);
  } else {
    let styleEl = document.getElementById('dynamic-page-print-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-page-print-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = (orient === 'landscape') ? 
      '@media print { @page { size: A4 landscape !important; margin: 8mm !important; } }' :
      '@media print { @page { size: A4 portrait !important; margin: 8mm !important; } }';
  }

  showGlobalLoader(true, `กำลังจัดเตรียมชุดเอกสารสั่งพิมพ์ (${count} เคส)...`);

  const offlineMap = (typeof OFFLINE_CASE_DETAILS !== 'undefined') ? OFFLINE_CASE_DETAILS : {};
  const allMeta = (AppState.cases && AppState.cases.length > 0) ? AppState.cases : 
                  ((typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) ? OFFLINE_DATA.cases : []);

  let lastUsedPasscode = sessionStorage.getItem('ple_saved_passcode') || '';
  const caseList = [];
  for (const cid of Array.from(selectedBatchCaseIds)) {
    const base = allMeta.find(x => x.caseId === cid) || { caseId: cid };
    let details = offlineMap[cid] || offlineMap[cid.toUpperCase()] || offlineMap[cid.toLowerCase()] || {};

    // Check if case is protected / encrypted
    if (details && (details.isEncrypted || details.isProtected || details.hasPassword)) {
      const ospeId = cid.startsWith('OSPE-') ? cid : ('OSPE-' + cid);
      const cachedRaw = sessionStorage.getItem('ple_unlocked_' + cid) || 
                        sessionStorage.getItem('ple_unlocked_' + ospeId) ||
                        sessionStorage.getItem('viewer_unlocked_' + cid) ||
                        sessionStorage.getItem('viewer_unlocked_' + ospeId);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          const dec = (parsed && parsed._case_data) ? parsed._case_data : parsed;
          if (dec && (dec.scenario || dec.checklist)) {
            details = Object.assign({}, details, dec);
          }
        } catch(e) {}
      }

      // 1. Try saved / previously entered passcode first (No prompt needed!)
      if (details.isEncrypted && (!details.scenario && !details.checklist) && lastUsedPasscode && typeof window.decryptCaseData === 'function') {
        try {
          const dec = await window.decryptCaseData(details, lastUsedPasscode.trim());
          if (dec && (dec.scenario || dec.checklist)) {
            const curVer = (typeof DB_VERSION_STR !== 'undefined' ? DB_VERSION_STR : '');
            const wrapped = Object.assign({}, dec, { _db_version: curVer });
            sessionStorage.setItem('ple_unlocked_' + cid, JSON.stringify(wrapped));
            sessionStorage.setItem('viewer_unlocked_' + cid, JSON.stringify(wrapped));
            if (!cid.startsWith('OSPE-')) {
              sessionStorage.setItem('ple_unlocked_OSPE-' + cid, JSON.stringify(wrapped));
            }
            details = Object.assign({}, details, dec);
          }
        } catch(e) {}
      }

      // 2. If still encrypted, prompt for passcode ONCE
      if (details.isEncrypted && (!details.scenario && !details.checklist)) {
        showGlobalLoader(false);
        const pwd = prompt(`🔒 มีข้อสอบลับที่มีรหัสผ่าน (เช่น เคส ${cid})\nกรุณากรอกรหัสผ่านเพื่อปลดล็อกเนื้อหาสำหรับพิมพ์ (ระบบจะใช้รหัสนี้ปลดล็อกเคสอื่นในชุดเดียวกันอัตโนมัติ):`);
        if (pwd && typeof window.decryptCaseData === 'function') {
          lastUsedPasscode = pwd.trim();
          sessionStorage.setItem('ple_saved_passcode', lastUsedPasscode);
          showGlobalLoader(true, `กำลังถอดรหัสเคส ${cid}...`);
          try {
            const dec = await window.decryptCaseData(details, lastUsedPasscode);
            if (dec && (dec.scenario || dec.checklist)) {
              const curVer = (typeof DB_VERSION_STR !== 'undefined' ? DB_VERSION_STR : '');
              const wrapped = Object.assign({}, dec, { _db_version: curVer });
              sessionStorage.setItem('ple_unlocked_' + cid, JSON.stringify(wrapped));
              sessionStorage.setItem('viewer_unlocked_' + cid, JSON.stringify(wrapped));
              if (!cid.startsWith('OSPE-')) {
                sessionStorage.setItem('ple_unlocked_OSPE-' + cid, JSON.stringify(wrapped));
              }
              details = Object.assign({}, details, dec);
            } else {
              alert(`❌ รหัสผ่านของเคส ${cid} ไม่ถูกต้อง เคสนี้จะไม่ถูกพิมพ์เนื้อหา`);
            }
          } catch(err) {
            alert(`❌ ไม่สามารถถอดรหัสเคส ${cid} ได้: รหัสผ่านไม่ถูกต้อง`);
          }
        }
      }
    }
    caseList.push(Object.assign({}, base, details));
  }

  showGlobalLoader(true, `กำลังสร้างหน้าเอกสารพร้อมพิมพ์ (${count} เคส)...`);

  setTimeout(() => {
    let printArea = document.getElementById('batch-print-execution-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'batch-print-execution-area';
      printArea.className = 'print-only-block';
      document.body.appendChild(printArea);
    }
    printArea.innerHTML = '';

    const fragment = document.createDocumentFragment();

    caseList.forEach((c) => {
      const caseWrapper = document.createElement('div');
      caseWrapper.className = 'batch-print-case';
      
      const rawTitle = c.title || ('เคส ' + c.caseId);
      const displayTitle = hideTitle ? 'สถานีสอบ OSPE (OSPE Station)' : `${rawTitle} (${c.caseId})`;
      const cat = c.category || 'CLINIC';

      let html = `<div style="border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 style="margin:0; font-size:1.3rem; font-weight:800; font-family:var(--font-title);">${escapeHtml(displayTitle)}</h2>
          <span style="font-weight:700; border:1px solid #000; padding:2px 8px; border-radius:4px; font-size:0.85rem;">หมวด: ${escapeHtml(cat)}</span>
        </div>
      </div>`;

      if (mode === 'full' || mode === 'question') {
        const scenarioHtml = getFormattedCaseScenarioHtml(c);
        html += `<div style="margin-bottom:1.25rem;">
          <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #3b82f6; padding-left:0.5rem;">📌 สถานการณ์</h3>
          <div style="font-size:0.95rem; line-height:1.5;">${scenarioHtml}</div>
        </div>`;

        const patientHtml = getFormattedCasePatientHtml(c);
        if (patientHtml) {
          html += `<div style="margin-bottom:1.25rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #06b6d4; padding-left:0.5rem;">👤 ข้อมูลผู้ป่วย</h3>
            <div style="font-size:0.95rem; line-height:1.5;">${patientHtml}</div>
          </div>`;
        }

        const equipHtml = getFormattedCaseEquipmentHtml(c);
        if (equipHtml) {
          html += `<div style="margin-bottom:1.25rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #8b5cf6; padding-left:0.5rem;">📦 สิ่งที่มีให้ในสถานี</h3>
            <div style="font-size:0.95rem; line-height:1.5;">${equipHtml}</div>
          </div>`;
        }
      }

      if (mode === 'full' || mode === 'checklist') {
        const pageBreakAttr = (mode === 'full') ? 'class="print-page-break-before" style="page-break-before: always; margin-top: 1.25rem;"' : 'style="margin-top: 1.25rem;"';
        
        html += `<div ${pageBreakAttr}>`;

        const chkTable = (typeof buildPrintChecklistTable === 'function') ? buildPrintChecklistTable(c) : '';
        if (chkTable) {
          html += `<div>
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #10b981; padding-left:0.5rem; page-break-after:avoid;">📋 รายการทักษะประเมิน</h3>
            ${chkTable}
          </div>`;
        }

        if (c.noteHtml && c.noteHtml.trim() !== '') {
          const splitKey = document.getElementById('batch-split-key')?.checked !== false;
          const formattedNote = typeof renderRichNoteContent === 'function' ? renderRichNoteContent(c.noteHtml) : c.noteHtml;
          const noteBreakClass = splitKey ? 'print-page-break-before' : '';
          const noteBreakStyle = splitKey ? 'page-break-before: always; margin-top: 1.25rem;' : 'margin-top: 1.25rem; border-top: 1px dashed #cbd5e1; padding-top: 0.75rem;';

          html += `<div class="${noteBreakClass}" style="${noteBreakStyle}">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #f59e0b; padding-left:0.5rem; page-break-after:avoid;">🔑 เฉลย / ข้อมูลผู้ตรวจ</h3>
            <div style="font-size:0.9rem; line-height:1.5;">${formattedNote}</div>
          </div>`;
        }

        html += `</div>`;
      }

      caseWrapper.innerHTML = html;
      fragment.appendChild(caseWrapper);
    });

    printArea.appendChild(fragment);

    document.body.classList.remove('print-mode-question', 'print-mode-checklist', 'print-orientation-portrait', 'print-orientation-landscape', 'print-scale-80', 'print-scale-100', 'print-scale-120', 'print-scale-140', 'print-scale-160');

    if (mode === 'question') document.body.classList.add('print-mode-question');
    else if (mode === 'checklist') document.body.classList.add('print-mode-checklist');

    document.body.classList.add('print-orientation-' + orient);
    document.body.classList.add('print-scale-' + scale);

    closeBatchPrintModal();
    showGlobalLoader(false);

    triggerNativePrint(orient, scale, mode, 'batch-print-execution-area');
  }, 100);
}

// ─── Global Universal Print Trigger (iOS Safari & Desktop) ───────────────────
function triggerNativePrint(orient, scale, mode, printAreaId, onDone) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // 1. Lock screen DOM with printing isolation class
  document.body.classList.add('is-printing');
  document.body.classList.add('print-orientation-' + orient);
  document.body.classList.add('print-scale-' + scale);
  if (mode === 'question') document.body.classList.add('print-mode-question');
  else if (mode === 'checklist') document.body.classList.add('print-mode-checklist');

  // 2. Apply dynamic @page media query rules
  if (typeof applyDynamicPrintStyle === 'function') {
    applyDynamicPrintStyle(orient);
  }

  // 3. Define safe cleanup method
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove(
      'is-printing',
      'print-mode-question', 'print-mode-checklist',
      'print-orientation-portrait', 'print-orientation-landscape',
      'print-scale-80', 'print-scale-100', 'print-scale-120', 'print-scale-140', 'print-scale-160'
    );
    if (typeof onDone === 'function') onDone();

    // DO NOT wipe print area immediately on iOS (AirPrint renders asynchronously in background)
    setTimeout(() => {
      const area = document.getElementById(printAreaId);
      if (area && !document.body.classList.contains('is-printing')) {
        area.innerHTML = '';
      }
    }, isIOS ? 30000 : 2000);
  };

  // 4. Listen for desktop/browser native afterprint event
  window.addEventListener('afterprint', cleanup, { once: true });

  // 5. Call window.print() after layout cycle, with fallback cleanup timer
  setTimeout(() => {
    window.print();
    // Fallback timer: unlock screen UI after 4 seconds on iOS, 1.5 seconds on desktop
    setTimeout(cleanup, isIOS ? 4000 : 1500);
  }, isIOS ? 350 : 150);
}


// ──────────────────────────────────────────────────────────────
// CASE REPORT SYSTEM
// ──────────────────────────────────────────────────────────────

// State for the report system
const ReportState = {
  selectedCaseId: '',
  selectedCaseTitle: '',
  allReports: [],
  activeFilter: 'all'  // 'all' | 'pending' | 'in-progress' | 'resolved'
};

/**
 * Open the report modal, optionally pre-select a case by caseId
 */
function openReportModal(preselectedCaseId = '') {
  const overlay = document.getElementById('report-modal-overlay');
  if (!overlay) return;

  // Reset form
  const searchInput = document.getElementById('report-case-search');
  const problemSelect = document.getElementById('report-problem-type');
  const descTextarea = document.getElementById('report-description');
  const badge = document.getElementById('report-selected-case-badge');
  const badgeText = document.getElementById('report-selected-case-text');

  if (searchInput) searchInput.value = '';
  if (problemSelect) problemSelect.value = '';
  if (descTextarea) descTextarea.value = '';
  
  ReportState.selectedCaseId = '';
  ReportState.selectedCaseTitle = '';

  // Pre-select case if provided
  if (preselectedCaseId && AppState.cases) {
    const found = AppState.cases.find(c => c.caseId === preselectedCaseId);
    if (found) {
      ReportState.selectedCaseId = found.caseId;
      ReportState.selectedCaseTitle = found.title || found.caseId;
      if (searchInput) searchInput.value = `${found.caseId} — ${found.title || ''}`;
      if (badge) badge.classList.add('show');
      if (badgeText) badgeText.innerHTML = `<strong>${found.caseId}</strong> ${found.title || ''}`;
    }
  } else {
    if (badge) badge.classList.remove('show');
  }

  overlay.classList.add('show');
  setTimeout(() => { if (searchInput) searchInput.focus(); }, 200);
}

/**
 * Close the report modal
 */
function closeReportModal() {
  const overlay = document.getElementById('report-modal-overlay');
  if (overlay) overlay.classList.remove('show');
  const dropdown = document.getElementById('report-case-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

/**
 * Handle case search input inside report modal — filter & show dropdown
 */
function handleReportCaseSearch(event) {
  const query = event.target.value.trim().toLowerCase();
  const dropdown = document.getElementById('report-case-dropdown');
  if (!dropdown) return;

  if (!query) {
    dropdown.classList.remove('show');
    ReportState.selectedCaseId = '';
    ReportState.selectedCaseTitle = '';
    const badge = document.getElementById('report-selected-case-badge');
    if (badge) badge.classList.remove('show');
    return;
  }

  const cases = AppState.cases || [];
  const matched = cases.filter(c =>
    c.caseId.toLowerCase().includes(query) ||
    (c.title || '').toLowerCase().includes(query) ||
    (c.disease || '').toLowerCase().includes(query)
  ).slice(0, 12);

  if (matched.length === 0) {
    dropdown.innerHTML = `<div class="report-case-option" style="color:var(--text-muted);">ไม่พบเคส</div>`;
  } else {
    dropdown.innerHTML = matched.map(c => `
      <div class="report-case-option" onclick="selectReportCase('${c.caseId}', '${(c.title || '').replace(/'/g, "\\'")}')">
        <span class="opt-id">${c.caseId}</span>
        <span class="opt-title">${c.title || ''}</span>
      </div>
    `).join('');
  }
  dropdown.classList.add('show');
}

/**
 * Select a case from the dropdown
 */
function selectReportCase(caseId, caseTitle) {
  ReportState.selectedCaseId = caseId;
  ReportState.selectedCaseTitle = caseTitle;

  const searchInput = document.getElementById('report-case-search');
  if (searchInput) searchInput.value = `${caseId} — ${caseTitle}`;

  const dropdown = document.getElementById('report-case-dropdown');
  if (dropdown) dropdown.classList.remove('show');

  const badge = document.getElementById('report-selected-case-badge');
  const badgeText = document.getElementById('report-selected-case-text');
  if (badge) badge.classList.add('show');
  if (badgeText) badgeText.innerHTML = `<strong>${caseId}</strong> ${caseTitle}`;
}

/**
 * Clear selected case in report modal
 */
function clearReportCase() {
  ReportState.selectedCaseId = '';
  ReportState.selectedCaseTitle = '';
  const searchInput = document.getElementById('report-case-search');
  if (searchInput) { searchInput.value = ''; searchInput.focus(); }
  const badge = document.getElementById('report-selected-case-badge');
  if (badge) badge.classList.remove('show');
}

/**
 * Submit the report form to Apps Script
 */
async function submitCaseReport() {
  const problemSelect = document.getElementById('report-problem-type');
  const descTextarea = document.getElementById('report-description');
  const submitBtn = document.getElementById('report-submit-btn');

  const caseId = ReportState.selectedCaseId;
  const caseTitle = ReportState.selectedCaseTitle;
  const problemType = problemSelect ? problemSelect.value.trim() : '';
  const description = descTextarea ? descTextarea.value.trim() : '';

  // Validate
  if (!caseId) {
    showReportToast('⚠️ กรุณาเลือกเคสก่อน', true);
    const searchInput = document.getElementById('report-case-search');
    if (searchInput) searchInput.focus();
    return;
  }
  if (!problemType) {
    showReportToast('⚠️ กรุณาเลือกประเภทปัญหา', true);
    if (problemSelect) problemSelect.focus();
    return;
  }
  if (!description || description.length < 5) {
    showReportToast('⚠️ กรุณาอธิบายปัญหาให้ละเอียดขึ้น', true);
    if (descTextarea) descTextarea.focus();
    return;
  }

  // Disable button during submission
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง...';
  }

  try {
    const params = new URLSearchParams({
      action: 'submitReport',
      caseId: caseId,
      caseTitle: caseTitle,
      problemType: problemType,
      description: description
    });
    
    const res = await fetch(`${currentApiUrl}?${params.toString()}`, {
      signal: AbortSignal.timeout(15000)
    });
    const json = await res.json();
    
    if (json && json.data && json.data.success) {
      closeReportModal();
      showReportToast(`✅ ส่ง Report สำเร็จ! (${json.data.reportId})`);
      // Reload history after short delay
      setTimeout(() => loadReportHistory(), 1000);
    } else {
      const errMsg = (json && json.data && json.data.error) ? json.data.error : 'Unknown error';
      showReportToast(`❌ ส่งไม่สำเร็จ: ${errMsg}`, true);
    }
  } catch (e) {
    showReportToast('❌ ไม่สามารถเชื่อมต่อ API ได้ กรุณาลองใหม่', true);
    console.error('submitCaseReport error:', e);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚨 ส่ง Report';
    }
  }
}

/**
 * Load report history from Apps Script and render it
 */
async function loadReportHistory() {
  const container = document.getElementById('report-history-body');
  if (!container) return;
  
  // Show loading state
  container.innerHTML = `
    <div class="report-history-loading">
      <div class="report-history-spinner"></div>
      <span>กำลังโหลดประวัติ Report...</span>
    </div>
  `;

  try {
    const res = await fetch(`${currentApiUrl}?action=getReports`, {
      signal: AbortSignal.timeout(15000)
    });
    const json = await res.json();
    
    if (json && json.data && json.data.reports) {
      ReportState.allReports = json.data.reports;
    } else {
      ReportState.allReports = [];
    }
  } catch (e) {
    ReportState.allReports = [];
    console.warn('loadReportHistory: API unavailable');
  }
  
  renderReportHistory();
  updateReportCountBadge();
}

/**
 * Get status display info for a report
 */
function getReportStatusInfo(status) {
  switch (status) {
    case 'กำลังแก้ไข':
      return { cls: 'status-in-progress', icon: '🟡', label: 'กำลังแก้ไข' };
    case 'แก้ไขแล้ว':
      return { cls: 'status-resolved', icon: '🟢', label: 'แก้ไขแล้ว' };
    default:
      return { cls: 'status-pending', icon: '🔴', label: 'ยังไม่แก้ไข' };
  }
}

/**
 * Render the report history table based on current filter
 */
function renderReportHistory() {
  const container = document.getElementById('report-history-body');
  if (!container) return;
  
  const filter = ReportState.activeFilter;
  let reports = ReportState.allReports;
  
  if (filter === 'pending') {
    reports = reports.filter(r => r.status === 'ยังไม่แก้ไข');
  } else if (filter === 'in-progress') {
    reports = reports.filter(r => r.status === 'กำลังแก้ไข');
  } else if (filter === 'resolved') {
    reports = reports.filter(r => r.status === 'แก้ไขแล้ว');
  }
  
  if (reports.length === 0) {
    container.innerHTML = `
      <div class="report-history-empty">
        <div class="empty-icon">📋</div>
        <p>${ReportState.allReports.length === 0 ? 'ยังไม่มี Report ใด ๆ ในระบบ' : 'ไม่มี Report ที่ตรงกับตัวกรองนี้'}</p>
      </div>
    `;
    return;
  }
  
  const rows = reports.map(r => {
    const statusInfo = getReportStatusInfo(r.status);
    const caseLink = `<a href="case-viewer.html?id=${r.caseId}" class="report-case-id-link">${r.caseId}</a>`;
    const caseTitle = r.caseTitle ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${r.caseTitle}</div>` : '';
    const staffNotes = r.staffNotes
      ? `<span class="report-staff-notes-cell">${r.staffNotes}</span>`
      : `<span style="color:var(--text-muted);font-size:0.78rem;">—</span>`;
    
    return `
      <tr>
        <td><span class="report-timestamp">${r.timestamp}</span></td>
        <td>${caseLink}${caseTitle}</td>
        <td><span class="report-problem-type">${r.problemType}</span></td>
        <td class="report-description-cell">${r.description}</td>
        <td><span class="report-status-badge ${statusInfo.cls}">${statusInfo.icon} ${statusInfo.label}</span></td>
        <td>${staffNotes}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="report-history-table-wrapper">
      <table class="report-history-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เคส</th>
            <th>ประเภทปัญหา</th>
            <th>รายละเอียด</th>
            <th>สถานะ</th>
            <th>หมายเหตุสตาฟ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/**
 * Set the active filter for report history
 */
function setReportFilter(filter) {
  ReportState.activeFilter = filter;
  
  // Update active button
  document.querySelectorAll('.report-history-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderReportHistory();
}

/**
 * Toggle report history section visibility
 */
function toggleReportHistory() {
  const body = document.getElementById('report-history-body');
  const toggleBtn = document.getElementById('report-history-toggle-btn');
  if (!body || !toggleBtn) return;
  
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  toggleBtn.textContent = isHidden ? '🔼 ซ่อนประวัติ' : '🔽 แสดงประวัติ';
  
  // Load on first open
  if (isHidden && ReportState.allReports.length === 0) {
    loadReportHistory();
  }
}

/**
 * Update the count badge in the report history section header
 */
function updateReportCountBadge() {
  const badge = document.getElementById('report-count-badge');
  if (!badge) return;
  const pending = ReportState.allReports.filter(r => r.status !== 'แก้ไขแล้ว').length;
  badge.textContent = ReportState.allReports.length;
  badge.style.background = pending > 0 ? '#e53e3e' : '#2f855a';
}

/**
 * Show a toast notification
 */
function showReportToast(message, isError = false) {
  let toast = document.getElementById('report-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'report-toast';
    toast.className = 'report-toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.className = `report-toast ${isError ? 'error-toast' : ''}`;
  
  // Force reflow then show
  void toast.offsetHeight;
  toast.classList.add('show');
  
  setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// ──────────────────────────────────────────────────────────────
// OSPE STATION TIMEOUT AUDIO ALARM (Web Audio API)
// ──────────────────────────────────────────────────────────────
let _sharedAudioCtx = null;

function getSharedAudioContext() {
  try {
    if (!_sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        _sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (_sharedAudioCtx && _sharedAudioCtx.state === 'suspended') {
      _sharedAudioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.warn('[Audio] AudioContext init error:', e);
  }
  return _sharedAudioCtx;
}

// Auto-unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const _unlockAudio = () => {
    getSharedAudioContext();
  };
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, _unlockAudio, { once: true, passive: true });
  });
}

function playStationTimeoutAlarm(type = 'alarm') {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (type === 'bell') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.4, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.25);
      });
    } else {
      // Thrilling, startling, prolonged authentic OSPE industrial buzzer siren (2.3s duration)
      const bursts = [
        { start: 0.0, dur: 0.75, freqs: [370, 392, 185] }, // F#4, G4 (dissonant semitone) + sub F#3
        { start: 0.88, dur: 1.42, freqs: [349.23, 370, 174.6] } // F4, F#4 + sub F3
      ];

      bursts.forEach(b => {
        b.freqs.forEach((freq, fIdx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = fIdx === 2 ? 'square' : 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + b.start);
          osc.frequency.linearRampToValueAtTime(freq * 0.95, now + b.start + b.dur);

          gainNode.gain.setValueAtTime(0.001, now + b.start);
          gainNode.gain.linearRampToValueAtTime(fIdx === 2 ? 0.25 : 0.4, now + b.start + 0.03);
          gainNode.gain.setValueAtTime(fIdx === 2 ? 0.22 : 0.35, now + b.start + b.dur - 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + b.start + b.dur);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(now + b.start);
          osc.stop(now + b.start + b.dur + 0.08);
        });
      });
    }
  } catch (err) {
    console.warn('[Audio] Failed to play OSPE alarm:', err);
  }
}

// Make accessible globally
window.playStationTimeoutAlarm = playStationTimeoutAlarm;
window.getSharedAudioContext = getSharedAudioContext;

// ──────────────────────────────────────────────────────────────
// INTERACTIVE FILL-IN-THE-BLANK / AUTO-CHECK SYSTEM
// Tag Formats:
//   [BLANK: Answer1, Answer2 | Score | ข้อ 1.1]
//   [BLANK: Answer1, Answer2 | Score | 1.1]
//   [BLANK: Answer1, Answer2 | Score | ข้อ 1.1 | len: 12] or [BLANK: Answer1 | len: short/medium/long]
// ──────────────────────────────────────────────────────────────
function renderInteractiveBlanks(htmlOrText, options = {}) {
  if (!htmlOrText) return '';
  const isExamineeOnly = options.isExamineeOnly || false;
  const isExaminer = options.isExaminer || false;
  const stationNum = options.stationNum || null;
  const caseId = options.caseId || '';

  // Regex matches: [BLANK: answers | score/param | tag/param | optional_param]
  const blankRegex = /\[BLANK:\s*([^|\]]+)(?:\s*\|\s*([^|\]]+))?(?:\s*\|\s*([^|\]]+))?(?:\s*\|\s*([^\]]+))?\]/gi;
  let blankIndex = 0;

  let processed = htmlOrText.replace(blankRegex, (match, p1, p2, p3, p4) => {
    blankIndex++;
    const answers = (p1 || '').split(/[,/]/).map(a => a.trim()).filter(Boolean);
    
    // Parse positional or key-value parameters
    const rawParts = [p2, p3, p4].filter(Boolean);
    let score = 1.0;
    let tag = '';
    let customWidth = '';
    let customLen = null;

    rawParts.forEach(part => {
      const trimmed = part.trim();
      if (/^len:\s*(\d+|short|medium|long|s|m|l)/i.test(trimmed)) {
        const val = trimmed.replace(/^len:\s*/i, '').trim().toLowerCase();
        if (val === 'short' || val === 's') customLen = 8;
        else if (val === 'medium' || val === 'm') customLen = 16;
        else if (val === 'long' || val === 'l') customLen = 28;
        else customLen = parseInt(val, 10);
      } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
        score = parseFloat(trimmed);
      } else {
        // Assume it is tag (e.g. "ข้อ 1.1", "1.1", "#1.1", "ข้อ 2")
        tag = trimmed.replace(/^#/, '').trim();
      }
    });

    if (!tag) {
      tag = `ข้อ ${blankIndex}`;
    }

    // Clean display tag format (e.g. convert "1.1" -> "ข้อ 1.1")
    const cleanDisplayTag = tag.startsWith('ข้อ') ? tag : `ข้อ ${tag}`;
    const cleanDataTag = tag.replace(/^ข้อ\s*/, '').trim();

    // Auto calculate initial input width if not explicitly defined
    let maxAnsLength = answers.reduce((max, a) => Math.max(max, a.length), 10);
    let initialCols = customLen || Math.min(Math.max(maxAnsLength + 4, 12), 34);

    const inputId = `blank-input-${cleanDataTag.replace(/[^a-zA-Z0-9_-]/g, '_') || blankIndex}`;
    const encAnswers = encodeURIComponent(JSON.stringify(answers));

    if (isExaminer) {
      // Examiner View: Display clean answer badge & points
      return `
        <span class="interactive-blank-examiner-badge" data-tag="${escapeHtml(cleanDataTag)}">
          <span class="blank-ans-label">🔑 เฉลย (${escapeHtml(cleanDisplayTag)}): <strong>${escapeHtml(answers.join(' / '))}</strong></span>
          <span class="blank-score-label">(${score} คะแนน)</span>
        </span>
      `;
    }

    // Examinee / Solo / Practice View:
    // Render an interactive auto-resizing input with instant check button
    return `
      <span class="interactive-blank-wrapper" data-tag="${escapeHtml(cleanDataTag)}" data-display-tag="${escapeHtml(cleanDisplayTag)}" data-score="${score}" data-answers="${encAnswers}">
        <input type="text" 
               class="interactive-blank-input" 
               id="${inputId}" 
               size="${initialCols}"
               style="width: ${initialCols}ch; max-width: 90vw;"
               placeholder="พิมพ์คำตอบ..." 
               autocomplete="off" 
               spellcheck="false" 
               onkeydown="if(event.key === 'Enter'){ checkSingleInteractiveBlank(this.parentElement); }"
               oninput="handleInteractiveBlankInput(this)" />
        <button type="button" class="btn-check-blank" onclick="checkSingleInteractiveBlank(this.parentElement)" title="กดเพื่อตรวจคำตอบ">
          🔍 ตรวจ
        </button>
        <span class="blank-status-badge"></span>
      </span>
    `;
  });

  return processed;
}

function encodeFirebaseKey(k) {
  return String(k)
    .replace(/\./g, '__dot__')
    .replace(/\//g, '__slash__')
    .replace(/#/g, '__hash__')
    .replace(/\$/g, '__dollar__')
    .replace(/\[/g, '__lbr__')
    .replace(/\]/g, '__rbr__');
}

function decodeFirebaseKey(k) {
  return String(k)
    .replace(/__dot__/g, '.')
    .replace(/__slash__/g, '/')
    .replace(/__hash__/g, '#')
    .replace(/__dollar__/g, '$')
    .replace(/__lbr__/g, '[')
    .replace(/__rbr__/g, ']');
}

function normalizeAnswerText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[\s\-_.,/()]/g, '') // remove spaces, dashes, dots, punctuation
    .trim();
}

function handleInteractiveBlankInput(inputEl) {
  const wrapper = inputEl.closest('.interactive-blank-wrapper');
  if (!wrapper) return;

  // Auto-expand input width dynamically as user types
  const currentValLen = inputEl.value.length;
  const initialCols = parseInt(inputEl.getAttribute('size'), 10) || 14;
  const newCols = Math.max(initialCols, currentValLen + 3);
  inputEl.style.width = `${Math.min(newCols, 45)}ch`;

  // Reset previous check status when user edits
  wrapper.classList.remove('is-correct', 'is-wrong');
  const badge = wrapper.querySelector('.blank-status-badge');
  if (badge) {
    badge.textContent = '';
    badge.style.display = 'none';
  }

  // Dispatch custom event for multiplayer debounce sync
  window.dispatchEvent(new CustomEvent('interactiveBlankChanged', {
    detail: {
      tag: wrapper.getAttribute('data-tag'),
      value: inputEl.value,
      wrapper: wrapper,
      immediate: false
    }
  }));
}

function checkSingleInteractiveBlank(wrapper) {
  if (!wrapper) return;
  const inputEl = wrapper.querySelector('.interactive-blank-input');
  const badge = wrapper.querySelector('.blank-status-badge');
  if (!inputEl) return;

  const rawUserVal = inputEl.value.trim();
  const normUserVal = normalizeAnswerText(rawUserVal);
  const encAnswers = wrapper.getAttribute('data-answers') || '';
  let accepted = [];
  try {
    accepted = JSON.parse(decodeURIComponent(encAnswers));
  } catch (e) {
    accepted = [];
  }

  const tag = wrapper.getAttribute('data-tag');
  const score = parseFloat(wrapper.getAttribute('data-score')) || 1.0;

  if (!rawUserVal) {
    wrapper.classList.remove('is-correct', 'is-wrong');
    if (badge) {
      badge.textContent = 'กรุณาพิมพ์คำตอบ';
      badge.className = 'blank-status-badge is-empty';
      badge.style.display = 'inline-flex';
    }
    if (tag) autoCheckLinkedChecklistItem(tag, false);
    // Dispatch immediate sync
    window.dispatchEvent(new CustomEvent('interactiveBlankChanged', {
      detail: { tag, value: '', wrapper, immediate: true }
    }));
    return;
  }

  // Check matching
  const isMatch = accepted.some(ans => {
    const normAns = normalizeAnswerText(ans);
    return normUserVal === normAns;
  });

  if (isMatch) {
    wrapper.classList.remove('is-wrong');
    wrapper.classList.add('is-correct');
    if (badge) {
      badge.textContent = `✅ ถูกต้อง! (+${score} คะแนน)`;
      badge.className = 'blank-status-badge is-correct';
      badge.style.display = 'inline-flex';
    }

    // Auto-tick linked checklist item if exists
    if (tag) {
      autoCheckLinkedChecklistItem(tag, true);
    }
  } else {
    wrapper.classList.remove('is-correct');
    wrapper.classList.add('is-wrong');
    if (badge) {
      badge.textContent = '❌ ยังไม่ถูกต้อง';
      badge.className = 'blank-status-badge is-wrong';
      badge.style.display = 'inline-flex';
    }
    if (tag) {
      autoCheckLinkedChecklistItem(tag, false);
    }
  }

  // Dispatch immediate sync to Firebase
  window.dispatchEvent(new CustomEvent('interactiveBlankChanged', {
    detail: {
      tag,
      value: inputEl.value,
      wrapper,
      isMatch,
      immediate: true
    }
  }));
}

function autoCheckLinkedChecklistItem(tag, shouldCheck = true) {
  if (!tag) return;
  const rawTag = tag.replace(/^#/, '').trim();
  const numOnly = rawTag.replace(/^ข้อ\s*/, '').trim(); // e.g. "1.1"
  const fullTextTag = rawTag.startsWith('ข้อ') ? rawTag : `ข้อ ${rawTag}`; // e.g. "ข้อ 1.1"

  const items = document.querySelectorAll('.checklist-item');
  items.forEach(item => {
    const itemText = item.textContent || '';
    const itemDataTag = item.getAttribute('data-tag') || '';
    
    const hasTagMatch = (itemDataTag === numOnly || itemDataTag === fullTextTag) ||
                        itemText.includes(`(${fullTextTag})`) ||
                        itemText.includes(`(${numOnly})`) ||
                        itemText.includes(`(ข้อ ${numOnly})`) ||
                        itemText.includes(fullTextTag) ||
                        itemText.includes(`ข้อ ${numOnly}`) ||
                        itemText.trim().startsWith(fullTextTag) ||
                        itemText.trim().startsWith(numOnly);

    if (hasTagMatch) {
      const isAlreadyChecked = item.classList.contains('checked');
      if (shouldCheck && !isAlreadyChecked) {
        // Trigger click on item to auto-tick and update score
        item.click();
      } else if (!shouldCheck && isAlreadyChecked) {
        item.click();
      }
    }
  });
}

function checkAllInteractiveBlanks() {
  const wrappers = document.querySelectorAll('.interactive-blank-wrapper');
  wrappers.forEach(w => checkSingleInteractiveBlank(w));
}

// Global exports
window.encodeFirebaseKey = encodeFirebaseKey;
window.decodeFirebaseKey = decodeFirebaseKey;
window.normalizeAnswerText = normalizeAnswerText;
window.autoCheckLinkedChecklistItem = autoCheckLinkedChecklistItem;
window.renderInteractiveBlanks = renderInteractiveBlanks;
window.checkSingleInteractiveBlank = checkSingleInteractiveBlank;
window.checkAllInteractiveBlanks = checkAllInteractiveBlanks;
window.handleInteractiveBlankInput = handleInteractiveBlankInput;


// ──────────────────────────────────────────────────────────────
// 🧭 MOBILE FLOATING DRAWER NAVIGATION CONTROLLER
// ──────────────────────────────────────────────────────────────
function initMobileNavigation() {
  if (document.getElementById('mobile-nav-drawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'mobile-nav-overlay';
  overlay.className = 'mobile-nav-drawer-overlay';
  overlay.onclick = () => closeMobileNav();

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const drawer = document.createElement('div');
  drawer.id = 'mobile-nav-drawer';
  drawer.className = 'mobile-nav-drawer';
  drawer.innerHTML = `
    <div class="mobile-drawer-header">
      <div class="mobile-drawer-title">
        <span>🥼</span>
        <span>RxCU OSPE Hub</span>
      </div>
      <button type="button" class="mobile-drawer-close" onclick="closeMobileNav()" title="ปิดเมนู (Esc)">✕</button>
    </div>
    <div class="mobile-drawer-nav-list">
      <a href="index.html" class="mobile-drawer-item ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
        <span class="mobile-drawer-icon">🏠</span>
        <span>หน้าแรก</span>
      </a>
      <a href="case-library.html" class="mobile-drawer-item ${currentPath === 'case-library.html' ? 'active' : ''}">
        <span class="mobile-drawer-icon">📚</span>
        <span>คลังเคสข้อสอบ</span>
      </a>
      <a href="exam-simulation.html" class="mobile-drawer-item ${currentPath === 'exam-simulation.html' ? 'active' : ''}">
        <span class="mobile-drawer-icon">🎯</span>
        <span>ซ้อมสอบ 16 สถานี</span>
      </a>
      <a href="video-library.html" class="mobile-drawer-item ${currentPath === 'video-library.html' ? 'active' : ''}">
        <span class="mobile-drawer-icon">🎬</span>
        <span>คลิปเทคนิค (Product & Clinic)</span>
      </a>
      <a href="handbook-library.html" class="mobile-drawer-item ${currentPath === 'handbook-library.html' ? 'active' : ''}">
        <span class="mobile-drawer-icon">📖</span>
        <span>คู่มือทักษะสภาฯ</span>
      </a>
    </div>
    <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.76rem; color: var(--text-muted); text-align: center;">
      RxCU PLE-CC2 Practice Hub 2569
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // Inject Hamburger button to topbar-right if not present
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight && !document.getElementById('mobile-nav-toggle-btn')) {
    const hamburger = document.createElement('button');
    hamburger.type = 'button';
    hamburger.id = 'mobile-nav-toggle-btn';
    hamburger.className = 'mobile-nav-toggle-btn';
    hamburger.title = 'เปิดเมนูนำทาง';
    hamburger.onclick = () => openMobileNav();
    hamburger.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    topbarRight.appendChild(hamburger);
  }
}

function openMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (overlay) overlay.classList.add('show');
  if (drawer) drawer.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (overlay) overlay.classList.remove('show');
  if (drawer) drawer.classList.remove('show');
  document.body.style.overflow = '';
}

window.initMobileNavigation = initMobileNavigation;
window.openMobileNav = openMobileNav;
window.closeMobileNav = closeMobileNav;
