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
  // 1. ดึงข้อมูลรายการเคสจาก LocalStorage (Cache) มาเรนเดอร์ก่อนทันที 0ms เพื่อความเร็ว
  let initialCases = [];
  const cachedListStr = localStorage.getItem('ospe_cached_case_list');
  if (cachedListStr) {
    try {
      initialCases = JSON.parse(cachedListStr);
    } catch (e) {
      initialCases = [];
    }
  }
  
  // หากยังไม่มี Cache ให้ใช้สคริปต์ Offline ตั้งต้น
  if (initialCases.length === 0 && typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
    initialCases = OFFLINE_DATA.cases;
  }
  
  if (initialCases.length > 0) {
    AppState.cases = initialCases;
    onCasesLoaded();
    showApiStatusBanner(true, '⚡ ใช้งานข้อมูลในเครื่อง (กำลังตรวจสอบการซิงก์กับ Google Sheet...)');
  } else {
    showGlobalLoader(true);
  }
  
  // 2. Background Sync with Google Apps Script API (Extended Timeout 25s for Cold Starts)
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
        
        // บันทึกความเปลี่ยนแปลงลง Cache LocalStorage
        localStorage.setItem('ospe_cached_case_list', JSON.stringify(fetchedCases));
        
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
async function fetchCaseDetail(caseId, forceLive = false) {
  if (!caseId) return null;
  const cleanId = caseId.trim();

  // 1. Check local OFFLINE_CASE_DETAILS if loaded and not forceLive (0ms instant resolution)
  if (!forceLive && typeof OFFLINE_CASE_DETAILS !== 'undefined' && OFFLINE_CASE_DETAILS[cleanId]) {
    const det = OFFLINE_CASE_DETAILS[cleanId];
    const idx = AppState.cases.findIndex(c => c.caseId && c.caseId.trim() === cleanId);
    if (idx !== -1) {
      AppState.cases[idx] = Object.assign({}, AppState.cases[idx], det);
      return AppState.cases[idx];
    }
    return Object.assign({ caseId: cleanId }, det);
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
        showToast('⚠️ ไม่สามารถดึงข้อมูลล่าสุดจาก Google Docs ได้ หรือโครงสร้างไม่ถูกต้อง', 'warning');
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
  
  showApiStatusBanner(true, '🔄 กำลังดึงข้อมูลล่าสุดจาก Google Sheets และ Docs...');
  
  // ล้างแคชใน LocalStorage และลบข้อมูลแคช DB เพื่อบังคับให้ดึงใหม่ทั้งหมด
  localStorage.removeItem('ospe_cached_case_list');
  localStorage.removeItem('ospe_db_version');
  
  try {
    // บังคับดาวน์โหลดข้อมูลทั้งหมดใหม่แบบล้างแคช
    await loadOfflineDetailsWithProgress();
    await loadCasesData();
    showApiStatusBanner(true, '✅ ซิงก์ข้อมูลล่าสุดสำเร็จแล้ว!');
    
    // รีโหลดหน้าจอเพื่อแสดงผลกรณีอยู่ในหน้าดูเคส
    if (window.location.pathname.includes('case-viewer.html')) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (err) {
    console.error('Force sync failed:', err);
    showApiStatusBanner(false, '⚠️ ไม่สามารถซิงก์ได้ชั่วคราว (ใช้ข้อมูลเดิมในเครื่อง)');
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
const DB_VERSION_STR = 'v1.3.3'; // อัปเดตเวอร์ชันนี้เพื่อบังคับโหลดใหม่เมื่อมีเคสเพิ่มเติมในสคริปต์ออฟไลน์

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
  const url = 'case-details-offline.js';
  
  try {
    const db = await openIndexedDB();
    const cachedVersion = localStorage.getItem('ospe_db_version');
    
    // A. หากเคยโหลดและบันทึกลง IndexedDB เวอร์ชันล่าสุดตรงกันแล้ว ให้ดึงมาใช้ได้เลย (0ms)
    if (cachedVersion === DB_VERSION_STR) {
      console.log('[Database Preloader] Database matches DB_VERSION_STR in IndexedDB.');
      const allDetails = await getCasesFromDB(db);
      if (allDetails && Object.keys(allDetails).length > 0) {
        window.OFFLINE_CASE_DETAILS = allDetails;
        console.log('[Database Preloader] All cases retrieved instantly from IndexedDB cache (0ms).');
        mergeOfflineDetails();
        return;
      }
    }
    
    // B. หากเป็นครั้งแรก หรือมีการเปลี่ยนเวอร์ชัน ให้โหลดข้อมูลใหม่พร้อม Progress Bar
    let showOverlayTimeout = setTimeout(() => {
      injectSplashOverlay();
    }, 100); // ป้องกันภาพกระพริบหากโหลดเสร็จเร็วมาก
    
    const response = await fetch(url + '?v=' + DB_VERSION_STR);
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
    <div class="print-modal-card" style="max-width: 1040px;">
      <div class="print-modal-header">
        <h3 style="margin: 0; font-family: var(--font-title); font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;">
          🖨️ เครื่องมือสั่งพิมพ์หลายเคสพร้อมกัน (Batch Print Tools)
        </h3>
        <button class="btn btn-secondary" onclick="closeBatchPrintModal()" style="padding: 4px 10px; font-size: 0.85rem;">✕ ปิด</button>
      </div>

      <div class="print-modal-body">
        <div class="print-options-grid">
          <!-- 1. Selection & Filter -->
          <div class="print-option-group" style="grid-column: span 2;">
            <div class="print-option-title" style="justify-content: space-between;">
              <span>📦 1. เลือกเคสข้อสอบที่ต้องการพิมพ์</span>
              <span id="batch-selected-count-badge" style="font-size: 0.82rem; font-weight: 700; background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px;">เลือกแล้ว 0 เคส</span>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-bottom: 0.85rem; flex-wrap: wrap;">
              <input type="text" id="batch-search-input" class="form-control" placeholder="🔍 ค้นหาชื่อเคส, ตัวยา, โรค..." style="flex: 2; min-width: 200px; padding: 0.45rem 0.75rem; font-size: 0.88rem;" oninput="renderBatchCaseSelectionList()">
              <select id="batch-cat-select" class="form-control" style="flex: 1; min-width: 130px; padding: 0.45rem 0.75rem; font-size: 0.88rem;" onchange="renderBatchCaseSelectionList()">
                <option value="All">ทุกหมวด (All Category)</option>
                <option value="Clinic">Clinic (คลินิก)</option>
                <option value="Product">Product (ผลิต)</option>
                <option value="SAP">SAP (สังคมฯ)</option>
              </select>
              <button class="btn btn-secondary" onclick="selectAllBatchCases(true)" style="padding: 4px 10px; font-size: 0.82rem;">☑️ เลือกทั้งหมด</button>
              <button class="btn btn-secondary" onclick="selectAllBatchCases(false)" style="padding: 4px 10px; font-size: 0.82rem;">☐ ล้างทั้งหมด</button>
            </div>

            <!-- Scrollable Case Checkbox Rail -->
            <div id="batch-case-checkbox-list" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.5rem; background: var(--bg-primary); display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.4rem;">
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

            <div style="margin-top: 0.75rem; border-top: 1px dashed var(--border); padding-top: 0.5rem;">
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

function renderBatchCaseSelectionList() {
  const container = document.getElementById('batch-case-checkbox-list');
  if (!container) return;

  const search = (document.getElementById('batch-search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('batch-cat-select')?.value || 'All';

  let allCases = AppState.cases || [];
  if (allCases.length === 0 && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
    allCases = Object.keys(OFFLINE_CASE_DETAILS).map(cid => {
      const details = OFFLINE_CASE_DETAILS[cid] || {};
      return Object.assign({ caseId: cid, title: details.title || cid, category: details.category || 'CLINIC' }, details);
    });
  }

  const filtered = allCases.filter(c => {
    const matchCat = cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase();
    const matchSearch = !search || 
      (c.caseId || '').toLowerCase().includes(search) || 
      (c.title || '').toLowerCase().includes(search) || 
      (c.disease || '').toLowerCase().includes(search);
    return matchCat && matchSearch;
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
  let allCases = AppState.cases || [];

  if (allCases.length === 0 && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
    allCases = Object.keys(OFFLINE_CASE_DETAILS).map(cid => {
      const details = OFFLINE_CASE_DETAILS[cid] || {};
      return Object.assign({ caseId: cid, title: details.title || cid, category: details.category || 'CLINIC' }, details);
    });
  }

  allCases.forEach(c => {
    const matchCat = cat === 'All' || (c.category || '').toLowerCase() === cat.toLowerCase();
    const matchSearch = !search || 
      (c.caseId || '').toLowerCase().includes(search) || 
      (c.title || '').toLowerCase().includes(search) || 
      (c.disease || '').toLowerCase().includes(search);
    if (matchCat && matchSearch) {
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

function executeBatchPrint() {
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

  setTimeout(() => {
    let printArea = document.getElementById('batch-print-execution-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'batch-print-execution-area';
      printArea.className = 'print-only-block';
      document.body.appendChild(printArea);
    }
    printArea.innerHTML = '';

    const offlineMap = (typeof OFFLINE_CASE_DETAILS !== 'undefined') ? OFFLINE_CASE_DETAILS : {};
    const caseList = Array.from(selectedBatchCaseIds).map(cid => {
      const base = (AppState.cases || []).find(x => x.caseId === cid) || { caseId: cid };
      const details = offlineMap[cid] || offlineMap[cid.toUpperCase()] || offlineMap[cid.toLowerCase()] || {};
      return Object.assign({}, base, details);
    });

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
        html += `<div style="margin-bottom:1.25rem;">
          <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #3b82f6; padding-left:0.5rem;">📌 สถานการณ์ (Scenario)</h3>
          <div style="font-size:0.95rem; line-height:1.5;">${c.scenario || '<p>ไม่มีข้อมูลสถานการณ์</p>'}</div>
        </div>`;

        if (c.patientInfoHtml) {
          html += `<div style="margin-bottom:1.25rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #06b6d4; padding-left:0.5rem;">👤 ข้อมูลผู้ป่วย (Patient Info)</h3>
            <div style="font-size:0.95rem; line-height:1.5;">${c.patientInfoHtml}</div>
          </div>`;
        }

        if (c.equipmentHtml && c.equipmentHtml.trim() !== '') {
          html += `<div style="margin-bottom:1.25rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #8b5cf6; padding-left:0.5rem;">📦 สิ่งที่มีให้ในสถานี</h3>
            <div style="font-size:0.95rem; line-height:1.5;">${c.equipmentHtml}</div>
          </div>`;
        }
      }

      if (mode === 'full' || mode === 'checklist') {
        if (mode === 'full') {
          html += `<div class="print-page-break-before" style="page-break-before: always; margin-top: 1rem;"></div>`;
        }

        if (c.checklist && c.checklist.length > 0) {
          let chkTable = `<table class="print-checklist-table" style="width:100%; border-collapse:collapse; margin-top:0.5rem;">
            <thead>
              <tr>
                <th style="width:75%; border:1px solid #475569; padding:0.4rem;">รายละเอียดการปฏิบัติงาน / เกณฑ์ประเมิน</th>
                <th style="width:12.5%; border:1px solid #475569; padding:0.4rem; text-align:center;">คะแนน</th>
                <th style="width:12.5%; border:1px solid #475569; padding:0.4rem; text-align:center;">ผลประเมิน</th>
              </tr>
            </thead>
            <tbody>`;

          const groups = {};
          c.checklist.forEach(item => {
            const g = item.group || 'ทั่วไป';
            if (!groups[g]) groups[g] = [];
            groups[g].push(item);
          });

          Object.keys(groups).forEach(gName => {
            chkTable += `<tr style="background:#f1f5f9; font-weight:700;"><td colspan="3" style="border:1px solid #475569; padding:0.4rem;">📁 หมวดประเมิน: ${escapeHtml(gName)}</td></tr>`;
            groups[gName].forEach(item => {
              chkTable += `<tr>
                <td style="border:1px solid #475569; padding:0.4rem;">${item.textHtml || escapeHtml(item.text)}${item.imageHtml ? `<div style="margin-top:0.25rem;">${item.imageHtml}</div>` : ''}</td>
                <td style="border:1px solid #475569; padding:0.4rem; text-align:center; font-weight:bold;">${item.score}</td>
                <td style="border:1px solid #475569; padding:0.4rem; text-align:center;">[ &nbsp; ]</td>
              </tr>`;
            });
          });
          chkTable += `</tbody></table>`;

          html += `<div style="margin-top:1.25rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #10b981; padding-left:0.5rem;">📋 รายการทักษะประเมิน (Checklist)</h3>
            ${chkTable}
          </div>`;
        }

        if (c.noteHtml && c.noteHtml.trim() !== '') {
          html += `<div style="margin-top:1.25rem; border-top:1px dashed #cbd5e1; padding-top:0.75rem;">
            <h3 style="margin:0 0 0.4rem 0; font-size:1.1rem; font-family:var(--font-title); border-left:4px solid #f59e0b; padding-left:0.5rem;">🔑 เฉลย / ข้อมูลผู้ตรวจ (Examiner Notes)</h3>
            <div style="font-size:0.9rem; line-height:1.5;">${c.noteHtml}</div>
          </div>`;
        }
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

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-mode-question', 'print-mode-checklist', 'print-orientation-portrait', 'print-orientation-landscape', 'print-scale-80', 'print-scale-100', 'print-scale-120', 'print-scale-140', 'print-scale-160');
        if (printArea) printArea.innerHTML = '';
      }, 500);
    }, 200);
  }, 100);
}


