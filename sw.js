// offline cache for musical-scale-impromptu
// bump CACHE together with the ?v= asset version on every deploy
const CACHE = 'msi-v39';

const CORE = [
      './',
      './index.html',
      './styles.css?v=39',
      './script.js?v=39',
      './manifest.json',
      './icon-192.png',
      './icon-512.png',
      './og.jpg',
      './blog/',
      './blog/index.html',
      './blog/why-music-matters.html',
      './blog/dictionary.html',
      './blog/circle-of-fifths.html',
      './blog/find-the-key.html',
      './blog/enharmonics.html',
      './blog/seven-modes.html',
      './blog/four-chords.html',
      './blog/pentatonic.html',
      './blog/rhythm-basics.html',
      './blog/ear-training.html',
      './blog/ten-minutes.html'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== location.origin) return;

    // pages: network first so a deploy always wins when online
    if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                    return res;
                })
                .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
        );
        return;
    }

    // assets: cache first, refresh in the background
    e.respondWith(
        caches.match(e.request).then(hit => {
            const refresh = fetch(e.request)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                    return res;
                })
                .catch(() => hit);
            return hit || refresh;
        })
    );
});
