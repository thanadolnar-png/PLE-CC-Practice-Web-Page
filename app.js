/**
 * PLE-CC2 OSPE Practice System — Main Application Logic
 * File: app.js
 * ====================================================
 * จัดการสิทธิ์การแสดงผล, โหลดข้อมูลเคสจาก Google Apps Script API
 * หรือสลับไปใช้ Offline Database หากยังไม่เชื่อมต่อ API, 
 * และควบคุม Interactive Checklist
 */

// อัปเดต URL ของ Google Apps Script Web App ที่นี่หลังทำ Deployment เสร็จ
const API_URL = 'https://script.google.com/macros/s/AKfycbwhdMVZ2mcR2dwUagrcLJ6Os1PjwrKO_X8xjwEOJUWYYONZfmYjvVbdXrCVh7qFC0iM/exec';
let currentApiUrl = API_URL;

const AppState = {
  theme: localStorage.getItem('theme') || 'light',
  cases: [],
  filteredCases: [],
  currentCase: null,
  activeFilters: {
    category: 'All',
    mainGroup: 'All',
    disease: 'All',
    search: ''
  },
  checklistProgress: {} // { caseId: [checked_id1, checked_id2] }
};

// ──────────────────────────────────────────────────────────────
// 0. AUTHENTICATION & LOCK SYSTEM (Password: rxcu_ple_cc)
// ──────────────────────────────────────────────────────────────
const SYSTEM_AUTH_PASS = 'rxcu_ple_cc';

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
  const navMenu = document.getElementById('nav-menu');
  if (navMenu && !document.getElementById('btn-logout')) {
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
// 1. Initializer & Event Listeners
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuthGuard();
  initTheme();
  initApiConfig();
  loadChecklistProgress();
  
  // โหลดข้อมูลเคสเบื้องต้น
  loadCasesData();

  // จัดการหน้าปัจจุบัน
  detectCurrentPage();
  
  // จัดการปุ่มเปลี่ยนมุมมอง (Grid/List)
  initViewToggles();
});

// ตรวจสอบ Theme
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    updateThemeButtonIcon(themeBtn);
    themeBtn.addEventListener('click', toggleTheme);
  }
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
  btn.innerHTML = AppState.theme === 'light' 
    ? `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>`
    : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M21 12h-2.25m-13.5 0H3m2.28 6.06l1.59-1.59m12.38-12.38l1.59-1.59M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z"></path></svg>`;
}

// จัดการ API Input modal/config (Deprecated: API is configured backend-only now)
function initApiConfig() {
  // No-op
}

// ──────────────────────────────────────────────────────────────
// 2. Data Fetching & State
// ──────────────────────────────────────────────────────────────
async function loadCasesData() {
  // 1. Render Offline Data IMMEDIATELY in 0ms if available
  if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases && OFFLINE_DATA.cases.length > 0) {
    AppState.cases = OFFLINE_DATA.cases;
    onCasesLoaded();
    showApiStatusBanner(true, '⚡ ใช้งานข้อมูล Offline ในเครื่อง (กำลังซิงก์ข้อมูลล่าสุดสด...)');
  } else {
    showGlobalLoader(true);
  }
  
  // 2. Background Sync with Google Apps Script API (Extended Timeout 12s for Cold Starts)
  if (currentApiUrl) {
    try {
      const cacheBuster = new Date().getTime();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds for GAS cold start
      
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
        AppState.cases = fetchedCases;
        showApiStatusBanner(true, '🟢 เชื่อมต่อซิงก์ข้อมูลสดสำเร็จ (Live Google Sheet Synced)');
        onCasesLoaded();
        return;
      }
    } catch (e) {
      console.warn('Google Apps Script API response delayed/timed out. Continuing with offline data:', e);
      if (AppState.cases && AppState.cases.length > 0) {
        showApiStatusBanner(true, '⚡ ใช้งานข้อมูล Offline ในเครื่อง (พร้อมใช้งาน)');
      } else {
        showApiStatusBanner(false, '⚠️ ไม่สามารถเชื่อมต่อ API ได้ — ใช้งานข้อมูล Offline');
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
      AppState.cases = OFFLINE_DATA.cases;
    } else {
      AppState.cases = [];
    }
    onCasesLoaded();
  }
}

