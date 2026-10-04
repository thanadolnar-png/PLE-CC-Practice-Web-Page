/**
 * station-chat.js - Universal PLE OSPE Live Dialogue & Gemini AI Guru Controller
 * Supports:
 * - Direct Case Viewer & Exam Simulation Integration
 * - Gemini 3.5 Flash Lite with 4-key Failover Pool
 * - Academic Guru & Examiner Roles (Plain math, zero asterisks)
 * - TTS Natural Thai Speech & STT Voice Mic
 * - Scratchpad / Drug Label Sharing Bridge
 * - Mobile Half-Screen Bottom Sheet & Desktop Draggable/Resizable Dock
 */

(function () {
  'use strict';

  const StationChatController = {
    isOpen: false,
    currentStationNum: 1,
    activeCaseData: null,
    unreadCount: 0,
    soloMessages: {},
    aiEnabled: true, // Default enabled for instant learning in Case Viewer & Simulation
    aiRole: localStorage.getItem('_ple_ai_role') || 'guru', // Default to guru in Case Viewer
    aiSoundEnabled: localStorage.getItem('_ple_ai_sound') !== 'false', // Default true
    currentAvatarIndex: 0,
    currentAvatarType: 'guru', // 'guru' | 'prof' | 'patient'
    isListeningVoice: false,
    speechRecognition: null,
    _aiTypingEl: null,
    typingTimeout: null,
    _speechToken: 0,
    _speakerOverride: null,

    avatars: {
      profs: [
        { id: 'prof1', gender: 'male', name: '👨‍🏫 อ.สุวัฒน์ (กรรมการคุมสอบ)', sub: 'คณะเภสัชศาสตร์ จุฬาฯ', img: 'assets/avatars/prof_male1.jpg', pitch: 0.9, rate: 0.97 },
        { id: 'prof2', gender: 'male', name: '👨‍🏫 อ.ธนกร (กรรมการคุมสอบ)', sub: 'คณะเภสัชศาสตร์ จุฬาฯ', img: 'assets/avatars/prof_male2.jpg', pitch: 0.97, rate: 1.0 },
        { id: 'prof3', gender: 'female', name: '👩‍🏫 อ.ศิริพร (กรรมการคุมสอบ)', sub: 'คณะเภสัชศาสตร์ จุฬาฯ', img: 'assets/avatars/prof_female1.jpg', pitch: 1.05, rate: 0.97 }
      ],
      patient: { id: 'patient', gender: 'female', name: '🩺 คุณสมศรี (ผู้ป่วยจำลอง SP)', sub: 'ผู้ป่วยมารับคำปรึกษาที่ร้านยา/รพ.', img: 'assets/avatars/patient.jpg', pitch: 1.1, rate: 0.94 },
      guru: { id: 'guru', gender: 'male', name: '🧠 เภสัชกรติวเตอร์ (Gemini Guru)', sub: 'ผู้เชี่ยวชาญคลินิก อธิบาย Guideline & DTP', img: 'assets/avatars/cheater.jpg', pitch: 1.0, rate: 0.98 }
    },

    getAIDailyCount() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem('_ple_ai_quota') || '{}');
        if (stored.date !== today) return 0;
        return stored.count || 0;
      } catch (e) {
        return 0;
      }
    },

    incrementAIDailyCount() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem('_ple_ai_quota') || '{}');
        const count = (stored.date === today ? (stored.count || 0) : 0) + 1;
        localStorage.setItem('_ple_ai_quota', JSON.stringify({ date: today, count }));
        return count;
      } catch (e) {
        return 1;
      }
    },

    getActiveAvatar() {
      if (this._speakerOverride) return this._speakerOverride;
      if (this.aiRole === 'guru' || this.currentAvatarType === 'guru') {
        return this.avatars.guru;
      }
      if (this.currentAvatarType === 'patient') {
        return this.avatars.patient;
      }
      const list = this.avatars.profs;
      return list[this.currentAvatarIndex % list.length];
    },

    updateAvatarUI() {
      const spotlight = document.getElementById('st-chat-avatar-spotlight');
      if (spotlight) spotlight.style.display = this.aiEnabled ? 'flex' : 'none';

      const cur = this.getActiveAvatar();
      const imgEl = document.getElementById('st-chat-avatar-img');
      const nameEl = document.getElementById('st-chat-avatar-name');
      const subEl = document.getElementById('st-chat-avatar-sub');
      const soundBtn = document.getElementById('btn-ai-sound-toggle');
      const soundStatus = document.getElementById('ai-sound-status-text');

      if (imgEl && cur.img) {
        imgEl.src = cur.img;
        imgEl.alt = cur.name;
      }
      if (nameEl && cur.name) {
        nameEl.innerHTML = `<span>${cur.name}</span>`;
      }
      if (subEl) {
        const caseLabel = this.activeCaseData?.caseId || this.currentStationNum || '';
        subEl.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:2px;"></span><span>เคส ${caseLabel} • ${cur.sub}</span>`;
      }
      if (soundBtn && soundStatus) {
        soundBtn.classList.toggle('active', this.aiSoundEnabled);
        soundStatus.textContent = this.aiSoundEnabled ? '🔊' : '🔇';
      }
    },

    cycleAvatar() {
      if (this.aiRole === 'guru') return;
      if (this.currentAvatarType === 'patient') {
        this.currentAvatarType = 'prof';
      } else {
        this.currentAvatarIndex = (this.currentAvatarIndex + 1) % (this.avatars.profs.length + 1);
        if (this.currentAvatarIndex === this.avatars.profs.length) {
          this.currentAvatarType = 'patient';
        } else {
          this.currentAvatarType = 'prof';
        }
      }
      this.updateAvatarUI();
    },

    toggleSound() {
      this.aiSoundEnabled = !this.aiSoundEnabled;
      try { localStorage.setItem('_ple_ai_sound', String(this.aiSoundEnabled)); } catch (_) {}
      if (!this.aiSoundEnabled) {
        this.cancelSpeech();
      }
      this.updateAvatarUI();
    },

    setAvatarSpeaking(isSpeaking) {
      const frame = document.getElementById('st-chat-avatar-frame');
      if (!frame) return;
      frame.classList.toggle('speaking', Boolean(isSpeaking));
    },

    stripStageDirections(t) {
      return String(t || '')
        .replace(/[\(（][^\)）]*[\)）]/g, ' ')
        .replace(/\*[^*]+\*/g, ' ')
        .replace(/~[^~]+~/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ');
    },

    normalizeForSpeech(text) {
      let t = this.stripStageDirections(String(text || ''));
      t = t
        .replace(/<[^>]+>/g, ' ')
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{FE0F}\u{200D}]/gu, ' ')
        .replace(/[#_`•>|]/g, ' ');

      const rep = (re, to) => { t = t.replace(re, to); };
      rep(/(^|[^A-Za-z])mg\s*\/\s*dL(?![A-Za-z])/gi, '$1มิลลิกรัมต่อเดซิลิตร');
      rep(/(^|[^A-Za-z])mg\s*\/\s*kg(?![A-Za-z])/gi, '$1มิลลิกรัมต่อกิโลกรัม');
      rep(/(^|[^A-Za-z])mmHg(?![A-Za-z])/gi, '$1มิลลิเมตรปรอท');
      rep(/(^|[^A-Za-z])mEq\s*\/\s*L(?![A-Za-z])/gi, '$1มิลลิอิควิวาเลนต์ต่อลิตร');
      rep(/(^|[^A-Za-z])mcg(?![A-Za-z])/gi, '$1ไมโครกรัม');
      rep(/(^|[^A-Za-z])mg(?![A-Za-z])/gi, '$1มิลลิกรัม');
      rep(/(\d)\s*kg(?![A-Za-z])/gi, '$1 กิโลกรัม');
      rep(/(\d)\s*g(?![A-Za-z])/g, '$1 กรัม');
      rep(/(\d)\s*(?:mL|ml)(?![A-Za-z])/g, '$1 มิลลิลิตร');
      rep(/(\d)\s*(?:bpm)(?![A-Za-z])/gi, '$1 ครั้งต่อนาที');
      rep(/(\d)\s*(?:°C|℃)/g, '$1 องศาเซลเซียส');
      rep(/%/g, ' เปอร์เซ็นต์');
      rep(/(^|[^A-Za-z])BID(?![A-Za-z])/g, '$1วันละสองครั้ง');
      rep(/(^|[^A-Za-z])TID(?![A-Za-z])/g, '$1วันละสามครั้ง');
      rep(/(^|[^A-Za-z])QID(?![A-Za-z])/g, '$1วันละสี่ครั้ง');
      rep(/(^|[^A-Za-z])OD(?![A-Za-z])/g, '$1วันละครั้ง');
      rep(/(^|[^A-Za-z])HS(?![A-Za-z])/g, '$1ก่อนนอน');
      rep(/(^|[^A-Za-z])PRN(?![A-Za-z])/g, '$1เมื่อมีอาการ');
      rep(/(^|[^A-Za-z])DTPs?(?![A-Za-z])/g, '$1ดีทีพี');
      rep(/(\d+)\s*\/\s*(\d+)/g, '$1 ต่อ $2');
      rep(/(\d)\s*[-–—]\s*(\d)/g, '$1 ถึง $2');
      rep(/\s*[-–—]\s*/g, ' ');
      rep(/[*]+/g, ' ');
      rep(/[ \t]+/g, ' ');
      rep(/\s*\n\s*/g, '\n');
      return t.trim();
    },

    splitSpeechChunks(text) {
      const MAX = 100;
      const lines = String(text || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
      const sentences = [];
      lines.forEach(line => {
        line.replace(/([.!?。！？]+)\s+/g, '$1\n').split('\n').forEach(s => {
          s = s.trim();
          if (s) sentences.push(s);
        });
      });

      const pieces = [];
      sentences.forEach(s => {
        if (s.length <= MAX) { pieces.push(s); return; }
        let cur = '';
        s.split(/\s+/).forEach(w => {
          if ((cur + ' ' + w).trim().length > MAX && cur) { pieces.push(cur.trim()); cur = w; }
          else cur = (cur + ' ' + w).trim();
        });
        if (cur) pieces.push(cur);
      });

      const hard = [];
      pieces.forEach(p => {
        for (let i = 0; i < p.length; i += MAX + 20) hard.push(p.slice(i, i + MAX + 20));
      });
      const merged = [];
      hard.forEach(p => {
        const last = merged[merged.length - 1];
        if (last && (last.length < 28 || p.length < 14) && (last.length + p.length) < MAX + 20) {
          merged[merged.length - 1] = last + ' ' + p;
        } else {
          merged.push(p);
        }
      });
      return merged;
    },

    parseSpeakerSegments(text) {
      const segs = [];
      const tagRe = /^\s*\[(SP|EXAMINER|FRIEND|GURU)\]\s*[:：]?\s*/i;
      String(text || '').split(/\n/).forEach(line => {
        const m = line.match(tagRe);
        if (m) {
          segs.push({ role: m[1].toUpperCase(), text: line.replace(tagRe, '') });
        } else if (line.trim()) {
          if (segs.length) segs[segs.length - 1].text += '\n' + line;
          else segs.push({ role: null, text: line });
        }
      });
      return segs;
    },

    avatarForRole(role) {
      if (role === 'SP') return this.avatars.patient;
      if (role === 'FRIEND' || role === 'GURU') return this.avatars.guru;
      if (role === 'EXAMINER') {
        const list = this.avatars.profs;
        return list[this.currentAvatarIndex % list.length];
      }
      return null;
    },

    getThaiVoices() {
      try {
        const all = window.speechSynthesis.getVoices() || [];
        return all.filter(v => /^th/i.test(v.lang || '') || /thai|ไทย/i.test(v.name || ''));
      } catch (_) { return []; }
    },

    pickVoice(gender) {
      const list = this.getThaiVoices();
      if (!list.length) return null;
      const score = (v) => {
        const n = v.name || '';
        let s = 0;
        if (/natural|online|neural/i.test(n)) s += 4;
        if (/premium|enhanced/i.test(n)) s += 3;
        if (/google/i.test(n)) s += 2;
        if (v.localService === false) s += 1;
        const isMale = /niwat|\bmale\b|ชาย/i.test(n);
        const isFemale = /premwadee|kanya|narisa|\bfemale\b|หญิง/i.test(n);
        if (gender === 'male') { if (isMale) s += 10; if (isFemale) s -= 10; }
        else { if (isFemale) s += 10; if (isMale) s -= 10; }
        return s;
      };
      return list.slice().sort((a, b) => score(b) - score(a))[0];
    },

    cancelSpeech() {
      this._speechToken = (this._speechToken || 0) + 1;
      try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (_) {}
      this._speakerOverride = null;
      this.setAvatarSpeaking(false);
    },

    speakText(text) {
      if (!this.aiSoundEnabled || !('speechSynthesis' in window)) return;
      try {
        const segs = this.parseSpeakerSegments(text);
        const queue = [];
        segs.forEach(seg => {
          const clean = this.normalizeForSpeech(seg.text);
          if (!clean) return;
          this.splitSpeechChunks(clean).forEach(c => queue.push({ role: seg.role, text: c }));
        });
        if (!queue.length) return;

        this.cancelSpeech();
        const token = this._speechToken;
        const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

        const next = (i) => {
          if (token !== this._speechToken) return;
          if (i >= queue.length) {
            this._speakerOverride = null;
            this.setAvatarSpeaking(false);
            this.updateAvatarUI();
            return;
          }
          const item = queue[i];
          const av = this.avatarForRole(item.role) || this.getActiveAvatar();
          if (item.role && this._speakerOverride !== av) {
            this._speakerOverride = av;
            this.updateAvatarUI();
          }

          const u = new SpeechSynthesisUtterance(item.text);
          u.lang = 'th-TH';
          const voice = this.pickVoice(av.gender || 'female');
          if (voice) { u.voice = voice; u.lang = voice.lang || 'th-TH'; }
          u.pitch = clamp(av.pitch || 1.0, 0.85, 1.15);
          u.rate = clamp(av.rate || 1.0, 0.9, 1.05);

          let advanced = false;
          const go = () => { if (advanced) return; advanced = true; setTimeout(() => next(i + 1), 110); };
          u.onstart = () => { if (token === this._speechToken) this.setAvatarSpeaking(true); };
          u.onend = go;
          u.onerror = (e) => {
            if (e && (e.error === 'canceled' || e.error === 'interrupted')) return;
            go();
          };
          window.speechSynthesis.speak(u);
        };

        setTimeout(() => next(0), 90);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
        this.cancelSpeech();
      }
    },

    unlockAudio() {
      try {
        if ('speechSynthesis' in window) {
          const silent = new SpeechSynthesisUtterance('');
          silent.volume = 0;
          window.speechSynthesis.speak(silent);
        }
      } catch (_) {}
    },

    toggleVoiceMic() {
      this.unlockAudio();
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        alert('เบราว์เซอร์ของคุณยังไม่รองรับระบบสั่งการด้วยเสียง (Web Speech API) กรุณาใช้ Chrome, Edge หรือ Safari บน iOS 14.5+ ครับ');
        return;
      }

      const micBtn = document.getElementById('station-chat-mic-btn');
      const inputEl = document.getElementById('station-chat-input');

      if (this.isListeningVoice) {
        if (this.speechRecognition) {
          try { this.speechRecognition.stop(); } catch (_) {}
        }
        this.isListeningVoice = false;
        if (micBtn) {
          micBtn.classList.remove('listening');
          micBtn.title = 'แตะเพื่อเปิดไมค์พูดคุยภาษาไทย';
        }
        return;
      }

      try {
        const rec = new SpeechRec();
        rec.lang = 'th-TH';
        rec.continuous = false;
        rec.interimResults = true;
        this.speechRecognition = rec;

        rec.onstart = () => {
          this.isListeningVoice = true;
          if (micBtn) {
            micBtn.classList.add('listening');
            micBtn.title = '🔴 กำลังฟัง... (แตะอีกครั้งเพื่อหยุด)';
          }
          if (inputEl) {
            inputEl.placeholder = '🎙️ กำลังฟังเสียงภาษาไทยของคุณ...';
          }
        };

        rec.onresult = (evt) => {
          let transcript = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            transcript += evt.results[i][0].transcript;
          }
          if (inputEl && transcript) {
            inputEl.value = transcript;
          }
        };

        rec.onend = () => {
          this.isListeningVoice = false;
          if (micBtn) {
            micBtn.classList.remove('listening');
            micBtn.title = 'แตะเพื่อเปิดไมค์พูดคุยภาษาไทย';
          }
          if (inputEl) {
            inputEl.placeholder = 'พิมพ์คำถาม หรือกดไมค์ 🎙️ เพื่อพูด...';
            inputEl.focus();
          }
        };

        rec.onerror = (err) => {
          console.warn('SpeechRecognition error:', err);
          this.isListeningVoice = false;
          if (micBtn) micBtn.classList.remove('listening');
          if (inputEl) inputEl.placeholder = 'พิมพ์คำถาม หรือกดไมค์ 🎙️ เพื่อพูด...';
        };

        rec.start();
      } catch (err) {
        console.error('Cannot start SpeechRecognition:', err);
        this.isListeningVoice = false;
        if (micBtn) micBtn.classList.remove('listening');
      }
    },

    setAIRole(role) {
      this.aiRole = (role === 'examiner') ? 'examiner' : 'guru';
      try { localStorage.setItem('_ple_ai_role', this.aiRole); } catch (_) {}

      const btnEx = document.getElementById('btn-ai-role-examiner');
      const btnGuru = document.getElementById('btn-ai-role-guru');
      const descEl = document.getElementById('st-chat-ai-role-desc');

      if (btnEx) btnEx.classList.toggle('active', this.aiRole === 'examiner');
      if (btnGuru) btnGuru.classList.toggle('active', this.aiRole === 'guru');

      if (descEl) {
        if (this.aiRole === 'guru') {
          descEl.innerHTML = '<span style="color:#0284c7;font-weight:700;">🧠 ติวเตอร์ Guru: อธิบายหลักการ DTPs วิเคราะห์เคส และ Guideline ทางการ</span>';
        } else {
          descEl.innerHTML = '<span style="color:#6d28d9;font-weight:700;">👨‍🏫 จำลองสมจริง: ตรวจอาการ/คนไข้ ไม่หลุดเฉลยล่วงหน้า</span>';
        }
      }
      this.updateAIToggleUI();
      this.updateAvatarUI();
    },

    updateAIToggleUI() {
      const btn = document.getElementById('btn-ai-chat-toggle');
      const label = document.getElementById('ai-toggle-label');
      const roleBar = document.getElementById('st-chat-ai-role-bar');
      const spotlight = document.getElementById('st-chat-avatar-spotlight');

      if (btn) btn.classList.toggle('ai-active', this.aiEnabled);
      if (roleBar) roleBar.style.display = this.aiEnabled ? 'flex' : 'none';
      if (spotlight) spotlight.style.display = this.aiEnabled ? 'flex' : 'none';

      if (label) {
        if (!this.aiEnabled) {
          label.textContent = 'AI';
        } else {
          label.textContent = this.aiRole === 'guru' ? '🧠 Guru ON' : '👨‍🏫 สอบ ON';
        }
      }
      this.updateAvatarUI();
    },

    toggleAI() {
      this.aiEnabled = !this.aiEnabled;
      this.unlockAudio();
      this.updateAIToggleUI();
      if (this.aiEnabled) {
        this.setAIRole(this.aiRole);
      } else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        this.setAvatarSpeaking(false);
      }
    },

    showAITyping() {
      this.removeAITyping();
      const container = document.getElementById('station-chat-messages');
      if (!container) return;
      const el = document.createElement('div');
      el.className = 'st-chat-ai-typing';
      el.id = 'st-chat-ai-typing-indicator';
      const roleEmoji = this.aiRole === 'guru' ? '🧠 เภสัชกรติวเตอร์' : '👨‍🏫 อาจารย์คุมสอบ';
      el.innerHTML = `${roleEmoji} กำลังคิด...
        <span class="st-chat-ai-typing-dots">
          <span></span><span></span><span></span>
        </span>`;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
      this._aiTypingEl = el;
    },

    removeAITyping() {
      const el = document.getElementById('st-chat-ai-typing-indicator');
      if (el) el.remove();
      this._aiTypingEl = null;
    },

    renderAIMessage(replyText) {
      const container = document.getElementById('station-chat-messages');
      if (!container) return;
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const el = document.createElement('div');
      el.className = 'st-chat-msg theirs ai-msg';

      const isGuru = (this.aiRole === 'guru');
      const senderEmoji = isGuru ? '🧠' : '👨‍🏫';
      const senderTitle = isGuru ? 'เภสัชกรติวเตอร์ (Gemini AI Guru)' : 'อาจารย์คุมสอบ & คนไข้ (Examiner & SP)';
      const badgeColor = isGuru ? 'background:#0284c7;' : 'background:#7c3aed;';
      const badgeLabel = isGuru ? '🧠 ติวเตอร์ผู้เชี่ยวชาญ (Academic Guru)' : '👨‍🏫 ผู้ประเมิน & คนไข้จำลอง (Exam Mode)';
      const rolePill = isGuru
        ? '<span style="font-size:0.68rem;background:rgba(2,132,199,0.15);color:#0369a1;padding:1px 5px;border-radius:4px;font-weight:700;">GURU</span>'
        : '<span style="font-size:0.68rem;background:rgba(124,58,237,0.15);color:#6d28d9;padding:1px 5px;border-radius:4px;font-weight:700;">EXAM</span>';

      if (isGuru) {
        el.style.borderColor = '#0284c7';
        el.style.background = 'linear-gradient(135deg, #f0f9ff, #e0f2fe)';
        el.style.color = '#0c4a6e';
      }

      // Format clean plain text: strip markdown asterisks and transform LaTeX to readable plain arithmetic
      const formatCleanAIMessage = (raw) => {
        let s = String(raw || '');
        s = s.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 ÷ $2)');
        s = s.replace(/\\(?:text|mathbf|mathrm|mathit|textbf)\s*\{([^{}]+)\}/g, '$1');
        s = s.replace(/\\times/g, ' × ');
        s = s.replace(/\\div/g, ' ÷ ');
        s = s.replace(/\\pm/g, ' ± ');
        s = s.replace(/\\leq/g, ' ≤ ');
        s = s.replace(/\\geq/g, ' ≥ ');
        s = s.replace(/\\neq/g, ' ≠ ');
        s = s.replace(/\\approx/g, ' ≈ ');
        s = s.replace(/\\cdot/g, ' · ');
        s = s.replace(/\\[a-zA-Z]+/g, ' ');
        s = s.replace(/[\{\}]/g, '');
        s = s.replace(/\$/g, '');
        s = s.replace(/\*+/g, '');
        s = s.replace(/[ \t]{2,}/g, ' ');
        return s.trim();
      };

      const cleanedReply = formatCleanAIMessage(replyText);

      const safeText = cleanedReply
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

      el.innerHTML = `
        <div class="st-chat-ai-badge" style="${badgeColor}">⚡ ${badgeLabel}</div>
        <div class="st-chat-msg-sender">
          <span>${senderEmoji}</span>
          <span>${senderTitle}</span>
          ${rolePill}
          <span style="opacity:0.65;margin-left:2px;">${timeStr}</span>
        </div>
        <div style="line-height:1.55;">${safeText}</div>
      `;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;

      // Save to solo local history
      const stationKey = String(this.currentStationNum || '1');
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      this.soloMessages[stationKey].push({
        id: 'ai_' + Date.now(),
        senderId: 'gemini_ai_' + this.aiRole,
        senderName: senderTitle,
        senderRole: isGuru ? 'guru' : 'examiner',
        senderEmoji: senderEmoji,
        text: replyText,
        timestamp: Date.now(),
        stationNumber: this.currentStationNum,
        isAi: true
      });

      if (this.aiSoundEnabled && replyText) {
        this.speakText(replyText);
      }
    },

    async callGeminiAI(userText) {
      const stNum = this.currentStationNum;
      let matchedCase = this.activeCaseData || (window.AppState && AppState.currentCase) || window._currentCaseDetail || null;

      // Fallback: lookup offline database
      if (matchedCase && matchedCase.caseId && typeof OFFLINE_CASE_DETAILS !== 'undefined') {
        const cId = String(matchedCase.caseId).trim();
        const ospeId = cId.startsWith('OSPE-') ? cId : ('OSPE-' + cId);
        const rawId = cId.replace(/^OSPE-/, '');
        const offlineDetail = OFFLINE_CASE_DETAILS[cId] || OFFLINE_CASE_DETAILS[ospeId] || OFFLINE_CASE_DETAILS[rawId];
        if (offlineDetail) {
          matchedCase = Object.assign({}, offlineDetail, matchedCase);
        }
      }

      const strip = (html) => String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      let caseContext = '';
      if (matchedCase) {
        const parts = [];
        if (matchedCase.caseId) parts.push(`📌 รหัสเคส: ${matchedCase.caseId}`);
        if (matchedCase.title) parts.push(`📌 ชื่อสถานการณ์/โจทย์เคส: ${matchedCase.title}`);
        if (matchedCase.disease) parts.push(`📌 โรค/กลุ่มยาหลัก: ${matchedCase.disease}`);

        const scenarioText = strip(matchedCase.scenario || matchedCase.contentHtml || '');
        if (scenarioText) parts.push(`📋 โจทย์สถานการณ์ที่นิสิตได้รับ:\n"${scenarioText}"`);

        const patientInfoText = strip(matchedCase.patientInfoHtml || matchedCase.patientProfile || matchedCase.profile || '');
        if (patientInfoText) parts.push(`👤 ข้อมูลผู้ป่วย (Patient Profile & Vitals & Labs & Meds):\n${patientInfoText}`);

        const spScriptText = strip(matchedCase.spScriptHtml || matchedCase.spScript || '');
        if (spScriptText) parts.push(`🎭 บทผู้ป่วยจำลอง (SP Script - สิ่งที่คนไข้ต้องตอบเมื่อถูกซักประวัติ):\n${spScriptText}`);

        const examinerText = strip(matchedCase.examinerInfoHtml || matchedCase.examinerInfo || '');
        if (examinerText) parts.push(`👨‍⚕️ ข้อมูลผู้ประเมิน/สิ่งที่ผู้ตรวจมีให้:\n${examinerText}`);

        const equipText = strip(matchedCase.equipmentHtml || matchedCase.equipment || '');
        if (equipText) parts.push(`📦 อุปกรณ์/สิ่งที่มีให้ในสถานี:\n${equipText}`);

        if (Array.isArray(matchedCase.checklist) && matchedCase.checklist.length > 0) {
          const chkLines = matchedCase.checklist.slice(0, 20).map((item, idx) => {
            const grp = item.group ? `[${item.group}] ` : '';
            const txt = strip(item.text || item.textHtml || item.title || '');
            return `${idx + 1}. ${grp}${txt}`;
          }).filter(Boolean);
          if (chkLines.length > 0) {
            parts.push(`✅ เกณฑ์ประเมินและเฉลยของสถานีนี้ (Checklist & DTPs Key Solution):\n${chkLines.join('\n')}`);
          }
        } else if (matchedCase.checklistHtml || typeof matchedCase.checklist === 'string') {
          const chkText = strip(matchedCase.checklistHtml || matchedCase.checklist);
          if (chkText) parts.push(`✅ เกณฑ์ประเมินและเฉลย:\n${chkText.slice(0, 1000)}`);
        }

        const noteText = strip(matchedCase.noteHtml || matchedCase.note || '');
        if (noteText) parts.push(`💡 เฉลย/ข้อมูลผู้ตรวจ/คำอธิบายเพิ่มเติม:\n${noteText.slice(0, 600)}`);

        caseContext = parts.join('\n\n');
      }

      let recentHistoryText = '';
      try {
        const stationKey = String(stNum || '1');
        const currentMsgs = this.soloMessages[stationKey] || [];
        if (currentMsgs.length > 0) {
          const lastMsgs = currentMsgs.slice(-6);
          recentHistoryText = lastMsgs.map(m => {
            const roleName = m.isAi ? 'ติวเตอร์/ผู้ประเมิน' : 'นิสิต';
            const txt = m.noteText || m.text || '';
            return `${roleName}: ${txt}`;
          }).join('\n');
        }
      } catch (_) {}

      const isGuruRole = (this.aiRole === 'guru');
      let systemPrompt = '';

      if (isGuruRole) {
        systemPrompt = `คุณคือ "เภสัชกรติวเตอร์ผู้เชี่ยวชาญระดับสูง (Gemini AI Guru)" ประจำสถานี/เคสสอบทักษะทางเภสัชกรรมคลินิก (PLE-CC2 OSPE) รหัสเคส ${stNum}
==================================================
🧠 [บทบาทและบุคลิกภาพของคุณ - ACADEMIC GURU ROLE]:
1. คุณเป็นอาจารย์/ติวเตอร์ผู้เชี่ยวชาญด้านเภสัชบำบัด (Pharmacotherapy) และการบริบาลทางเภสัชกรรม ให้คำตอบแบบเป็นทางการ สุภาพ น่าเชื่อถือ ทางวิชาการชัดเจน 100%
2. ไม่ติดเล่น ไม่ใช้คำสแลง ไม่สวมบทเพื่อนกระซิบโกง แต่ตอบตรงไปตรงมาเสมือนปรึกษาผู้เชี่ยวชาญ หรือตอบจาก Gemini โดยตรง
3. 🎯 ขอบเขตการอธิบายและสอน:
   - ชี้แจงการวินิจฉัยและสภาวะโรคของผู้ป่วยอย่างถูกต้องตามหลักเกณฑ์
   - วิเคราะห์ปัญหาที่เกี่ยวเนื่องกับการใช้ยา (Drug Therapy Problems: DTPs/DRPs) โดยใช้หลักการเภสัชกรรมคลินิกที่เป็นสากล
   - แนะนำการเลือกใช้ยา ขนาดยา (Dosage) วิธีใช้ และข้อควรระวัง พร้อมอ้างอิงแนวทางเวชปฏิบัติทางการ (Official Guidelines เช่น สมาคมแพทย์โรคหัวใจ, สมาคมเบาหวาน, CDC, GOLD, KDIGO ฯลฯ)
   - สรุป Checklist จุดที่กรรมการมักหักคะแนนหรือจุดสำคัญที่ต้องระวังในการสอบ OSPE
4. ⚠️ [กฎเหล็กการจัดรูปแบบข้อความและการแสดงสูตรคำนวณ - STRICT CLEAN TEXT & MATH]:
   - 🚫 ห้ามใช้เครื่องหมายดอกจัน (ห้ามมี ** หรือ *) ในข้อความโดยเด็ดขาด! ให้ใช้ข้อความธรรมดา ขึ้นบรรทัดใหม่ และลำดับตัวเลข 1. 2. 3. หรือขีด - แทน
   - 🚫 ห้ามเขียนสมการเป็นรหัส LaTeX เด็ดขาด (ห้ามมี $, \\frac, \\text, \\mathbf, \\times, \\;)
   - ✅ เขียนการคำนวณและสมการให้เป็นรูปแบบภาษาไทยและตัวเลขธรรมดาที่อ่านง่าย ชัดเจน สวยงาม เช่น:
     • (2 × 15) ÷ 100 = 0.3 กรัม
     • 100 - 2 = 98 กรัม
     • 15 - 0.3 = 14.7 กรัม
   - รูปแบบคำตอบ: กระชับ มีโครงสร้างสะอาดตา 3-5 ประโยค หรือเป็นข้อๆ ให้อ่านง่าย
==================================================
[ข้อมูลสถานีสอบ เฉลย และเกณฑ์ Checklist ประจำสถานีนี้]
${caseContext || '(ยังไม่มีข้อมูลเคส)'}
==================================================`;
      } else {
        systemPrompt = `คุณคือระบบจำลองสถานีสอบทักษะปฏิบัติทางเภสัชกรรมคลินิก (PLE-CC2 OSPE Simulation) ประจำสถานีสอบที่ ${stNum}
==================================================
👨‍🏫 [บุคลิกภาพและบทบาทของคุณ - EXAMINER & SIMULATED PATIENT]:
⚠️ [กฎเหล็กสำคัญสูงสุด - ไม่บอกเฉลยหรือ DTP ล่วงหน้าเด็ดขาด]:
1. คุณทำหน้าที่เป็น "อาจารย์คุมสอบผู้ประเมิน (Examiner)" และ "ผู้ป่วยจำลอง (Simulated Patient)" ประจำสถานีสอบ
2. ห้ามบอกเฉลย ห้ามหลุดบอกชื่อโรคจริง ห้ามบอกปัญหา DTP หรือบอกคำตอบที่ถูกต้องล่วงหน้าเด็ดขาด! ผู้เข้าสอบต้องเป็นคนค้นหาและวินิจฉัยเอง
3. เมื่อผู้เข้าสอบซักประวัติ/คุยกับคนไข้: ให้สวมบท "ผู้ป่วยจำลอง (SP)" ตอบเฉพาะอาการ ยาเดิม และข้อมูลตามที่โจทย์ระบุไว้เท่านั้น ตอบเสมือนคนไข้จริง
4. เมื่อผู้เข้าสอบขอตรวจร่างกายหรือขอผลแล็บ: ให้สวมบท "อาจารย์คุมสอบ" รายงานตัวเลข Vitals/Lab ตามที่มีในโจทย์
5. เมื่อผู้เข้าสอบตอบหรือให้คำแนะนำ: ให้รับฟังอย่างสุขุม และอาจถามจี้หรือกระตุ้นให้คิดตามบทผู้คุมสอบ แต่ไม่เฉลยคำตอบ
6. ภาษาพูดสุภาพ เป็นทางการ สมจริง กระชับ 2-4 ประโยค
==================================================
[ข้อมูลสถานีสอบและเคสผู้ป่วยปัจจุบัน]
${caseContext || '(ยังไม่มีข้อมูลเคส)'}
==================================================`;
      }

      const userPrompt = `${recentHistoryText ? `[บทสนทนาก่อนหน้าในสถานีนี้]\n${recentHistoryText}\n\n` : ''}ข้อความล่าสุดจากผู้เข้าสอบ: "${userText}"`;

      this.showAITyping();

      // Multi-Key Pool failover loop
      if (!this._geminiKeyPool) {
        const _dec = (b) => { try { return atob(b); } catch (_) { return ''; } };
        this._geminiKeyPool = [
          { key: _dec('QVEuQWI4Uk42SW9oZ3NvSlZIdjRlNVBZWEVqUEVYaFZ3MlVQUWJQa1hvdy1iaUdEZGdZWmc='), email: 'Primary Account (rxcu.admin)' },
          { key: _dec('QVEuQWI4Uk42SnZFU056Y01uekN0ajM2aUJ6SEQzd18wTEJaMFR6aU9OeWJOR2RoelRHOUE='), email: 'panittean94@gmail.com' },
          { key: _dec('QVEuQWI4Uk42SVgxY2dOalBMVTROakMwZ0d5SmZXZ0k3Mk96Z0NmZVdCamt3dXAtN1NpY2c='), email: 'rxcu84year5@gmail.com' },
          { key: _dec('QVEuQWI4Uk42SjNNdGRfVGdodDNEcFFoRUsteXl2SGdSNDQ5S0hWenhBTkpUQTUwVDFHZnc='), email: 'rxcu 84' }
        ];
        this._currentKeyIdx = 0;
      }

      const maxAttempts = this._geminiKeyPool.length;
      let lastError = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const currentEntry = this._geminiKeyPool[this._currentKeyIdx];
        const API_KEY = localStorage.getItem('_gemini_api_key') || currentEntry.key;
        const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const payload = {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\n${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: isGuruRole ? 0.3 : 0.7,
              maxOutputTokens: 400
            }
          };

          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            const errBody = await res.text().catch(() => '');
            console.warn(`Gemini API key [${this._currentKeyIdx} - ${currentEntry.email}] failed:`, res.status, errBody);
            if (res.status === 429 || errBody.includes('RESOURCE_EXHAUSTED')) {
              this._currentKeyIdx = (this._currentKeyIdx + 1) % this._geminiKeyPool.length;
              lastError = new Error('QUOTA_EXHAUSTED');
              continue;
            }
            throw new Error(`Gemini API HTTP ${res.status}: ${errBody}`);
          }

          const json = await res.json();
          const candidate = json.candidates && json.candidates[0];
          const replyText = candidate?.content?.parts?.[0]?.text;

          this.removeAITyping();

          if (replyText) {
            this.renderAIMessage(replyText.trim());
            this.incrementAIDailyCount();
            return true;
          } else {
            throw new Error('Empty candidate response');
          }
        } catch (err) {
          lastError = err;
          if (err.name === 'AbortError') {
            console.warn('Gemini request timeout, rotating key...');
            this._currentKeyIdx = (this._currentKeyIdx + 1) % this._geminiKeyPool.length;
            continue;
          }
          if (err.message !== 'QUOTA_EXHAUSTED' && !err.message?.includes('429')) {
            break;
          }
        }
      }

      console.error('callGeminiAI pool error:', lastError);
      this.removeAITyping();
      if (lastError?.name === 'AbortError') {
        this.renderAIMessage('⏳ AI ตอบกลับไม่ทันเวลา (Timeout) กรุณาส่งข้อความอีกครั้งครับ');
      } else if (lastError?.message === 'QUOTA_EXHAUSTED' || (lastError?.message && lastError.message.includes('429'))) {
        this.renderAIMessage('⚠️ โควต้า API ทุก Key ในระบบใช้งานเต็มชั่วคราวครับ พรุ่งนี้ระบบจะรีเซ็ตอัตโนมัติครับ');
      } else {
        this.renderAIMessage(`⚠️ เชื่อมต่อ AI ไม่สำเร็จ: ${lastError?.message || 'โปรดตรวจสอบการเชื่อมต่อ'}`);
      }
      return false;
    },

    initStation(caseIdOrNum, caseDataObj) {
      this.currentStationNum = caseIdOrNum || 1;
      this.activeCaseData = caseDataObj || (window.AppState && AppState.currentCase) || null;

      this.cancelSpeech();
      if (this.isListeningVoice && this.speechRecognition) {
        try { this.speechRecognition.abort(); } catch (_) {}
      }
      this.isListeningVoice = false;

      const micBtnReset = document.getElementById('station-chat-mic-btn');
      if (micBtnReset) micBtnReset.classList.remove('listening');
      const inputReset = document.getElementById('station-chat-input');
      if (inputReset) {
        inputReset.value = '';
        inputReset.placeholder = 'พิมพ์คำถาม หรือกดไมค์ 🎙️ เพื่อพูด...';
      }
      this.removeAITyping();

      this.currentAvatarType = (this.aiRole === 'guru') ? 'guru' : 'prof';
      this.setAIRole(this.aiRole);
      this.updateAIToggleUI();
      this.updateAvatarUI();

      const titleEl = document.getElementById('st-chat-header-title');
      const subtitleEl = document.getElementById('st-chat-header-subtitle');
      if (titleEl) {
        titleEl.textContent = `💬 แชทเคส ${this.currentStationNum}`;
      }
      if (subtitleEl) {
        const titleStr = this.activeCaseData?.title || this.activeCaseData?.disease || 'คลินิก & เภสัชบำบัด';
        subtitleEl.textContent = `${titleStr} • AI Guru พร้อมสนทนา`;
      }

      // Restore messages for this station/case
      const msgContainer = document.getElementById('station-chat-messages');
      if (msgContainer) {
        msgContainer.innerHTML = `
          <div class="st-chat-empty-hint" id="st-chat-empty-placeholder">
            <span style="font-size: 1.5rem; display: block; margin-bottom: 4px;">💬</span>
            ยังไม่มีข้อความสนทนาในเคสนี้<br>
            <span style="font-size: 0.78rem; opacity: 0.8;">พิมพ์คำถาม ถามหลักการ Guideline หรือซักประวัติที่นี่ได้เลยครับ</span>
          </div>`;
      }

      const stationKey = String(this.currentStationNum);
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      const msgs = this.soloMessages[stationKey];
      if (msgs.length > 0) {
        const placeholder = document.getElementById('st-chat-empty-placeholder');
        if (placeholder) placeholder.style.display = 'none';
        msgs.forEach(m => this.renderMessage(m));
      }

      if (this.isOpen) {
        this.resetUnread();
      }
    },

    sendMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const stNum = this.currentStationNum;

      const msgObj = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        senderId: 'local_user',
        senderName: 'ผู้เรียน/นิสิต',
        senderRole: 'examinee',
        senderEmoji: '✍️',
        text: cleanText,
        timestamp: Date.now(),
        stationNumber: stNum
      };

      const stationKey = String(stNum);
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      this.soloMessages[stationKey].push(msgObj);

      const placeholder = document.getElementById('st-chat-empty-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      this.renderMessage(msgObj);

      if (this.aiEnabled) {
        this.callGeminiAI(cleanText);
      }
    },

    sendDrugLabelMessage(data) {
      if (!data || !data.imageData) return;
      const stNum = this.currentStationNum;
      const msgObj = {
        id: 'msg_lbl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        senderId: 'local_user',
        senderName: 'ผู้เรียน/นิสิต',
        senderRole: 'examinee',
        senderEmoji: '🏷️',
        type: 'drug_label',
        labelIndex: data.labelIndex || 1,
        labelName: data.labelName || `ฉลากยา ${data.labelIndex || 1}`,
        imageData: data.imageData,
        text: `🏷️ ส่งใบสั่ง/ฉลากยา: ${data.labelName || 'ฉลากยา RxCU'}`,
        timestamp: Date.now(),
        stationNumber: stNum
      };

      const stationKey = String(stNum);
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      this.soloMessages[stationKey].push(msgObj);

      const placeholder = document.getElementById('st-chat-empty-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      this.renderMessage(msgObj);

      if (!this.isOpen) this.toggleDrawer();
    },

    sendDrawingNoteMessage(data) {
      if (!data || !data.imageData) return;
      const stNum = this.currentStationNum;
      const msgObj = {
        id: 'msg_draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        senderId: 'local_user',
        senderName: 'ผู้เรียน/นิสิต',
        senderRole: 'examinee',
        senderEmoji: '🎨',
        type: 'drawing_note',
        imageData: data.imageData,
        text: `🎨 ส่งภาพวาด/กระดาษทด: เคส ${stNum}`,
        timestamp: Date.now(),
        stationNumber: stNum
      };

      const stationKey = String(stNum);
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      this.soloMessages[stationKey].push(msgObj);

      const placeholder = document.getElementById('st-chat-empty-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      this.renderMessage(msgObj);

      if (!this.isOpen) this.toggleDrawer();
    },

    sendTypedNoteMessage(text) {
      if (!text || !text.trim()) return;
      const cleanText = text.trim();
      const stNum = this.currentStationNum;
      const msgObj = {
        id: 'msg_type_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        senderId: 'local_user',
        senderName: 'ผู้เรียน/นิสิต',
        senderRole: 'examinee',
        senderEmoji: '📝',
        type: 'typed_note',
        noteText: cleanText,
        text: `📝 ส่งโน้ตข้อความ: เคส ${stNum}`,
        timestamp: Date.now(),
        stationNumber: stNum
      };

      const stationKey = String(stNum);
      if (!this.soloMessages[stationKey]) this.soloMessages[stationKey] = [];
      this.soloMessages[stationKey].push(msgObj);

      const placeholder = document.getElementById('st-chat-empty-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      this.renderMessage(msgObj);

      if (!this.isOpen) this.toggleDrawer();
    },

    renderMessage(msg) {
      const container = document.getElementById('station-chat-messages');
      if (!container) return;

      if (msg.id && container.querySelector(`[data-msg-id="${msg.id}"]`)) return;

      const isMine = (msg.senderRole === 'examinee' && !msg.isAi);
      const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      const isDrugLabel = (msg.type === 'drug_label');
      const isDrawNote = (msg.type === 'drawing_note');
      const isTypeNote = (msg.type === 'typed_note');
      const isImage = (isDrugLabel || isDrawNote || !!msg.imageData);

      let cardClass = '';
      if (isDrugLabel) cardClass = 'drug-label-msg';
      else if (isDrawNote) cardClass = 'draw-note-msg';
      else if (isTypeNote) cardClass = 'type-note-msg';

      const msgEl = document.createElement('div');
      msgEl.className = `st-chat-msg ${isMine ? 'mine' : 'theirs'} ${cardClass}`;
      if (msg.id) msgEl.setAttribute('data-msg-id', msg.id);

      let contentHtml = '';
      if (isImage && msg.imageData) {
        const badgeText = isDrugLabel ? `🏷️ ${msg.labelName || 'ฉลากยา RxCU'}` : `🎨 ภาพวาดกระดาษทด`;
        const badgeClass = isDrugLabel ? 'st-chat-label-badge' : 'st-chat-note-badge draw';

        contentHtml = `
          <div class="st-chat-label-card">
            <div class="${badgeClass}">${badgeText}</div>
            <div class="st-chat-label-img-wrap" onclick="openDrugLabelZoomModal('${msg.id}')" title="คลิกเพื่อดูภาพขนาดเต็ม (Zoom)">
              <img src="${msg.imageData}" alt="${badgeText}" class="st-chat-label-img" id="img_${msg.id}">
              <div class="st-chat-label-zoom-hint">🔍 คลิกดูภาพขยาย</div>
            </div>
          </div>
        `;
      } else if (isTypeNote && msg.noteText) {
        const safeNote = String(msg.noteText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        contentHtml = `
          <div style="margin-top: 0.25rem;">
            <div class="st-chat-note-badge type">📝 บันทึกข้อความ (Note)</div>
            <div class="st-chat-type-card-content">${safeNote}</div>
          </div>
        `;
      } else {
        const safeText = String(msg.text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        contentHtml = `<div style="line-height: 1.45;">${safeText}</div>`;
      }

      msgEl.innerHTML = `
        <div class="st-chat-msg-sender" style="${isMine ? 'justify-content: flex-end;' : ''}">
          <span>${msg.senderEmoji || '👤'}</span>
          <span>${msg.senderName || 'ผู้ใช้'}</span>
          <span style="opacity: 0.65; margin-left: 2px;">${timeStr}</span>
        </div>
        ${contentHtml}
      `;

      container.appendChild(msgEl);
      container.scrollTop = container.scrollHeight;
    },

    toggleDrawer() {
      this.isOpen = !this.isOpen;
      const drawer = document.getElementById('station-chat-drawer');
      if (drawer) {
        drawer.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) {
          initStationChatDragAndResize();
          applyStoredStationChatLayout();
          this.resetUnread();
          this.setAIRole(this.aiRole);
          this.updateAIToggleUI();
          const input = document.getElementById('station-chat-input');
          if (input) input.focus();
          const container = document.getElementById('station-chat-messages');
          if (container) container.scrollTop = container.scrollHeight;
        }
      }
    },

    resetUnread() {
      this.unreadCount = 0;
      this.updateUnreadUI();
    },

    updateUnreadUI() {
      const badge = document.getElementById('unified-tools-unread-badge');
      const menuBadge = document.getElementById('menu-chat-unread-badge');
      const countText = this.unreadCount > 99 ? '99+' : this.unreadCount;
      if (badge) {
        if (this.unreadCount > 0) {
          badge.textContent = countText;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
      if (menuBadge) {
        if (this.unreadCount > 0) {
          menuBadge.textContent = countText;
          menuBadge.style.display = 'inline-block';
        } else {
          menuBadge.style.display = 'none';
        }
      }
    },

    setTyping() {}
  };

  window.StationChatController = StationChatController;

  // Window Global Callbacks for DOM triggers
  window.toggleStationChatDrawer = function () {
    StationChatController.toggleDrawer();
  };

  window.toggleAIChatMode = function () {
    StationChatController.toggleAI();
  };

  window.setAIChatRole = function (role) {
    StationChatController.setAIRole(role);
  };

  window.cycleAIAvatar = function () {
    StationChatController.cycleAvatar();
  };

  window.toggleAISound = function () {
    StationChatController.toggleSound();
  };

  window.toggleStationVoiceMic = function () {
    StationChatController.toggleVoiceMic();
  };

  window.sendQuickChatMessage = function (txt) {
    StationChatController.sendMessage(txt);
  };

  window.sendStationChatFromInput = function () {
    const inp = document.getElementById('station-chat-input');
    if (!inp) return;
    const val = inp.value;
    if (!val || !val.trim()) return;
    StationChatController.sendMessage(val);
    inp.value = '';
  };

  window.handleStationChatKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sendStationChatFromInput();
    }
  };

  window.handleStationChatTyping = function () {};

  // Unified Action Menu Handlers
  window.toggleUnifiedExamToolsMenu = function (e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('unified-exam-tools-menu');
    const fab = document.getElementById('btn-unified-exam-tools');
    if (!menu) return;
    const isOpen = menu.style.display === 'flex';
    menu.style.display = isOpen ? 'none' : 'flex';
    if (fab) {
      if (!isOpen) fab.classList.add('active');
      else fab.classList.remove('active');
    }
  };

  window.closeUnifiedExamToolsMenu = function () {
    const menu = document.getElementById('unified-exam-tools-menu');
    const fab = document.getElementById('btn-unified-exam-tools');
    if (menu) menu.style.display = 'none';
    if (fab) fab.classList.remove('active');
  };

  window.openChatFromMenu = function () {
    window.closeUnifiedExamToolsMenu();
    if (!StationChatController.isOpen) {
      StationChatController.toggleDrawer();
    }
  };

  window.openScratchpadFromMenu = function () {
    window.closeUnifiedExamToolsMenu();
    if (typeof toggleViewerScratchpad === 'function') {
      toggleViewerScratchpad('draw');
    } else if (window.Scratchpad && typeof window.Scratchpad.toggle === 'function') {
      window.Scratchpad.toggle(null, null, 'draw');
    }
  };

  window.toggleMaximizeStationChat = function () {
    const drawer = document.getElementById('station-chat-drawer');
    const btn = document.getElementById('btn-maximize-chat');
    if (!drawer) return;
    const isMax = drawer.classList.toggle('maximized');
    if (btn) btn.textContent = isMax ? '🗗' : '⛶';
    if (!isMax) {
      applyStoredStationChatLayout();
    }
    const container = document.getElementById('station-chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
  };

  window.openDrugLabelZoomModal = function (msgId) {
    const img = document.getElementById('img_' + msgId);
    if (!img) return;
    let modal = document.getElementById('drug-label-zoom-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'drug-label-zoom-modal';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.background = 'rgba(15, 23, 42, 0.88)';
      modal.style.backdropFilter = 'blur(6px)';
      modal.style.zIndex = '100000';
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.padding = '1.5rem';
      modal.style.cursor = 'zoom-out';
      modal.onclick = () => { modal.style.display = 'none'; };
      modal.innerHTML = `
        <div style="position:relative; max-width:92vw; max-height:88vh; background:#fff; padding:10px; border-radius:12px; box-shadow:0 24px 48px rgba(0,0,0,0.4);" onclick="event.stopPropagation()">
          <button type="button" style="position:absolute; top:-12px; right:-12px; width:32px; height:32px; border-radius:50%; background:#ef4444; color:#fff; border:2px solid #fff; font-size:1rem; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3);" onclick="document.getElementById('drug-label-zoom-modal').style.display='none'">✕</button>
          <img id="drug-label-zoom-img" src="" style="display:block; max-width:100%; max-height:82vh; object-fit:contain; border-radius:6px;">
        </div>
      `;
      document.body.appendChild(modal);
    }
    const zoomImg = document.getElementById('drug-label-zoom-img');
    if (zoomImg) zoomImg.src = img.src;
    modal.style.display = 'flex';
  };

  // Drag & Resize Controller
  const ST_CHAT_LAYOUT_KEY = 'ple_ospe_station_chat_layout_v2';

  function initStationChatDragAndResize() {
    const drawer = document.getElementById('station-chat-drawer');
    const header = document.getElementById('st-chat-header');
    if (!drawer || !header) return;
    if (drawer.dataset.dragInit === 'true') return;
    drawer.dataset.dragInit = 'true';

    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    header.addEventListener('pointerdown', (e) => {
      if (drawer.classList.contains('maximized')) return;
      if (window.innerWidth <= 768) return;
      if (e.target.closest('button')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = drawer.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      drawer.style.left = startLeft + 'px';
      drawer.style.top = startTop + 'px';
      drawer.style.right = 'auto';
      drawer.style.bottom = 'auto';
      drawer.classList.add('dragging');

      try { header.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });

    header.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxLeft = window.innerWidth - drawer.offsetWidth - 8;
      const maxTop = window.innerHeight - drawer.offsetHeight - 8;
      const newLeft = Math.max(8, Math.min(maxLeft, startLeft + dx));
      const newTop = Math.max(8, Math.min(maxTop, startTop + dy));
      drawer.style.left = newLeft + 'px';
      drawer.style.top = newTop + 'px';
    });

    const stopDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      drawer.classList.remove('dragging');
      try { header.releasePointerCapture(e.pointerId); } catch (_) {}
      saveStationChatLayout();
    };

    header.addEventListener('pointerup', stopDrag);
    header.addEventListener('pointercancel', stopDrag);

    // 8-Direction Resizers
    const resizers = drawer.querySelectorAll('.st-chat-resizer');
    resizers.forEach(resizer => {
      let isResizing = false;
      let dir = resizer.getAttribute('data-direction') || 'br';
      let rStartX = 0, rStartY = 0;
      let rStartW = 0, rStartH = 0;
      let rStartL = 0, rStartT = 0;

      resizer.addEventListener('pointerdown', (e) => {
        if (drawer.classList.contains('maximized')) return;
        if (window.innerWidth <= 768) return;
        isResizing = true;
        rStartX = e.clientX;
        rStartY = e.clientY;
        const rect = drawer.getBoundingClientRect();
        rStartW = rect.width;
        rStartH = rect.height;
        rStartL = rect.left;
        rStartT = rect.top;

        drawer.style.left = rStartL + 'px';
        drawer.style.top = rStartT + 'px';
        drawer.style.right = 'auto';
        drawer.style.bottom = 'auto';
        drawer.classList.add('resizing');

        try { resizer.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
        e.stopPropagation();
      });

      resizer.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - rStartX;
        const dy = e.clientY - rStartY;
        const minW = 320, minH = 340;
        const maxW = window.innerWidth - 32;
        const maxH = window.innerHeight - 32;

        let newW = rStartW, newH = rStartH;
        let newL = rStartL, newT = rStartT;

        if (dir.includes('r')) newW = Math.min(maxW, Math.max(minW, rStartW + dx));
        if (dir.includes('b')) newH = Math.min(maxH, Math.max(minH, rStartH + dy));
        if (dir.includes('l')) {
          const potW = rStartW - dx;
          if (potW >= minW && potW <= maxW) { newW = potW; newL = rStartL + dx; }
        }
        if (dir.includes('t')) {
          const potH = rStartH - dy;
          if (potH >= minH && potH <= maxH) { newH = potH; newT = rStartT + dy; }
        }

        drawer.style.width = Math.round(newW) + 'px';
        drawer.style.height = Math.round(newH) + 'px';
        drawer.style.left = Math.round(newL) + 'px';
        drawer.style.top = Math.round(newT) + 'px';
      });

      const stopResize = (e) => {
        if (!isResizing) return;
        isResizing = false;
        drawer.classList.remove('resizing');
        try { resizer.releasePointerCapture(e.pointerId); } catch (_) {}
        saveStationChatLayout();
      };

      resizer.addEventListener('pointerup', stopResize);
      resizer.addEventListener('pointercancel', stopResize);
    });
  }

  function saveStationChatLayout() {
    const drawer = document.getElementById('station-chat-drawer');
    if (!drawer || drawer.classList.contains('maximized')) return;
    if (window.innerWidth <= 768) return;
    try {
      const rect = drawer.getBoundingClientRect();
      const layout = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        left: Math.round(rect.left),
        top: Math.round(rect.top)
      };
      localStorage.setItem(ST_CHAT_LAYOUT_KEY, JSON.stringify(layout));
    } catch (_) {}
  }

  function applyStoredStationChatLayout() {
    if (window.innerWidth <= 768) return;
    const drawer = document.getElementById('station-chat-drawer');
    if (!drawer || drawer.classList.contains('maximized')) return;

    try {
      const stored = localStorage.getItem(ST_CHAT_LAYOUT_KEY);
      if (stored) {
        const layout = JSON.parse(stored);
        if (layout && layout.width && layout.height) {
          drawer.style.width = Math.min(window.innerWidth - 32, Math.max(320, layout.width)) + 'px';
          drawer.style.height = Math.min(window.innerHeight - 32, Math.max(340, layout.height)) + 'px';
          if (layout.left !== undefined && layout.top !== undefined) {
            const maxLeft = window.innerWidth - drawer.offsetWidth - 8;
            const maxTop = window.innerHeight - drawer.offsetHeight - 8;
            const left = Math.max(8, Math.min(maxLeft, layout.left));
            const top = Math.max(8, Math.min(maxTop, layout.top));
            drawer.style.left = left + 'px';
            drawer.style.top = top + 'px';
            drawer.style.right = 'auto';
            drawer.style.bottom = 'auto';
          }
        }
      }
    } catch (_) {}
  }

  function setupMobileChatDrag() {
    const handle = document.getElementById('st-chat-mobile-handle');
    const drawer = document.getElementById('station-chat-drawer');
    if (!handle || !drawer) return;
    if (handle.dataset.touchInit === 'true') return;
    handle.dataset.touchInit = 'true';

    let isDragging = false;
    let startY = 0;
    let startHeight = 0;

    handle.addEventListener('pointerdown', function (e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      isDragging = true;
      startY = e.clientY;
      startHeight = drawer.offsetHeight;
      drawer.style.transition = 'none';
    });

    handle.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      const dy = e.clientY - startY;
      const minH = 140;
      const maxH = window.innerHeight * 0.94;
      const newH = Math.max(minH, Math.min(maxH, startHeight - dy));
      drawer.style.height = Math.round(newH) + 'px';
    });

    const stopMobileDrag = function () {
      if (!isDragging) return;
      isDragging = false;
      drawer.style.transition = 'height 0.22s cubic-bezier(0.16, 1, 0.3, 1)';

      const currentH = drawer.offsetHeight;
      const winH = window.innerHeight;

      if (currentH < 180) {
        StationChatController.toggleDrawer();
      } else if (currentH > winH * 0.72) {
        drawer.style.height = '94vh';
      } else {
        drawer.style.height = '52vh';
      }

      setTimeout(() => {
        drawer.style.transition = '';
      }, 250);
    };

    handle.addEventListener('pointerup', stopMobileDrag);
    handle.addEventListener('pointercancel', stopMobileDrag);
  }

  // Auto-init on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initStationChatDragAndResize();
      setupMobileChatDrag();
    });
  } else {
    setTimeout(() => {
      initStationChatDragAndResize();
      setupMobileChatDrag();
    }, 200);
  }

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('unified-exam-tools-menu');
    const fab = document.getElementById('btn-unified-exam-tools');
    if (menu && menu.style.display === 'flex') {
      if (!menu.contains(e.target) && (!fab || !fab.contains(e.target))) {
        window.closeUnifiedExamToolsMenu();
      }
    }
  });

})();
