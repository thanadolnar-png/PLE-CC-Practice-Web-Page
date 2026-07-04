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
    difficulty: 'All',
    search: ''
  },
  checklistProgress: {} // { caseId: [checked_id1, checked_id2] }
};

// ──────────────────────────────────────────────────────────────
// 1. Initializer & Event Listeners
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
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
  showGlobalLoader(true);
  
  // 1. ลองดึงข้อมูลผ่าน API
  if (currentApiUrl) {
    try {
      const cacheBuster = new Date().getTime();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout
      
      const response = await fetch(`${currentApiUrl}?action=getCaseList&_cb=${cacheBuster}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.cases) {
        let fetchedCases = result.data.cases;
        if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
          fetchedCases = fetchedCases.map(apiCase => {
            const offlineMatch = OFFLINE_DATA.cases.find(o => o.caseId === apiCase.caseId);
            return offlineMatch ? Object.assign({}, offlineMatch, apiCase) : apiCase;
          });
        }
        AppState.cases = fetchedCases;
        showApiStatusBanner(true, 'API Connected');
        onCasesLoaded();
        return;
      }
    } catch (e) {
      console.warn('ไม่สามารถเชื่อมต่อ API ได้, สลับไปใช้งานโหมด Offline:', e);
      showApiStatusBanner(false, 'API Connection Failed — Using Offline Data');
    }
  } else {
    showApiStatusBanner(false, 'No API Configured — Using Offline Data');
  }
  
  // 2. Fallback ใช้ข้อมูล Offline
  if (typeof OFFLINE_DATA !== 'undefined' && OFFLINE_DATA.cases) {
    AppState.cases = OFFLINE_DATA.cases;
  } else {
    AppState.cases = [];
  }
  
  onCasesLoaded();
}

function onCasesLoaded() {
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
  let list = [...AppState.cases];
  const { category, mainGroup, difficulty, search } = AppState.activeFilters;
  
  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }
  
  if (mainGroup && mainGroup !== 'All') {
    list = list.filter(c => c.mainGroup === mainGroup);
  }
  
  if (difficulty && difficulty !== 'All') {
    list = list.filter(c => String(c.difficulty) === String(difficulty));
  }
  
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.caseId.toLowerCase().includes(q) ||
      (c.disease && c.disease.toLowerCase().includes(q))
    );
  }
  
  AppState.filteredCases = list;
}

function renderFilterSelectOptions() {
  const selectGroup = document.getElementById('filter-course-group');
  if (!selectGroup) return;
  
  // ดึงกลุ่มวิชาที่ไม่ซ้ำกัน
  const groups = new Set();
  AppState.cases.forEach(c => {
    if (c.mainGroup) groups.add(c.mainGroup);
  });
  
  // เคลียร์ยกเว้นอันแรก
  selectGroup.innerHTML = '<option value="All">ทุก OSPE Main Group</option>';
  
  groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    selectGroup.appendChild(opt);
  });
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
    
    // สร้างดาวระดับความยาก
    let stars = '';
    const diff = parseInt(c.difficulty) || 1;
    for (let i = 0; i < 3; i++) {
      stars += i < diff ? '★' : '☆';
    }
    
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
        <span class="difficulty-stars">${stars}</span>
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
    const selectDiff = document.getElementById('filter-difficulty');
    
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
        applyFilters();
        renderCaseList();
      });
    }
    
    if (selectGroup) {
      selectGroup.addEventListener('change', (e) => {
        AppState.activeFilters.mainGroup = e.target.value;
        applyFilters();
        renderCaseList();
      });
    }
    
    if (selectDiff) {
      selectDiff.addEventListener('change', (e) => {
        AppState.activeFilters.difficulty = e.target.value;
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