function onCasesLoaded() {
  // Normalize data to fix potential trailing spaces from Google Sheets
  if (AppState.cases && AppState.cases.length > 0) {
    AppState.cases.forEach(c => {
      if (typeof c.category === 'string') {
        c.category = c.category.trim();
        // Map Thai names just in case they were typed in Thai
        if (c.category === 'คลินิก') c.category = 'Clinic';
        if (c.category === 'ผลิต') c.category = 'Product';
        if (c.category === 'สังคม' || c.category === 'สังคมฯ') c.category = 'SAP';
      }
      if (typeof c.mainGroup === 'string') c.mainGroup = c.mainGroup.trim();
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

function showGlobalLoader(show) {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

function showApiStatusBanner(isConnected, message) {
  const banner = document.getElementById('api-status-banner');
  if (banner) {
    banner.style.display = 'flex';
    banner.className = isConnected ? 'api-banner connected' : 'api-banner offline';
    banner.querySelector('.banner-text').textContent = message;
  }
}

// ──────────────────────────────────────────────────────────────
// 3. Stats Dashboard update
// ──────────────────────────────────────────────────────────────
function updateStatsDashboard() {
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
// 4. Filtering Logic
// ──────────────────────────────────────────────────────────────
function applyFilters() {
  let list = Array.isArray(AppState.cases) ? [...AppState.cases] : [];
  const { category, mainGroup, disease, search } = AppState.activeFilters;
  
  if (category && category !== 'All') {
    list = list.filter(c => c && c.category === category);
  }
  
  if (mainGroup && mainGroup !== 'All') {
    list = list.filter(c => c && c.mainGroup === mainGroup);
  }

  if (disease && disease !== 'All') {
    list = list.filter(c => c && (c.disease === disease || c.subTopic === disease));
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
  const selectGroup = document.getElementById('filter-course-group');
  const selectDisease = document.getElementById('filter-disease');
  if (!selectGroup) return;

  const currentCategory = AppState.activeFilters.category;
  const currentMainGroup = AppState.activeFilters.mainGroup;

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
      window.location.href = `case-viewer.html?id=${c.caseId}`;
    });
    
    card.innerHTML = `
      <div class="case-card-header">
        <span class="badge badge-${c.category.toLowerCase()}">${c.category}</span>
        <span class="case-card-id">${c.caseId}</span>
      </div>
      <h3 class="case-card-title">${c.title}</h3>
      <div style="margin-bottom: 0.5rem;">
        <span class="case-card-tag">${c.mainGroup || ""}${c.subTopic ? " · " + c.subTopic : ""}</span>
      </div>
      <div class="case-card-meta">
        <span>ผู้เขียน: ${c.author || 'ไม่ระบุ'}</span>
      </div>
    `;
    
    container.appendChild(card);
  });
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
  
  const index = AppState.checklistProgress[caseId].indexOf(itemId);
  if (index > -1) {
    // เอาออก (Uncheck)
    AppState.checklistProgress[caseId].splice(index, 1);
  } else {
    // ใส่เข้า (Check)
    AppState.checklistProgress[caseId].push(itemId);
  }
  
  saveChecklistProgress();
  updateChecklistUI(caseId);
}

function updateChecklistUI(caseId) {
  const checkedItems = AppState.checklistProgress[caseId] || [];
  
  // 1. อัปเดต Class ของรายการ Checklist
  const items = document.querySelectorAll('.checklist-item');
  let currentScore = 0;
  let totalScore = 0;
  
  items.forEach(el => {
    const itemId = el.getAttribute('data-id');
    const score = parseInt(el.getAttribute('data-score')) || 1;
    totalScore += score;
    
    if (checkedItems.includes(itemId)) {
      el.classList.add('checked');
      currentScore += score;
    } else {
      el.classList.remove('checked');
    }
  });
  
  // 2. อัปเดตคะแนน
  const scoreDisplay = document.getElementById('score-display');
  const pctDisplay = document.getElementById('percentage-display');
  const fillBar = document.getElementById('progress-bar-fill');
  
  if (scoreDisplay) scoreDisplay.textContent = `${currentScore} / ${totalScore}`;
  
  if (totalScore > 0) {
    const pct = Math.round((currentScore / totalScore) * 100);
    if (pctDisplay) pctDisplay.textContent = `${pct}%`;
    if (fillBar) {
      fillBar.style.width = `${pct}%`;
      // หากผ่าน 80% ให้แถบเป็นสีเขียว
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
    // ดักจับตัวเลือกการกรอง
    const searchInput = document.getElementById('search-case');
    const selectCat = document.getElementById('filter-category');
    const selectGroup = document.getElementById('filter-course-group');
    const selectDisease = document.getElementById('filter-disease');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AppState.activeFilters.search = e.target.value;
        applyFilters();
        renderCaseList();
      });
    }
    
    if (selectCat) {
      selectCat.addEventListener('change', (e) => {
        AppState.activeFilters.category = e.target.value;
        AppState.activeFilters.mainGroup = 'All';
        AppState.activeFilters.disease = 'All';
        renderFilterSelectOptions();
        applyFilters();
        renderCaseList();
      });
    }
    
    if (selectGroup) {
      selectGroup.addEventListener('change', (e) => {
        AppState.activeFilters.mainGroup = e.target.value;
        AppState.activeFilters.disease = 'All';
        renderFilterSelectOptions();
        applyFilters();
        renderCaseList();
      });
    }

    if (selectDisease) {
      selectDisease.addEventListener('change', (e) => {
        AppState.activeFilters.disease = e.target.value;
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
