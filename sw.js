/**
 * PLE-CC2 OSPE Practice System — Service Worker
 * File: sw.js
 * ====================================================
 * จัดการ Caching ทรัพยากรระบบเพื่อเพิ่มความเร็วในการโหลด (Preloading) 
 * และสนับสนุนการเข้าใช้งานแบบออฟไลน์ (Offline Mode)
 */

const CACHE_NAME = 'ple-cc2-ospe-v1.2.5';
const ASSETS = [
  './',
  './index.html',
  './case-library.html',
  './case-viewer.html',
  './exam-simulation.html',
  './style.css',
  './app.js',
  './case-data-offline.js',
  './case-details-offline.js'
];

// 1. Install Event: บันทึก Cache ของทรัพยากรตั้งต้น
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing & Pre-caching static assets...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // ใช้ Promise.allSettled เพื่อป้องกันผลกระทบหากไฟล์ใดไฟล์หนึ่งหายไป
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`[Service Worker] Failed to pre-cache: ${asset}`, err);
          });
        })
      ).then(() => {
        console.log('[Service Worker] Pre-caching complete.');
        return self.skipWaiting();
      });
    })
  );
});

// 2. Activate Event: ล้าง Cache เก่าที่ไม่ได้ใช้งาน
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating & Cleaning old caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intercept และให้บริการข้อมูลแบบ Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // กรองเฉพาะคำสั่ง GET เท่านั้น
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ยกเว้น API การเรียกข้อมูลสดจาก Google Apps Script และระบบ Realtime Database ของ Firebase
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // สร้างการดึงข้อมูลจากเครือข่ายคู่ขนานกันไปเพื่ออัปเดต Cache ในเบื้องหลัง
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
          console.warn('[Service Worker] Network request failed (serving cached/offline):', err);
        });

        // ส่งคืนข้อมูลแคชทันทีหากมี (0ms) หรือดึงสดถ้ายังไม่มีในแคช
        return cachedResponse || fetchPromise;
      });
    })
  );
});
