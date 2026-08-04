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
  checklistProgress: {}, // { caseId: [checked_id1, checked_id2] }
  dataReady: false,      // true = API sync done (full content available)
  dataReadyCount: 0      // number of cases with full content confirmed
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
  
  // โหลดฐานข้อมูลรายละเอียดออฟไลน์พร้อม Progress Bar แบบ Asynchronous
  loadOfflineDetailsWithProgress();
  
  // โหลดข้อมูลเคสเบื้องต้น (แบบสรุป)
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
  if (!btn) return;
  const isLight = AppState.theme === 'light';
  btn.innerHTML = isLight ? '🌙' : '☀️';
  btn.setAttribute('title', isLight ? 'สลับเป็นโหมดกลางคืน (Dark Mode)' : 'สลับเป็นโหมดกลางวัน (Light Mode)');
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
    showApiStatusBanner(true, '⚡ ใช้งานข้อมูล Offline ในเครื่อง (กำลังซิงก์ข้อมูลล่าสุด..)');
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
        AppState.dataReady = true;
        AppState.dataReadyCount = fetchedCases.length;
        showApiStatusBanner(true, `✅ ข้อมูลพร้อมแล้ว — เชื่อมต่อสำเร็จ (${fetchedCases.length} เคส)`);
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
        showApiStatusBanner(true, '⚡ ใช้งานข้อมูล Offline ในเครื่อง (พร้อมใช้งาน)');
        window.dispatchEvent(new CustomEvent('appDataReady', { detail: { count: AppState.cases.length, isOffline: true } }));
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
 * fetchCaseDetail — ดึงข้อมูล scenario/checklist เต็มของเคสจาก API แบบ on-demand
 * ใช้เมื่อ case ที่อยู่ใน AppState.cases ไม่มี contentHtml / scenario / checklist
 * (เช่น เคสใหม่ที่ยังไม่ได้อัปเดตใน offline file)
 * @param {string} caseId
 * @returns {Promise<object|null>} full case object or null
 */
async function fetchCaseDetail(caseId) {
  if (!caseId) return null;
  const cleanId = caseId.trim();

  // 1. Check local OFFLINE_CASE_DETAILS if loaded (0ms instant resolution)
  if (typeof OFFLINE_CASE_DETAILS !== 'undefined' && OFFLINE_CASE_DETAILS[cleanId]) {
    const det = OFFLINE_CASE_DETAILS[cleanId];
    const idx = AppState.cases.findIndex(c => c.caseId && c.caseId.trim() === cleanId);
    if (idx !== -1) {
      AppState.cases[idx] = Object.assign({}, AppState.cases[idx], det);
      return AppState.cases[idx];
    }
    return Object.assign({ caseId: cleanId }, det);
  }

  // 2. Fetch from API
  if (!currentApiUrl) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for GAS cold start
    const res = await fetch(`${currentApiUrl}?action=getCase&id=${encodeURIComponent(cleanId)}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json.success && json.data) {
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
const DB_VERSION_STR = 'v1.2.6'; // อัปเดตเวอร์ชันนี้เมื่อมีข้อมูลเคสใหม่ในตัวแปรออฟไลน์เพื่อบังคับโหลดใหม่

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

function getCaseFromDB(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function getAllCasesFromDB(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    const keysRequest = store.getAllKeys();
    
    request.onsuccess = (e) => {
      const items = e.target.result;
      keysRequest.onsuccess = (ev) => {
        const keys = ev.target.result;
        const resultObj = {};
        keys.forEach((key, idx) => {
          resultObj[key] = items[idx];
        });
        resolve(resultObj);
      };
      keysRequest.onerror = (e) => reject(e.target.error);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveCasesToDB(db, casesObj) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    for (const [id, caseData] of Object.entries(casesObj)) {
      store.put(caseData, id);
    }
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
  const url = 'case-details-offline.js';
  const cleanId = getUrlParam('id') ? getUrlParam('id').trim() : null;
  
  try {
    const db = await openIndexedDB();
    const cachedVersion = localStorage.getItem('ospe_db_version');
    
    // A. หากเคยโหลดและบันทึกลง IndexedDB เวอร์ชันล่าสุดตรงกันแล้ว
    if (cachedVersion === DB_VERSION_STR) {
      console.log('[Database Preloader] Database matches DB_VERSION_STR in IndexedDB.');
      
      if (cleanId) {
        // ดึงเฉพาะเคสที่ต้องการสำหรับหน้านี้มาใช้ทันที (ใช้เวลา ~2ms)
        const cachedCase = await getCaseFromDB(db, cleanId);
        if (cachedCase) {
          window.OFFLINE_CASE_DETAILS = { [cleanId]: cachedCase };
          console.log(`[Database Preloader] Case ${cleanId} retrieved instantly from IndexedDB cache.`);
          mergeOfflineDetails();
          return;
        }
      } else {
        // โหลดข้อมูลเคสทั้งหมดในเบื้องหลัง เพื่อใช้ในหน้า Simulator / สุ่มเคส
        const allDetails = await getAllCasesFromDB(db);
        if (allDetails && Object.keys(allDetails).length > 0) {
          window.OFFLINE_CASE_DETAILS = allDetails;
          console.log('[Database Preloader] All cases retrieved from IndexedDB.');
          mergeOfflineDetails();
          return;
        }
      }
    }
    
    // B. หากเป็นครั้งแรก หรือมีการเปลี่ยนเวอร์ชัน ให้โหลดข้อมูลใหม่พร้อม Progress Bar
    let showOverlayTimeout = setTimeout(() => {
      injectSplashOverlay();
    }, 100); // ป้องกันภาพกระพริบหากโหลดจาก cache ท้องถิ่นเสร็จเร็วมาก
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const contentLength = +response.headers.get('Content-Length') || 1860000;
    const reader = response.body.getReader();
    
    let receivedLength = 0;
    const chunks = [];
    
    while(true) {
      const {done, value} = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      
      let pct = Math.round((receivedLength / contentLength) * 100);
      if (pct > 99) pct = 99; // ค้างที่ 99% จนกว่าจะประกอบร่างเสร็จ
      
      updateSplashProgress(pct, receivedLength, contentLength);
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
    
    updateSplashProgress(100, receivedLength, receivedLength);
    console.log('[Database Preloader] Database downloaded and evaluated.');
    
    // บันทึกลง IndexedDB เพื่อใช้งานครั้งต่อไป
    if (typeof OFFLINE_CASE_DETAILS !== 'undefined') {
      await saveCasesToDB(db, OFFLINE_CASE_DETAILS);
      localStorage.setItem('ospe_db_version', DB_VERSION_STR);
      console.log('[Database Preloader] Database stored in IndexedDB.');
    }
    
    mergeOfflineDetails();
    clearTimeout(showOverlayTimeout);
    hideSplashOverlay();
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
      if (OFFLINE_CASE_DETAILS[cleanId]) {
        AppState.cases[idx] = Object.assign({}, c, OFFLINE_CASE_DETAILS[cleanId]);
      }
    });
    console.log('[Database Preloader] Merged offline details into AppState.');
  }
}


