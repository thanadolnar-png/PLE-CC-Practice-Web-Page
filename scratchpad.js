/**
 * PLE-CC OSPE Practice System — Digital Scratchpad & Multi-Label Prescription Canvas
 * File: scratchpad.js
 * =================================================================
 * High-performance, offline-first digital scratchpad for OSPE candidates.
 * Supports:
 * - Freehand drawing with stylus/touch/mouse (Black, Red, Green, Blue, Pen sizes)
 * - Text typing notepad with auto-save
 * - RxCU Drug Label Canvas with Multi-Sheet support (ฉลากยา 1, ฉลากยา 2, ...)
 * - One-click submit to Station Chat for Examiner Grading & Review
 * - Per-station state memory (station notes & labels persist across station switches)
 * - Dynamic Resizing: Drag any border or corner to resize dynamically
 * - Dynamic Drag & Drop: Drag header to move scratchpad anywhere on screen
 * - Mobile pull-to-resize dynamic bottom sheet
 * - Visual corner grips and double-click to minimize/restore
 * - LocalStorage layout memory (restores user preferred size & position)
 * - High-DPI canvas buffer scaling preserving handwriting without distortion
 */

(function (window) {
  'use strict';

  const COLORS = {
    black: '#1E293B',
    red: '#DC2626',
    green: '#16A34A',
    blue: '#2563EB'
  };

  const PEN_SIZES = {
    small: 2,
    medium: 4,
    large: 8
  };

  const LAYOUT_STORAGE_KEY = 'ple_ospe_scratchpad_layout_v2';
  const DRUG_LABEL_IMG_SRC = 'rxcu-drug-label-template.png';

  const Scratchpad = {
    initialized: false,
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    activeTab: 'draw', // 'draw' | 'type' | 'label'
    currentColor: COLORS.black,
    currentSize: PEN_SIZES.medium,
    isEraser: false,
    currentStationKey: 'default',

    // Preloaded Drug Label Image template
    labelTemplateImg: null,
    isLabelImgLoaded: false,

    // Multi-Label tracking for active station
    activeLabelIndex: 0,
    
    // Per-station storage: 
    // { [stationKey]: { 
    //     canvasData: string, 
    //     text: string, 
    //     labels: [ { id: 1, name: 'ฉลากยา 1', canvasData: string, undoStack: [] } ], 
    //     activeLabelIndex: 0,
    //     undoStack: [] 
    // } }
    storage: {},

    // DOM references
    dom: {
      fabBtn: null,
      panel: null,
      canvas: null,
      ctx: null,
      textarea: null,
      stationTitle: null,
      undoBtn: null,
      tabDrawBtn: null,
      tabTypeBtn: null,
      tabLabelBtn: null,
      labelSubNav: null,
      labelTabsWrap: null,
      btnSendLabelChat: null,
      colorPickers: [],
      sizePickers: []
    },

    // Drawing state
    drawing: false,
    lastX: 0,
    lastY: 0,
    undoStack: [],
    maxUndo: 20,

    /**
     * Initialize scratchpad DOM and event listeners
     */
    init: function () {
      if (this.initialized) return;

      this.preloadLabelTemplate();
      this.createDOM();
      this.bindEvents();
      this.initialized = true;

      // Check if there was an active station requested earlier
      if (this.currentStationKey) {
        this.loadStationData(this.currentStationKey);
      }
    },

    /**
     * Preload RxCU Drug Label Template image into memory
     */
    preloadLabelTemplate: function () {
      if (this.labelTemplateImg) return;
      const img = new Image();
      img.onload = () => {
        this.isLabelImgLoaded = true;
        if (this.activeTab === 'label' && this.isOpen) {
          this.renderActiveLabel();
        }
      };
      img.onerror = () => {
        console.warn('Could not load RxCU drug label image template:', DRUG_LABEL_IMG_SRC);
      };
      img.src = DRUG_LABEL_IMG_SRC;
      this.labelTemplateImg = img;
    },

    /**
     * Create floating button and modal/drawer panel with dynamic resize handles
     */
    createDOM: function () {
      // 1. Floating Action Button (FAB)
      const fab = document.createElement('button');
      fab.id = 'scratchpad-fab-btn';
      fab.className = 'scratchpad-fab no-print';
      fab.setAttribute('title', 'กระดาษทด (Scratchpad)');
      fab.setAttribute('type', 'button');
      fab.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <span class="scratchpad-fab-text">กระดาษทด</span>
        <span id="scratchpad-badge" class="scratchpad-badge" style="display: none;">•</span>
      `;
      document.body.appendChild(fab);
      this.dom.fabBtn = fab;

      // 2. Scratchpad Panel Container
      const panel = document.createElement('div');
      panel.id = 'scratchpad-panel';
      panel.className = 'scratchpad-panel no-print';
      panel.style.display = 'none';

      panel.innerHTML = `
        <!-- Mobile Pull Handle -->
        <div class="sp-mobile-drag-handle" id="sp-mobile-handle" title="รูดขึ้น-ลงเพื่อปรับขนาด">
          <span></span>
        </div>

        <!-- 8 Dynamic Resizer Handles for Desktop / Tablet -->
        <div class="sp-resizer sp-resizer-t" data-direction="t"></div>
        <div class="sp-resizer sp-resizer-b" data-direction="b"></div>
        <div class="sp-resizer sp-resizer-l" data-direction="l"></div>
        <div class="sp-resizer sp-resizer-r" data-direction="r"></div>
        <div class="sp-resizer sp-resizer-tl" data-direction="tl" title="คลิกลากเพื่อย่อ-ขยายขนาด (Resize)">
          <div class="sp-corner-grip tl"></div>
        </div>
        <div class="sp-resizer sp-resizer-tr" data-direction="tr"></div>
        <div class="sp-resizer sp-resizer-bl" data-direction="bl"></div>
        <div class="sp-resizer sp-resizer-br" data-direction="br" title="คลิกลากเพื่อย่อ-ขยายขนาด (Resize)">
          <div class="sp-corner-grip br"></div>
        </div>

        <!-- Panel Header (Draggable) -->
        <div class="sp-header" id="sp-header" title="คลิกลากเพื่อย้ายหน้าต่าง | ดับเบิ้ลคลิกเพื่อย่อ/ขยาย">
          <div class="sp-header-left">
            <span class="sp-drag-indicator" title="แถบจับย้ายตำแหน่ง">⋮⋮</span>
            <span class="sp-title" id="sp-station-title">กระดาษทด</span>
          </div>

          <!-- Mode Tabs -->
          <div class="sp-tabs">
            <button type="button" class="sp-tab-btn active" id="sp-tab-draw" data-tab="draw">
              วาดเขียน
            </button>
            <button type="button" class="sp-tab-btn" id="sp-tab-type" data-tab="type">
              พิมพ์โน้ต
            </button>
            <button type="button" class="sp-tab-btn sp-tab-label-btn" id="sp-tab-label" data-tab="label" title="เขียนฉลากยาโรงพยาบาล RxCU">
              🏷️ ฉลากยา
            </button>
          </div>

          <!-- Window Controls -->
          <div class="sp-window-actions">
            <button type="button" class="sp-win-btn" id="sp-btn-reset-layout" title="คืนค่าขนาดและตำแหน่งเริ่มต้น (Reset Layout)" aria-label="รีเซ็ต">
              <span>↺</span>
            </button>
            <button type="button" class="sp-win-btn" id="sp-btn-minimize" title="ย่อหน้าต่าง (ดับเบิ้ลคลิกแถบหัวเรื่องได้)" aria-label="ย่อ">
              <span id="sp-minimize-icon">➖</span>
            </button>
            <button type="button" class="sp-win-btn" id="sp-btn-maximize" title="ขยายเต็มจอ" aria-label="ขยาย">
              <span id="sp-maximize-icon">⛶</span>
            </button>
            <button type="button" class="sp-win-btn sp-win-close" id="sp-btn-close" title="ปิดกระดาษทด" aria-label="ปิด">
              ✕
            </button>
          </div>
        </div>

        <!-- Multi-Label Secondary Subbar (Visible only on 'label' tab) -->
        <div class="sp-label-subbar" id="sp-label-subbar" style="display: none;">
          <div class="sp-label-tabs" id="sp-label-tabs-list">
            <!-- Dynamic Label Tabs inserted here -->
          </div>
          <div class="sp-label-actions">
            <button type="button" class="sp-label-add-btn" id="sp-btn-add-label" title="เพิ่มฉลากยาใบใหม่">
              ＋ เพิ่มฉลาก
            </button>
            <button type="button" class="sp-label-send-btn" id="sp-btn-send-label-chat" title="แปลงและส่งภาพฉลากยานี้เข้าแชทสถานีสอบทันที">
              📤 ส่งเข้าแชทสถานี
            </button>
          </div>
        </div>

        <!-- Panel Body -->
        <div class="sp-body">
          
          <!-- DRAW / LABEL VIEW -->
          <div class="sp-view sp-view-draw active" id="sp-draw-view">
            <!-- Drawing Toolbar -->
            <div class="sp-toolbar">
              <!-- Colors -->
              <div class="sp-tool-group sp-colors-group" title="เลือกสีปากกา">
                <button type="button" class="sp-color-btn active" data-color="${COLORS.black}" style="background-color: ${COLORS.black};" title="สีดำ"></button>
                <button type="button" class="sp-color-btn" data-color="${COLORS.red}" style="background-color: ${COLORS.red};" title="สีแดง"></button>
                <button type="button" class="sp-color-btn" data-color="${COLORS.green}" style="background-color: ${COLORS.green};" title="สีเขียว"></button>
                <button type="button" class="sp-color-btn" data-color="${COLORS.blue}" style="background-color: ${COLORS.blue};" title="สีน้ำเงิน"></button>
              </div>

              <!-- Sizes -->
              <div class="sp-tool-group sp-sizes-group" title="ขนาดหัวปากกา">
                <button type="button" class="sp-size-btn" data-size="${PEN_SIZES.small}" title="หัวเล็ก (2px)">
                  <span class="sp-dot" style="width: 4px; height: 4px;"></span>
                  <span>เล็ก</span>
                </button>
                <button type="button" class="sp-size-btn active" data-size="${PEN_SIZES.medium}" title="หัวกลาง (4px)">
                  <span class="sp-dot" style="width: 7px; height: 7px;"></span>
                  <span>กลาง</span>
                </button>
                <button type="button" class="sp-size-btn" data-size="${PEN_SIZES.large}" title="หัวหนา (8px)">
                  <span class="sp-dot" style="width: 10px; height: 10px;"></span>
                  <span>หนา</span>
                </button>
              </div>

              <!-- Tools: Eraser, Undo, Clear -->
              <div class="sp-tool-group sp-actions-group">
                <button type="button" class="sp-action-btn" id="sp-tool-eraser" title="ยางลบ">
                  🧹 ยางลบ
                </button>
                <button type="button" class="sp-action-btn" id="sp-tool-undo" title="ย้อนกลับ (Undo)">
                  ↩️ ย้อน
                </button>
                <button type="button" class="sp-action-btn sp-action-danger" id="sp-tool-clear" title="ล้างกระดาน/ฉลากปัจจุบัน">
                  🗑️ ล้าง
                </button>
              </div>
            </div>

            <!-- Canvas Wrapper -->
            <div class="sp-canvas-wrapper" id="sp-canvas-wrapper">
              <canvas id="sp-canvas" class="sp-canvas"></canvas>
            </div>
          </div>

          <!-- TYPE VIEW -->
          <div class="sp-view sp-view-type" id="sp-type-view" style="display: none;">
            <div class="sp-type-toolbar">
              <span class="sp-type-hint">💡 พิมพ์บันทึกย่อ ขนาดยา คำถามซักประวัติ หรือลิสต์ DTPs</span>
              <button type="button" class="sp-action-btn sp-action-danger" id="sp-type-clear" title="ล้างข้อความ">
                🗑️ ล้างข้อความ
              </button>
            </div>
            <textarea
              id="sp-textarea"
              class="sp-textarea"
              placeholder="พิมพ์ทดเลขหรือจดข้อมูลสถานีนี้ได้ที่นี่... (บันทึกอัตโนมัติ)"
              spellcheck="false"
            ></textarea>
            <div class="sp-type-footer">
              <span id="sp-char-count">0 ตัวอักษร</span>
              <span class="sp-station-tag" id="sp-station-tag">สถานีปัจจุบัน</span>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(panel);

      // Cache DOM elements
      this.dom.panel = panel;
      this.dom.canvas = panel.querySelector('#sp-canvas');
      this.dom.ctx = this.dom.canvas.getContext('2d', { willReadFrequently: true });
      this.dom.textarea = panel.querySelector('#sp-textarea');
      this.dom.stationTitle = panel.querySelector('#sp-station-title');
      this.dom.tabDrawBtn = panel.querySelector('#sp-tab-draw');
      this.dom.tabTypeBtn = panel.querySelector('#sp-tab-type');
      this.dom.tabLabelBtn = panel.querySelector('#sp-tab-label');
      this.dom.labelSubNav = panel.querySelector('#sp-label-subbar');
      this.dom.labelTabsWrap = panel.querySelector('#sp-label-tabs-list');
      this.dom.btnSendLabelChat = panel.querySelector('#sp-btn-send-label-chat');
      this.dom.undoBtn = panel.querySelector('#sp-tool-undo');
    },

    /**
     * Bind all interactive events
     */
    bindEvents: function () {
      const self = this;

      // FAB Toggle
      if (this.dom.fabBtn) {
        this.dom.fabBtn.addEventListener('click', () => self.toggle());
      }

      // Window controls
      const closeBtn = this.dom.panel.querySelector('#sp-btn-close');
      if (closeBtn) closeBtn.addEventListener('click', () => self.close());

      const minBtn = this.dom.panel.querySelector('#sp-btn-minimize');
      if (minBtn) minBtn.addEventListener('click', () => self.toggleMinimize());

      const maxBtn = this.dom.panel.querySelector('#sp-btn-maximize');
      if (maxBtn) maxBtn.addEventListener('click', () => self.toggleMaximize());

      const resetBtn = this.dom.panel.querySelector('#sp-btn-reset-layout');
      if (resetBtn) resetBtn.addEventListener('click', () => self.resetLayout());

      // Main Tabs
      this.dom.tabDrawBtn.addEventListener('click', () => self.switchTab('draw'));
      this.dom.tabTypeBtn.addEventListener('click', () => self.switchTab('type'));
      if (this.dom.tabLabelBtn) {
        this.dom.tabLabelBtn.addEventListener('click', () => self.switchTab('label'));
      }

      // Multi-Label Subbar Buttons
      const btnAddLabel = this.dom.panel.querySelector('#sp-btn-add-label');
      if (btnAddLabel) {
        btnAddLabel.addEventListener('click', () => self.addNewLabel());
      }
      if (this.dom.btnSendLabelChat) {
        this.dom.btnSendLabelChat.addEventListener('click', () => self.sendCurrentLabelToChat());
      }

      // Color pickers
      const colorBtns = this.dom.panel.querySelectorAll('.sp-color-btn');
      colorBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          colorBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          self.currentColor = this.getAttribute('data-color');
          self.isEraser = false;
          const eraserBtn = self.dom.panel.querySelector('#sp-tool-eraser');
          if (eraserBtn) eraserBtn.classList.remove('active');
        });
      });

      // Pen size pickers
      const sizeBtns = this.dom.panel.querySelectorAll('.sp-size-btn');
      sizeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          sizeBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          self.currentSize = parseInt(this.getAttribute('data-size'), 10) || 4;
        });
      });

      // Eraser tool
      const eraserBtn = this.dom.panel.querySelector('#sp-tool-eraser');
      if (eraserBtn) {
        eraserBtn.addEventListener('click', function () {
          self.isEraser = !self.isEraser;
          this.classList.toggle('active', self.isEraser);
          if (self.isEraser) {
            colorBtns.forEach(b => b.classList.remove('active'));
          } else {
            // Restore active color button
            const activeColorBtn = self.dom.panel.querySelector(`.sp-color-btn[data-color="${self.currentColor}"]`);
            if (activeColorBtn) activeColorBtn.classList.add('active');
          }
        });
      }

      // Undo tool
      if (this.dom.undoBtn) {
        this.dom.undoBtn.addEventListener('click', () => self.undo());
      }

      // Clear Canvas
      const clearBtn = this.dom.panel.querySelector('#sp-tool-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          const isLabel = self.activeTab === 'label';
          const msg = isLabel 
            ? 'คุณต้องการล้างสิ่งที่เขียนบนฉลากยานี้ใช่หรือไม่?'
            : 'คุณต้องการล้างกระดานวาดของสถานีนี้ใช่หรือไม่?';
          if (confirm(msg)) {
            self.clearCanvas();
            self.saveCurrentStation();
          }
        });
      }

      // Clear Text
      const clearTextBtn = this.dom.panel.querySelector('#sp-type-clear');
      if (clearTextBtn) {
        clearTextBtn.addEventListener('click', function () {
          if (confirm('คุณต้องการล้างข้อความที่พิมพ์ของสถานีนี้ใช่หรือไม่?')) {
            self.dom.textarea.value = '';
            self.updateCharCount();
            self.saveCurrentStation();
          }
        });
      }

      // Textarea Auto-save & counter
      if (this.dom.textarea) {
        this.dom.textarea.addEventListener('input', () => {
          self.updateCharCount();
          self.saveCurrentStation();
        });
      }

      // Canvas Pointer Events (Touch, Stylus, Mouse unified)
      this.setupCanvasEvents();

      // Dynamic Resizers, Window Dragging, and Mobile Pull-Handle
      this.setupHeaderDrag();
      this.setupResizers();
      this.setupMobileDrag();

      // Window resize observer to adapt canvas resolution
      window.addEventListener('resize', () => {
        if (self.isOpen && !self.isMinimized) {
          self.resizeCanvas(true);
        }
      });
    },

    /**
     * Setup Header Drag-to-Move floating window
     */
    setupHeaderDrag: function () {
      const self = this;
      const header = this.dom.panel.querySelector('#sp-header');
      const panel = this.dom.panel;
      if (!header || !panel) return;

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      header.addEventListener('pointerdown', function (e) {
        // Ignore if clicking on interactive children (buttons, tabs, inputs)
        if (e.target.closest('button, input, textarea, .sp-tabs, .sp-win-btn, .sp-tab-btn')) {
          return;
        }
        if (self.isMaximized) return;
        if (window.innerWidth <= 768) return; // on mobile, use bottom sheet

        e.preventDefault();
        try { header.setPointerCapture(e.pointerId); } catch (_) {}

        isDragging = true;
        panel.classList.add('dragging');

        // Normalize positioning from bottom/right to left/top/width/height
        const rect = panel.getBoundingClientRect();
        panel.style.bottom = 'auto';
        panel.style.right = 'auto';
        panel.style.left = rect.left + 'px';
        panel.style.top = rect.top + 'px';
        panel.style.width = rect.width + 'px';
        panel.style.height = rect.height + 'px';

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
      });

      header.addEventListener('pointermove', function (e) {
        if (!isDragging) return;
        e.preventDefault();

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const maxLeft = Math.max(10, window.innerWidth - panel.offsetWidth - 8);
        const maxTop = Math.max(10, window.innerHeight - 48);

        const newLeft = Math.max(8, Math.min(maxLeft, startLeft + dx));
        const newTop = Math.max(8, Math.min(maxTop, startTop + dy));

        panel.style.left = Math.round(newLeft) + 'px';
        panel.style.top = Math.round(newTop) + 'px';
      });

      const stopDrag = function (e) {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove('dragging');
        try { header.releasePointerCapture(e.pointerId); } catch (_) {}
        self.saveCustomLayout();
      };

      header.addEventListener('pointerup', stopDrag);
      header.addEventListener('pointercancel', stopDrag);

      // Double-click header to quickly toggle minimize/restore
      header.addEventListener('dblclick', function (e) {
        if (e.target.closest('button, input, textarea, .sp-tabs, .sp-win-btn, .sp-tab-btn')) return;
        self.toggleMinimize();
      });
    },

    /**
     * Setup 8-Direction Dynamic Resizer Handles
     */
    setupResizers: function () {
      const self = this;
      const panel = this.dom.panel;
      const resizers = panel.querySelectorAll('.sp-resizer');
      if (!resizers || !panel) return;

      let isResizing = false;
      let activeDir = null;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;
      let startWidth = 0;
      let startHeight = 0;

      resizers.forEach(resizer => {
        resizer.addEventListener('pointerdown', function (e) {
          if (self.isMaximized || self.isMinimized) return;
          if (window.innerWidth <= 768) return;

          e.preventDefault();
          e.stopPropagation();
          try { resizer.setPointerCapture(e.pointerId); } catch (_) {}

          isResizing = true;
          activeDir = this.getAttribute('data-direction');
          panel.classList.add('resizing');

          // Normalize positioning to left/top/width/height
          const rect = panel.getBoundingClientRect();
          panel.style.bottom = 'auto';
          panel.style.right = 'auto';
          panel.style.left = rect.left + 'px';
          panel.style.top = rect.top + 'px';
          panel.style.width = rect.width + 'px';
          panel.style.height = rect.height + 'px';

          startX = e.clientX;
          startY = e.clientY;
          startLeft = rect.left;
          startTop = rect.top;
          startWidth = rect.width;
          startHeight = rect.height;
        });

        resizer.addEventListener('pointermove', function (e) {
          if (!isResizing || !activeDir) return;
          e.preventDefault();

          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          const minW = 320;
          const minH = 240;
          const maxW = window.innerWidth - 20;
          const maxH = window.innerHeight - 20;

          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;

          // Horizontal resize
          if (activeDir.includes('r')) {
            newWidth = Math.max(minW, Math.min(maxW - startLeft, startWidth + dx));
          } else if (activeDir.includes('l')) {
            const proposedW = startWidth - dx;
            if (proposedW >= minW && startLeft + dx >= 8) {
              newWidth = proposedW;
              newLeft = startLeft + dx;
            } else if (proposedW < minW) {
              newWidth = minW;
              newLeft = startLeft + (startWidth - minW);
            }
          }

          // Vertical resize
          if (activeDir.includes('b')) {
            newHeight = Math.max(minH, Math.min(maxH - startTop, startHeight + dy));
          } else if (activeDir.includes('t')) {
            const proposedH = startHeight - dy;
            if (proposedH >= minH && startTop + dy >= 8) {
              newHeight = proposedH;
              newTop = startTop + dy;
            } else if (proposedH < minH) {
              newHeight = minH;
              newTop = startTop + (startHeight - minH);
            }
          }

          panel.style.width = Math.round(newWidth) + 'px';
          panel.style.height = Math.round(newHeight) + 'px';
          panel.style.left = Math.round(newLeft) + 'px';
          panel.style.top = Math.round(newTop) + 'px';
        });

        const stopResize = function (e) {
          if (!isResizing) return;
          isResizing = false;
          panel.classList.remove('resizing');
          try { resizer.releasePointerCapture(e.pointerId); } catch (_) {}

          // Finalize canvas dimensions without blurriness
          if (self.activeTab === 'draw' || self.activeTab === 'label') {
            self.resizeCanvas(true);
          }

          self.saveCustomLayout();
        };

        resizer.addEventListener('pointerup', stopResize);
        resizer.addEventListener('pointercancel', stopResize);
      });
    },

    /**
     * Setup Mobile Bottom Sheet Pull-to-Resize
     */
    setupMobileDrag: function () {
      const self = this;
      const handle = this.dom.panel.querySelector('#sp-mobile-handle');
      const panel = this.dom.panel;
      if (!handle || !panel) return;

      let isDraggingMobile = false;
      let startY = 0;
      let startHeight = 0;

      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        isDraggingMobile = true;
        panel.classList.add('resizing');
        startY = e.clientY;
        startHeight = panel.offsetHeight;
      });

      handle.addEventListener('pointermove', function (e) {
        if (!isDraggingMobile) return;
        e.preventDefault();
        const dy = e.clientY - startY;
        const minH = 160;
        const maxH = window.innerHeight * 0.94;
        const newH = Math.max(minH, Math.min(maxH, startHeight - dy));
        panel.style.height = Math.round(newH) + 'px';
      });

      const stopMobileDrag = function (e) {
        if (!isDraggingMobile) return;
        isDraggingMobile = false;
        panel.classList.remove('resizing');
        try { handle.releasePointerCapture(e.pointerId); } catch (_) {}

        const h = panel.offsetHeight;
        if (h < 180) {
          self.toggleMinimize();
        } else {
          if (self.activeTab === 'draw' || self.activeTab === 'label') {
            self.resizeCanvas(true);
          }
        }
      };

      handle.addEventListener('pointerup', stopMobileDrag);
      handle.addEventListener('pointercancel', stopMobileDrag);
    },

    /**
     * Setup Pointer Events on Canvas with Retina scaling & touch-action
     */
    setupCanvasEvents: function () {
      const self = this;
      const canvas = this.dom.canvas;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      };

      const startDrawing = (e) => {
        if (e.button !== undefined && e.button !== 0) return; // Only primary button
        e.preventDefault();
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}

        self.drawing = true;
        const pos = getPos(e);
        self.lastX = pos.x;
        self.lastY = pos.y;

        // Push current state to undo stack before starting new stroke
        self.pushUndoState();

        // Draw initial dot for tap
        self.drawStroke(pos.x, pos.y, pos.x, pos.y);
      };

      const draw = (e) => {
        if (!self.drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        self.drawStroke(self.lastX, self.lastY, pos.x, pos.y);
        self.lastX = pos.x;
        self.lastY = pos.y;
      };

      const stopDrawing = (e) => {
        if (!self.drawing) return;
        e.preventDefault();
        self.drawing = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        self.saveCurrentStation();
      };

      canvas.addEventListener('pointerdown', startDrawing, { passive: false });
      canvas.addEventListener('pointermove', draw, { passive: false });
      canvas.addEventListener('pointerup', stopDrawing, { passive: false });
      canvas.addEventListener('pointercancel', stopDrawing, { passive: false });
    },

    /**
     * Draw a line segment
     */
    drawStroke: function (x1, y1, x2, y2) {
      const ctx = this.dom.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (this.isEraser) {
        if (this.activeTab === 'label') {
          // On label, eraser draws white with slight opacity or white overlay
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = this.currentSize * 4;
        } else {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = this.currentSize * 4; // Wider stroke for eraser
        }
      } else {
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
      }

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    },

    /**
     * Push snapshot to undo stack
     */
    pushUndoState: function () {
      if (this.undoStack.length >= this.maxUndo) {
        this.undoStack.shift();
      }
      this.undoStack.push(this.dom.canvas.toDataURL());
    },

    /**
     * Undo last stroke
     */
    undo: function () {
      if (this.undoStack.length === 0) {
        this.clearCanvas();
        this.saveCurrentStation();
        return;
      }
      const prevData = this.undoStack.pop();
      const img = new Image();
      img.onload = () => {
        this.clearCanvas(false);
        const rect = this.dom.canvas.getBoundingClientRect();
        this.dom.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        this.saveCurrentStation();
      };
      img.src = prevData;
    },

    /**
     * Clear canvas
     */
    clearCanvas: function (resetUndo = true) {
      const canvas = this.dom.canvas;
      const ctx = this.dom.ctx;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // If in label mode, redraw background template image
      if (this.activeTab === 'label') {
        this.drawLabelTemplateBackground();
      }

      if (resetUndo) {
        this.undoStack = [];
      }
    },

    /**
     * Draw the RxCU Drug Label template background image into the canvas
     */
    drawLabelTemplateBackground: function () {
      if (!this.dom.canvas || !this.dom.ctx) return;
      const canvas = this.dom.canvas;
      const ctx = this.dom.ctx;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (this.labelTemplateImg && this.isLabelImgLoaded) {
        // Fit template into canvas preserving aspect ratio
        const imgW = this.labelTemplateImg.naturalWidth || 800;
        const imgH = this.labelTemplateImg.naturalHeight || 500;
        const scale = Math.min(w / imgW, h / imgH) * 0.96;
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const offsetX = (w - drawW) / 2;
        const offsetY = (h - drawH) / 2;

        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, 0, w, h);

        // Soft drop shadow around label sheet
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(this.labelTemplateImg, offsetX, offsetY, drawW, drawH);
        ctx.restore();
      } else {
        // Fallback placeholder while loading
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#64748B';
        ctx.font = '14px Bai Jamjuree, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('กำลังโหลดแม่แบบฉลากยา RxCU...', w / 2, h / 2);
      }
    },

    /**
     * Adjust canvas pixel buffer to match layout size with High-DPI support
     * Preserves handwriting without stretching/distortion.
     */
    resizeCanvas: function (preserveContent = true) {
      const canvas = this.dom.canvas;
      const wrapper = this.dom.panel.querySelector('#sp-canvas-wrapper');
      if (!canvas || !wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 200);

      // Save previous content & dimensions before resizing buffer
      let prevImg = null;
      let prevWidth = 0;
      let prevHeight = 0;
      if (preserveContent && canvas.width > 0 && canvas.height > 0) {
        prevImg = canvas.toDataURL();
        prevWidth = parseFloat(canvas.style.width) || (canvas.width / (window.devicePixelRatio || 1));
        prevHeight = parseFloat(canvas.style.height) || (canvas.height / (window.devicePixelRatio || 1));
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      this.dom.ctx.scale(dpr, dpr);

      // Fill background
      this.dom.ctx.fillStyle = '#FFFFFF';
      this.dom.ctx.fillRect(0, 0, width, height);

      // If in label mode, redraw background template
      if (this.activeTab === 'label') {
        this.drawLabelTemplateBackground();
      }

      // Restore image if preserved at 1:1 scale
      if (prevImg) {
        const img = new Image();
        img.onload = () => {
          this.dom.ctx.drawImage(img, 0, 0, prevWidth || width, prevHeight || height);
        };
        img.src = prevImg;
      }
    },

    /**
     * Switch view between 'draw', 'type', and 'label'
     */
    switchTab: function (tab) {
      // Save current state before switching
      this.saveCurrentStation();

      const prevTab = this.activeTab;
      this.activeTab = tab;

      const drawView = this.dom.panel.querySelector('#sp-draw-view');
      const typeView = this.dom.panel.querySelector('#sp-type-view');
      const labelSubbar = this.dom.labelSubNav;

      this.dom.tabDrawBtn.classList.toggle('active', tab === 'draw');
      this.dom.tabTypeBtn.classList.toggle('active', tab === 'type');
      if (this.dom.tabLabelBtn) {
        this.dom.tabLabelBtn.classList.toggle('active', tab === 'label');
      }

      if (tab === 'type') {
        if (labelSubbar) labelSubbar.style.display = 'none';
        drawView.style.display = 'none';
        typeView.style.display = 'flex';
        this.dom.textarea.focus();
      } else if (tab === 'label') {
        if (labelSubbar) labelSubbar.style.display = 'flex';
        typeView.style.display = 'none';
        drawView.style.display = 'flex';
        this.renderLabelSubbarTabs();
        this.renderActiveLabel();
      } else { // 'draw'
        if (labelSubbar) labelSubbar.style.display = 'none';
        typeView.style.display = 'none';
        drawView.style.display = 'flex';
        this.loadDrawingCanvas();
      }
    },

    /**
     * Ensure current station has label storage structure initialized
     */
    ensureStationData: function (stationKey) {
      const key = stationKey || this.currentStationKey;
      if (!this.storage[key]) {
        this.storage[key] = {
          canvasData: null,
          text: '',
          labels: [
            { id: 1, name: 'ฉลากยา 1', canvasData: null, undoStack: [] }
          ],
          activeLabelIndex: 0,
          undoStack: []
        };
      }
      if (!Array.isArray(this.storage[key].labels) || this.storage[key].labels.length === 0) {
        this.storage[key].labels = [
          { id: 1, name: 'ฉลากยา 1', canvasData: null, undoStack: [] }
        ];
        this.storage[key].activeLabelIndex = 0;
      }
      return this.storage[key];
    },

    /**
     * Render Multi-Label Tabs in Subbar
     */
    renderLabelSubbarTabs: function () {
      const wrap = this.dom.labelTabsWrap;
      if (!wrap) return;

      const stData = this.ensureStationData();
      wrap.innerHTML = '';

      stData.labels.forEach((lbl, idx) => {
        const tabBtn = document.createElement('div');
        tabBtn.className = `sp-label-tab ${idx === stData.activeLabelIndex ? 'active' : ''}`;
        tabBtn.innerHTML = `
          <span class="sp-lbl-title">${lbl.name || `ฉลากยา ${idx + 1}`}</span>
          ${stData.labels.length > 1 ? `<button type="button" class="sp-lbl-del" title="ลบฉลากนี้" data-del-idx="${idx}">✕</button>` : ''}
        `;

        tabBtn.addEventListener('click', (e) => {
          if (e.target.closest('.sp-lbl-del')) return;
          this.switchActiveLabel(idx);
        });

        const delBtn = tabBtn.querySelector('.sp-lbl-del');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteLabel(idx);
          });
        }

        wrap.appendChild(tabBtn);
      });
    },

    /**
     * Add a new drug label sheet to current station
     */
    addNewLabel: function () {
      const stData = this.ensureStationData();
      this.saveCurrentStation(); // Save active one

      const nextNum = stData.labels.length + 1;
      const newLabel = {
        id: Date.now(),
        name: `ฉลากยา ${nextNum}`,
        canvasData: null,
        undoStack: []
      };

      stData.labels.push(newLabel);
      this.switchActiveLabel(stData.labels.length - 1);
    },

    /**
     * Delete a drug label sheet
     */
    deleteLabel: function (idx) {
      const stData = this.ensureStationData();
      if (stData.labels.length <= 1) return;

      const lbl = stData.labels[idx];
      if (!confirm(`คุณต้องการลบ "${lbl.name || 'ฉลากยานี้'}" ใช่หรือไม่?`)) return;

      this.saveCurrentStation();
      stData.labels.splice(idx, 1);

      if (stData.activeLabelIndex >= stData.labels.length) {
        stData.activeLabelIndex = Math.max(0, stData.labels.length - 1);
      }

      this.renderLabelSubbarTabs();
      this.renderActiveLabel();
    },

    /**
     * Switch active label within Label Mode
     */
    switchActiveLabel: function (idx) {
      const stData = this.ensureStationData();
      if (idx < 0 || idx >= stData.labels.length) return;

      this.saveCurrentStation();
      stData.activeLabelIndex = idx;
      this.renderLabelSubbarTabs();
      this.renderActiveLabel();
    },

    /**
     * Render the active label sheet onto canvas
     */
    renderActiveLabel: function () {
      const stData = this.ensureStationData();
      const currentLbl = stData.labels[stData.activeLabelIndex];
      if (!currentLbl) return;

      this.undoStack = currentLbl.undoStack || [];
      this.resizeCanvas(false);
      this.clearCanvas(false);

      if (currentLbl.canvasData) {
        const img = new Image();
        img.onload = () => {
          const rect = this.dom.canvas.getBoundingClientRect();
          this.dom.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = currentLbl.canvasData;
      }
    },

    /**
     * Load normal drawing canvas
     */
    loadDrawingCanvas: function () {
      const stData = this.ensureStationData();
      this.undoStack = stData.undoStack || [];
      this.resizeCanvas(false);
      this.clearCanvas(false);

      if (stData.canvasData) {
        const img = new Image();
        img.onload = () => {
          const rect = this.dom.canvas.getBoundingClientRect();
          this.dom.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = stData.canvasData;
      }
    },

    /**
     * Export completed drug label and submit directly into Station Chat
     */
    sendCurrentLabelToChat: function () {
      if (!this.dom.canvas) return;
      this.saveCurrentStation();

      const stData = this.ensureStationData();
      const currentLbl = stData.labels[stData.activeLabelIndex] || { name: 'ฉลากยา RxCU' };
      const labelDataUrl = this.dom.canvas.toDataURL('image/png');

      // Check if StationChatController exists
      if (window.StationChatController && typeof window.StationChatController.sendDrugLabelMessage === 'function') {
        window.StationChatController.sendDrugLabelMessage({
          labelIndex: stData.activeLabelIndex + 1,
          labelName: currentLbl.name,
          imageData: labelDataUrl
        });
        
        // Show brief confirmation toast
        this.showToast(`✅ ส่ง "${currentLbl.name}" เข้าแชทสถานีสอบแล้ว!`);
      } else {
        // Fallback: alert
        alert(`บันทึกภาพ "${currentLbl.name}" เรียบร้อยแล้ว (จะปรากฏในแชทเมื่อเริ่มสถานีสอบ)`);
      }
    },

    /**
     * Lightweight Toast notification inside Scratchpad
     */
    showToast: function (msg) {
      let toast = this.dom.panel.querySelector('.sp-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'sp-toast';
        this.dom.panel.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    },

    /**
     * Update character counter in Text mode
     */
    updateCharCount: function () {
      const len = this.dom.textarea ? this.dom.textarea.value.length : 0;
      const el = this.dom.panel.querySelector('#sp-char-count');
      if (el) el.textContent = `${len} ตัวอักษร`;

      // Update badge if content exists
      const badge = document.getElementById('scratchpad-badge');
      if (badge) {
        const hasContent = len > 0 || (this.storage[this.currentStationKey] && this.storage[this.currentStationKey].hasDrawing);
        badge.style.display = hasContent ? 'inline-block' : 'none';
      }
    },

    /**
     * Set station key (e.g. 'station-1', 'case-CL4801')
     */
    setStation: function (stationKey, stationLabel) {
      if (!this.initialized) this.init();

      // Save previous station
      if (this.currentStationKey && this.currentStationKey !== stationKey) {
        this.saveCurrentStation();
      }

      this.currentStationKey = stationKey;
      const title = stationLabel || `กระดาษทด (${stationKey})`;

      if (this.dom.stationTitle) this.dom.stationTitle.textContent = title;
      const tag = this.dom.panel ? this.dom.panel.querySelector('#sp-station-tag') : null;
      if (tag) tag.textContent = title;

      // Load station content
      this.loadStationData(stationKey);
    },

    /**
     * Save current active station data to memory
     */
    saveCurrentStation: function () {
      if (!this.initialized || !this.currentStationKey) return;

      const stData = this.ensureStationData();
      const currentCanvasUrl = this.dom.canvas ? this.dom.canvas.toDataURL() : null;

      if (this.activeTab === 'draw') {
        stData.canvasData = currentCanvasUrl;
        stData.undoStack = [...this.undoStack];
      } else if (this.activeTab === 'label') {
        if (stData.labels && stData.labels[stData.activeLabelIndex]) {
          stData.labels[stData.activeLabelIndex].canvasData = currentCanvasUrl;
          stData.labels[stData.activeLabelIndex].undoStack = [...this.undoStack];
        }
      }

      stData.text = this.dom.textarea ? this.dom.textarea.value : '';
      stData.hasDrawing = (this.undoStack.length > 0 || !!stData.canvasData || (stData.labels && stData.labels.some(l => !!l.canvasData)));
      stData.timestamp = Date.now();
    },

    /**
     * Load station data into canvas and textarea
     */
    loadStationData: function (stationKey) {
      if (!this.initialized) return;

      const stData = this.ensureStationData(stationKey);

      // Load text
      if (this.dom.textarea) {
        this.dom.textarea.value = stData.text || '';
        this.updateCharCount();
      }

      // Load canvas based on current active tab
      if (this.activeTab === 'label') {
        this.renderLabelSubbarTabs();
        this.renderActiveLabel();
      } else if (this.activeTab === 'draw') {
        this.loadDrawingCanvas();
      }
    },

    /**
     * Save custom position & size to localStorage
     */
    saveCustomLayout: function () {
      if (this.isMinimized || this.isMaximized) return;
      if (window.innerWidth <= 768) return; // don't persist mobile bottom-sheet sizes
      try {
        const panel = this.dom.panel;
        if (!panel) return;
        const layout = {
          width: panel.offsetWidth,
          height: panel.offsetHeight,
          left: panel.offsetLeft,
          top: panel.offsetTop
        };
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
      } catch (_) {}
    },

    /**
     * Load custom position & size from localStorage
     */
    loadCustomLayout: function () {
      try {
        const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (!raw) return null;
        const layout = JSON.parse(raw);
        if (layout && layout.width && layout.height) {
          return layout;
        }
      } catch (_) {}
      return null;
    },

    /**
     * Apply stored custom layout to panel
     */
    applyStoredLayout: function () {
      if (window.innerWidth <= 768) return;
      const layout = this.loadCustomLayout();
      if (!layout) return;

      const panel = this.dom.panel;
      if (!panel) return;

      const minW = 320;
      const minH = 240;
      const w = Math.max(minW, Math.min(window.innerWidth - 32, layout.width || 500));
      const h = Math.max(minH, Math.min(window.innerHeight - 32, layout.height || 560));

      panel.style.width = w + 'px';
      panel.style.height = h + 'px';

      if (layout.left !== undefined && layout.top !== undefined) {
        const maxLeft = Math.max(10, window.innerWidth - w - 8);
        const maxTop = Math.max(10, window.innerHeight - 48);
        const left = Math.max(8, Math.min(maxLeft, layout.left));
        const top = Math.max(8, Math.min(maxTop, layout.top));

        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }
    },

    /**
     * Reset size and position back to default floating corner
     */
    resetLayout: function () {
      try {
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
      } catch (_) {}

      const panel = this.dom.panel;
      if (!panel) return;

      panel.style.left = '';
      panel.style.top = '';
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.width = '';
      panel.style.height = '';

      this.isMinimized = false;
      this.isMaximized = false;
      panel.classList.remove('minimized', 'maximized');
      this.updateMinimizeIcon();
      const maxIcon = panel.querySelector('#sp-maximize-icon');
      if (maxIcon) maxIcon.textContent = '⛶';

      setTimeout(() => {
        if (this.activeTab === 'draw' || this.activeTab === 'label') {
          this.resizeCanvas(true);
        }
      }, 100);
    },

    /**
     * Open scratchpad (supports optional default tab switch e.g. open('station-1', 'Label', 'label'))
     */
    open: function (stationKey, stationLabel, initialTab) {
      if (!this.initialized) this.init();
      if (stationKey) this.setStation(stationKey, stationLabel);

      this.isOpen = true;
      this.dom.panel.style.display = 'flex';
      this.dom.panel.classList.remove('minimized');
      this.isMinimized = false;
      this.updateMinimizeIcon();

      // Apply saved position & size on desktop
      this.applyStoredLayout();

      if (this.dom.fabBtn) this.dom.fabBtn.classList.add('active');

      if (initialTab && (initialTab === 'draw' || initialTab === 'type' || initialTab === 'label')) {
        this.switchTab(initialTab);
      }

      setTimeout(() => {
        if (this.activeTab === 'draw' || this.activeTab === 'label') {
          this.resizeCanvas(true);
        } else {
          this.dom.textarea.focus();
        }
      }, 100);
    },

    /**
     * Close scratchpad (hides window, keeps data safely)
     */
    close: function () {
      if (!this.isOpen) return;
      this.saveCurrentStation();
      this.isOpen = false;
      this.dom.panel.style.display = 'none';
      if (this.dom.fabBtn) this.dom.fabBtn.classList.remove('active');
    },

    /**
     * Toggle open/close
     */
    toggle: function (stationKey, stationLabel, initialTab) {
      if (this.isOpen) {
        this.close();
      } else {
        this.open(stationKey, stationLabel, initialTab);
      }
    },

    /**
     * Toggle minimize state
     */
    toggleMinimize: function () {
      this.isMinimized = !this.isMinimized;
      this.dom.panel.classList.toggle('minimized', this.isMinimized);
      this.updateMinimizeIcon();
      if (!this.isMinimized && (this.activeTab === 'draw' || this.activeTab === 'label')) {
        setTimeout(() => this.resizeCanvas(true), 100);
      }
    },

    updateMinimizeIcon: function () {
      const icon = this.dom.panel.querySelector('#sp-minimize-icon');
      if (icon) {
        icon.textContent = this.isMinimized ? '🔼' : '➖';
      }
    },

    /**
     * Toggle maximize/fullscreen state
     */
    toggleMaximize: function () {
      this.isMaximized = !this.isMaximized;
      this.dom.panel.classList.toggle('maximized', this.isMaximized);
      const icon = this.dom.panel.querySelector('#sp-maximize-icon');
      if (icon) {
        icon.textContent = this.isMaximized ? '🗗' : '⛶';
      }

      if (!this.isMaximized) {
        // Restore custom layout if available
        this.applyStoredLayout();
      }

      setTimeout(() => {
        if (this.activeTab === 'draw' || this.activeTab === 'label') {
          this.resizeCanvas(true);
        }
      }, 150);
    },

    /**
     * Reset all stations (e.g., when restarting an entire simulation exam)
     */
    resetAll: function () {
      this.storage = {};
      this.undoStack = [];
      if (this.dom.textarea) this.dom.textarea.value = '';
      if (this.dom.canvas) this.clearCanvas(true);
      this.updateCharCount();
    }
  };

  // Attach to window
  window.Scratchpad = Scratchpad;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Scratchpad.init());
  } else {
    Scratchpad.init();
  }

})(window);
