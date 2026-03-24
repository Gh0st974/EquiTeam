// 📄 Fichier : service-worker.js
// 🎯 Rôle : Cache offline PWA — mise en cache des ressources statiques

const CACHE_NAME = 'equiteam-v1';

// Ressources à mettre en cache au démarrage
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/layout.css',
  './css/responsive.css',
  './css/components/dashboard.css',
  './css/components/groups.css',
  './css/components/activities.css',
  './css/components/session.css',
  './css/components/history.css',
  './css/components/modals.css',
  './js/config.js',
  './js/storage.js',
  './js/ui.js',
  './js/groups/groups.js',
  './js/groups/groups.ui.js',
  './js/students/students.js',
  './js/students/students.ui.js',
  './js/students/students.csv.js',
  './js/activities/activities.js',
  './js/activities/activities.ui.js',
  './js/session/algo.js',
  './js/session/session.js',
  './js/session/session.ui.js',
  './js/session/teams.ui.js',
  './js/history/history.js',
  './js/history/history.ui.js',
  './js/app.js'
];

// Installation : mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : stratégie Cache First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
