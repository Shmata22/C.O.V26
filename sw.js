const CACHE_NAME = 'stats-cov-pwa-COV26';
const APP_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './logo-cov.webp',
  './MaillotDomicile.webp',
  './MaillotExterier.webp',
  './MaillotThird.webp',
  './Avatar_N1.webp',
  './Avatar_N2.webp',
  './Avatar_B1.webp',
  './Avatar_B2.webp',
  './Avatar_J1.webp',
  './Avatar_J2.webp',
  './Avatar_BG1.webp',
  './Avatar_BG2.webp',
  './Avatar_G1.webp',
  './Avatar_G2.webp',
  './Avatar_JG1.webp',
  './Avatar_JG2.webp',
  './MVP_B1.webp',
  './MVP_B2.webp',
  './MVP_J1.webp',
  './MVP_J2.webp',
  './MVP_1.webp',
  './MVP_2.webp',
  './ChampionTrophy.webp',
  './Champion_1.webp',
  './Champion_2.webp',
  './GoldenBootTrophy.webp',
  './MVPTrophy.webp',
  './Scorer_1.webp',
  './Scorer_2.webp',
  './PlaymakerTrophy.webp',
  './Playmaker_1.webp',
  './Playmaker_2.webp',
  './ModelCompo.png',
  './Terrain.webp',
  './share-compo-template.webp',
  './PlayerCardTemplate.png',
  './BallonOrCardTemplate.png',
  './TrophyRoom.webp',
  './TrophyRoomLayout.png',
  './TrophyRoomShowcase.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => cached))
  );
});
