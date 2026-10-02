/**
 * PLE-CC OSPE Practice System — Digital Scratchpad & Drawing Canvas
 * File: scratchpad.js
 * =================================================================
 * High-performance, offline-first digital scratchpad for OSPE candidates.
 * Supports:
 * - Freehand drawing with stylus/touch/mouse (Black, Red, Green, Blue, Pen sizes)
 * - Text typing notepad with auto-save
 * - Per-station state memory (station notes persist across station switches)
 * - Undo, Eraser, Clear, Minimize, Maximize, and Mobile Bottom-Sheet support.
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

  const Scratchpad = {
    initialized: false,
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    activeTab: 'draw', // 'draw' | 'type'
    currentColor: COLORS.black,
    currentSize: PEN_SIZES.medium,
    isEraser: false,
    currentStationKey: 'default',
    
    // Per-station storage: { [stationKey]: { canvasData: string, text: string, undoStack: [] } }
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

      this.createDOM();
      this.bindEvents();
      this.initialized = true;

      // Check if there was an active station requested earlier
      if (this.currentStationKey) {
        this.loadStationData(this.currentStationKey);
      }
    },

    /**
     * Create floating button and modal/drawer panel
     */
    createDOM: function () {
      // 1. Floating Action Button (FAB)
      const fab = document.createElement('button');
      fab.id = 'scratchpad-fab-btn';
      fab.className = 'scratchpad-fab no-print';
      fab.setAttribute('title', 'เปิด/ปิด กระดาษทด (Scratchpad)');
      fab.setAttribute('type', 'button');
      fab.innerHTML = `
        <span class="scratchpad-fab-icon">📝</span>
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
        <!-- Panel Header -->
        <div class="sp-header">
          <div class="sp-header-left">
            <span class="sp-icon">📝</span>
            <span class="sp-title" id="sp-station-title">กระดาษทด</span>
          </div>

          <!-- Mode Tabs -->
          <div class="sp-tabs">
            <button type="button" class="sp-tab-btn active" id="sp-tab-draw" data-tab="draw">
              ✍️ วาดเขียน
            </button>
            <button type="button" class="sp-tab-btn" id="sp-tab-type" data-tab="type">
              ⌨️ พิมพ์โน้ต
            </button>
          </div>

          <!-- Window Controls -->
          <div class="sp-window-actions">
            <button type="button" class="sp-win-btn" id="sp-btn-minimize" title="ย่อหน้าต่าง" aria-label="ย่อ">
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

        <!-- Panel Body -->
        <div class="sp-body">
          
          <!-- DRAW VIEW -->
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
                <button type="button" class="sp-action-btn sp-action-danger" id="sp-tool-clear" title="ล้างกระดาน">
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

      // Tabs
      this.dom.tabDrawBtn.addEventListener('click', () => self.switchTab('draw'));
      this.dom.tabTypeBtn.addEventListener('click', () => self.switchTab('type'));

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
          if (confirm('คุณต้องการล้างกระดานวาดของสถานีนี้ใช่หรือไม่?')) {
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

      // Window resize observer to adapt canvas resolution
      window.addEventListener('resize', () => {
        if (self.isOpen && !self.isMinimized) {
          self.resizeCanvas();
        }
      });
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
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.currentSize * 4; // Wider stroke for eraser
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
      if (resetUndo) {
        this.undoStack = [];
      }
    },

    /**
     * Adjust canvas pixel buffer to match layout size with High-DPI support
     */
    resizeCanvas: function (preserveContent = true) {
      const canvas = this.dom.canvas;
      const wrapper = this.dom.panel.querySelector('#sp-canvas-wrapper');
      if (!canvas || !wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 240);

      // Save previous content if needed
      let prevImg = null;
      if (preserveContent && canvas.width > 0 && canvas.height > 0) {
        prevImg = canvas.toDataURL();
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      this.dom.ctx.scale(dpr, dpr);

      // Fill white background
      this.dom.ctx.fillStyle = '#FFFFFF';
      this.dom.ctx.fillRect(0, 0, width, height);

      // Restore image if preserved
      if (prevImg) {
        const img = new Image();
        img.onload = () => {
          this.dom.ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = prevImg;
      }
    },

    /**
     * Switch view between 'draw' and 'type'
     */
    switchTab: function (tab) {
      this.activeTab = tab;
      const drawView = this.dom.panel.querySelector('#sp-draw-view');
      const typeView = this.dom.panel.querySelector('#sp-type-view');

      if (tab === 'draw') {
        this.dom.tabDrawBtn.classList.add('active');
        this.dom.tabTypeBtn.classList.remove('active');
        drawView.style.display = 'flex';
        typeView.style.display = 'none';
        setTimeout(() => this.resizeCanvas(true), 50);
      } else {
        this.dom.tabTypeBtn.classList.add('active');
        this.dom.tabDrawBtn.classList.remove('active');
        typeView.style.display = 'flex';
        drawView.style.display = 'none';
        this.dom.textarea.focus();
      }
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

      const canvasData = this.dom.canvas ? this.dom.canvas.toDataURL() : null;
      const textData = this.dom.textarea ? this.dom.textarea.value : '';

      this.storage[this.currentStationKey] = {
        canvasData: canvasData,
        text: textData,
        hasDrawing: this.undoStack.length > 0 || !!canvasData,
        timestamp: Date.now()
      };
    },

    /**
     * Load station data into canvas and textarea
     */
    loadStationData: function (stationKey) {
      if (!this.initialized) return;

      const data = this.storage[stationKey] || { canvasData: null, text: '' };

      // Load text
      if (this.dom.textarea) {
        this.dom.textarea.value = data.text || '';
        this.updateCharCount();
      }

      // Load canvas
      this.undoStack = [];
      if (data.canvasData) {
        const img = new Image();
        img.onload = () => {
          this.resizeCanvas(false);
          const rect = this.dom.canvas.getBoundingClientRect();
          this.dom.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = data.canvasData;
      } else {
        setTimeout(() => {
          this.resizeCanvas(false);
          this.clearCanvas(true);
        }, 50);
      }
    },

    /**
     * Open scratchpad
     */
    open: function (stationKey, stationLabel) {
      if (!this.initialized) this.init();
      if (stationKey) this.setStation(stationKey, stationLabel);

      this.isOpen = true;
      this.dom.panel.style.display = 'flex';
      this.dom.panel.classList.remove('minimized');
      this.isMinimized = false;
      this.updateMinimizeIcon();

      if (this.dom.fabBtn) this.dom.fabBtn.classList.add('active');

      setTimeout(() => {
        if (this.activeTab === 'draw') {
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
    toggle: function (stationKey, stationLabel) {
      if (this.isOpen) {
        this.close();
      } else {
        this.open(stationKey, stationLabel);
      }
    },

    /**
     * Toggle minimize state
     */
    toggleMinimize: function () {
      this.isMinimized = !this.isMinimized;
      this.dom.panel.classList.toggle('minimized', this.isMinimized);
      this.updateMinimizeIcon();
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
      setTimeout(() => {
        if (this.activeTab === 'draw') this.resizeCanvas(true);
      }, 200);
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
