// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  console.log('sw.js install')
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  console.log('sw.js activate')
});

fetch('/data.json').then(r=>r.json()).then(data=>{
  console.log('sw.js data=', data);
});